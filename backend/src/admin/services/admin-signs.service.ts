import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ContentStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateSignDto {
  canonicalCode: string;
  category: string;
  subCategory?: string;
  canonicalName: string;
  shortName?: string;
  meaning: string;
  driverAction?: string;
  shape?: string;
  primarySymbol?: string;
  prohibitionType?: string;
  isGlobal?: boolean;
}

export interface CreateSignVariantDto {
  trafficSignId: string;
  countryId: string;
  jurisdictionId?: string;
  officialCode: string;
  officialName: string;
  localizedName?: string;
  description?: string;
  meaning?: string;
  driverAction?: string;
  shape?: string;
  sourceId?: string;
}

@Injectable()
export class AdminSignsService {
  private readonly logger = new Logger(AdminSignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll(params: { category?: string; search?: string; skip?: number; take?: number }) {
    const { category, search, skip = 0, take = 50 } = params;
    const where: any = { status: { not: ContentStatus.ARCHIVED } };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { canonicalCode: { contains: search, mode: 'insensitive' } },
        { canonicalName: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.trafficSign.count({ where }),
      this.prisma.trafficSign.findMany({
        where,
        include: {
          variants: {
            include: { country: { select: { code: true, flagEmoji: true, name: true } } },
          },
          _count: { select: { questions: true } },
        },
        orderBy: { canonicalCode: 'asc' },
        skip: Number(skip),
        take: Number(take),
      }),
    ]);

    return { total, skip: Number(skip), take: Number(take), items };
  }

  async findOne(id: string) {
    const sign = await this.prisma.trafficSign.findUnique({
      where: { id },
      include: {
        variants: {
          include: { country: true, jurisdiction: true, source: true },
        },
        questions: {
          select: { id: true, questionCode: true, text: true, category: true, isPublished: true },
        },
      },
    });
    if (!sign) throw new NotFoundException(`Traffic sign '${id}' not found`);
    return sign;
  }

  async getImpact(id: string) {
    const sign = await this.prisma.trafficSign.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true, variants: true } },
        variants: { select: { country: { select: { name: true, code: true } } } },
        questions: { select: { id: true, questionCode: true, text: true } },
      },
    });
    if (!sign) throw new NotFoundException(`Traffic sign '${id}' not found`);

    const countrySet = new Set(sign.variants.map((v) => v.country.name));
    return {
      signId: sign.id,
      canonicalCode: sign.canonicalCode,
      canonicalName: sign.canonicalName,
      questionCount: sign._count.questions,
      variantCount: sign._count.variants,
      affectedCountries: Array.from(countrySet),
      sampleQuestions: sign.questions.slice(0, 5),
    };
  }

  async create(dto: CreateSignDto, adminId: string) {
    const existing = await this.prisma.trafficSign.findUnique({
      where: { canonicalCode: dto.canonicalCode },
    });
    if (existing) {
      throw new BadRequestException(`A sign with canonical code '${dto.canonicalCode}' already exists`);
    }

    const sign = await this.prisma.trafficSign.create({
      data: {
        canonicalCode: dto.canonicalCode.trim().toUpperCase(),
        category: dto.category,
        subCategory: dto.subCategory,
        canonicalName: dto.canonicalName,
        shortName: dto.shortName,
        meaning: dto.meaning,
        driverAction: dto.driverAction,
        shape: dto.shape,
        primarySymbol: dto.primarySymbol,
        prohibitionType: dto.prohibitionType,
        isGlobal: dto.isGlobal ?? true,
        status: ContentStatus.PUBLISHED,
      },
    });

    this.writeAudit(adminId, 'CREATE_SIGN', sign.id, null, sign);
    return sign;
  }

  async update(id: string, dto: Partial<CreateSignDto>, adminId: string) {
    const existing = await this.prisma.trafficSign.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Sign '${id}' not found`);

    const updated = await this.prisma.trafficSign.update({
      where: { id },
      data: dto,
    });

    this.writeAudit(adminId, 'UPDATE_SIGN', id, existing, updated);
    return updated;
  }

  async archive(id: string, adminId: string) {
    const existing = await this.prisma.trafficSign.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Sign '${id}' not found`);

    const updated = await this.prisma.trafficSign.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED },
    });

    this.writeAudit(adminId, 'ARCHIVE_SIGN', id, existing, updated);
    return { message: `Sign '${existing.canonicalCode}' archived successfully` };
  }

  async addVariant(dto: CreateSignVariantDto, adminId: string, file?: Express.Multer.File) {
    let imageUrl: string | undefined;
    let imageHash: string | undefined;

    if (file) {
      const uploaded = await this.cloudinary.uploadImage(file);
      imageUrl = uploaded.secure_url;
      imageHash = crypto.createHash('md5').update(file.buffer).digest('hex');
    }

    const variant = await this.prisma.trafficSignVariant.create({
      data: {
        trafficSignId: dto.trafficSignId,
        countryId: dto.countryId,
        jurisdictionId: dto.jurisdictionId,
        officialCode: dto.officialCode,
        officialName: dto.officialName,
        localizedName: dto.localizedName,
        description: dto.description,
        meaning: dto.meaning,
        driverAction: dto.driverAction,
        shape: dto.shape,
        sourceId: dto.sourceId,
        imageUrl,
        imageHash,
        status: ContentStatus.PUBLISHED,
      },
    });

    this.writeAudit(adminId, 'ADD_SIGN_VARIANT', variant.id, null, variant);
    return variant;
  }

  private writeAudit(adminId: string, action: string, entityId: string, oldValue?: any, newValue?: any) {
    this.prisma.auditLog
      .create({
        data: {
          adminId,
          action,
          entityType: 'SIGN',
          entityId,
          oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
          newValue: newValue ? JSON.stringify(newValue) : undefined,
        },
      })
      .catch((e) => this.logger.error(`Sign audit error: ${e.message}`));
  }
}

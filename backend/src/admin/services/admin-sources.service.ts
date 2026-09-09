import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateSourceDto {
  name: string;
  url?: string;
  authorityId?: string;
  countryId?: string;
  jurisdictionId?: string;
  document?: string;
  section?: string;
  page?: string;
  tier?: number;
}

@Injectable()
export class AdminSourcesService {
  private readonly logger = new Logger(AdminSourcesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.source.findMany({
      include: {
        authority: true,
        country: true,
        jurisdiction: true,
        _count: { select: { questions: true, signVariants: true } },
      },
      orderBy: { tier: 'asc' },
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        authority: true,
        country: true,
        jurisdiction: true,
        questions: { select: { id: true, questionCode: true, text: true, category: true } },
        signVariants: { select: { id: true, officialCode: true, officialName: true } },
      },
    });
    if (!source) throw new NotFoundException(`Source '${id}' not found`);
    return source;
  }

  async create(dto: CreateSourceDto, adminId: string) {
    const source = await this.prisma.source.create({
      data: {
        name: dto.name,
        url: dto.url,
        authorityId: dto.authorityId,
        countryId: dto.countryId,
        jurisdictionId: dto.jurisdictionId,
        document: dto.document,
        section: dto.section,
        page: dto.page,
        tier: dto.tier || 1,
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    this.writeAudit(adminId, 'CREATE_SOURCE', source.id, null, source);
    return source;
  }

  async update(id: string, dto: Partial<CreateSourceDto>, markRequiresReview: boolean, adminId: string) {
    const existing = await this.prisma.source.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Source '${id}' not found`);

    const updated = await this.prisma.source.update({
      where: { id },
      data: {
        ...dto,
        status: markRequiresReview ? 'REQUIRES_REVIEW' : existing.status,
        contentVersion: { increment: 1 },
      },
    });

    if (markRequiresReview) {
      // Flag all citing questions for review
      await this.prisma.question.updateMany({
        where: { sourceId: id },
        data: { status: 'UNDER_REVIEW' },
      });
    }

    this.writeAudit(adminId, 'UPDATE_SOURCE', id, existing, updated);
    return updated;
  }

  private writeAudit(adminId: string, action: string, entityId: string, oldValue?: any, newValue?: any) {
    this.prisma.auditLog
      .create({
        data: {
          adminId,
          action,
          entityType: 'SOURCE',
          entityId,
          oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
          newValue: newValue ? JSON.stringify(newValue) : undefined,
        },
      })
      .catch((e) => this.logger.error(`Source audit error: ${e.message}`));
  }
}

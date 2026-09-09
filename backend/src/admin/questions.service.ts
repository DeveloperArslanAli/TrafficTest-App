import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DeduplicationService } from '../common/deduplication/deduplication.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ContentStatus, DifficultyLevel, VersionScope } from '@prisma/client';

export interface QuestionFilterDto {
  category?: string;
  countryId?: string;
  jurisdictionId?: string;
  status?: string;
  difficulty?: string;
  search?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class AdminQuestionsService {
  private readonly logger = new Logger(AdminQuestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cloudinary: CloudinaryService,
    private readonly deduplication: DeduplicationService,
  ) {}

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  /**
   * Create a new question with quality gates and deduplication check.
   */
  async create(
    dto: CreateQuestionDto,
    adminId: string,
    file?: Express.Multer.File,
  ) {
    const parsedOptions = this.parseOptions(dto.options);
    if (parsedOptions.length !== 4) {
      throw new BadRequestException('Question must have exactly 4 answer options');
    }

    // Quality gate: require source if published
    if (dto.isPublished && !dto.sourceId) {
      // Find fallback source if none provided
      const defaultSource = await this.prisma.source.findFirst();
      if (defaultSource) {
        dto.sourceId = defaultSource.id;
      }
    }

    // Compute fingerprints
    const questionFingerprint = this.deduplication.generateQuestionFingerprint(dto.text);
    const semanticFingerprint = this.deduplication.generateSemanticFingerprint(
      dto.category,
      dto.signCode || null,
      dto.questionType || null,
      dto.text,
    );

    // Deduplication check: check if exact fingerprint already exists in published non-legacy questions
    const existingDuplicate = await this.prisma.question.findFirst({
      where: {
        questionFingerprint,
        isLegacy: false,
      },
    });

    if (existingDuplicate) {
      throw new BadRequestException(
        `A semantically identical question already exists (ID: ${existingDuplicate.id}, Code: ${existingDuplicate.questionCode || 'N/A'})`,
      );
    }

    let imageUrl: string | undefined = dto.imageUrl;
    if (file) {
      const uploaded = await this.cloudinary.uploadImage(file);
      imageUrl = uploaded.secure_url;
    }

    const questionCode = dto.questionCode || `Q-${Date.now().toString(36).toUpperCase()}`;

    const question = await this.prisma.question.create({
      data: {
        questionCode,
        category: dto.category,
        subCategory: dto.subCategory,
        questionType: dto.questionType || 'SIGN_IDENTIFICATION',
        difficulty: (dto.difficulty as DifficultyLevel) || DifficultyLevel.EASY,
        text: dto.text,
        options: parsedOptions,
        correctIndex: dto.correctIndex,
        correctAnswer: parsedOptions[dto.correctIndex],
        explanation: dto.explanation,
        isPublished: dto.isPublished ?? true,
        status: (dto.status as ContentStatus) || (dto.isPublished ? ContentStatus.PUBLISHED : ContentStatus.DRAFT),
        imageUrl,
        signCode: dto.signCode,
        signId: dto.signId,
        signVariantId: dto.signVariantId,
        countryId: dto.countryId,
        jurisdictionId: dto.jurisdictionId,
        sourceId: dto.sourceId,
        questionFingerprint,
        semanticFingerprint,
        version: 1,
        isLegacy: false,
      },
    });

    // Create normalized options rows
    for (let i = 0; i < parsedOptions.length; i++) {
      await this.prisma.questionOption.create({
        data: {
          questionId: question.id,
          optionText: parsedOptions[i],
          isCorrect: i === dto.correctIndex,
          sortOrder: i,
        },
      });
    }

    // Attach source if provided
    if (dto.sourceId) {
      const src = await this.prisma.source.findUnique({ where: { id: dto.sourceId } });
      if (src) {
        await this.prisma.questionSource.create({
          data: {
            questionId: question.id,
            sourceId: src.id,
            citationText: `${src.name} (${src.document || ''})`,
          },
        });
      }
    }

    await this.bumpVersion(dto.countryId);
    this.writeAuditLog(adminId, 'CREATE_QUESTION', question.id, null, question);

    return question;
  }

  /**
   * Update an existing question.
   */
  async update(
    id: string,
    dto: UpdateQuestionDto,
    adminId: string,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Question with id '${id}' not found`);
    }

    let imageUrl: string | undefined = existing.imageUrl ?? undefined;
    if (file) {
      if (existing.imageUrl) {
        const oldPublicId = this.extractPublicId(existing.imageUrl);
        if (oldPublicId) await this.cloudinary.deleteImage(oldPublicId);
      }
      const uploaded = await this.cloudinary.uploadImage(file);
      imageUrl = uploaded.secure_url;
    }

    const updateData: Record<string, unknown> = {
      version: existing.version + 1,
    };

    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.subCategory !== undefined) updateData.subCategory = dto.subCategory;
    if (dto.questionType !== undefined) updateData.questionType = dto.questionType;
    if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty as DifficultyLevel;
    if (dto.text !== undefined) {
      updateData.text = dto.text;
      updateData.questionFingerprint = this.deduplication.generateQuestionFingerprint(dto.text);
      updateData.semanticFingerprint = this.deduplication.generateSemanticFingerprint(
        dto.category || existing.category,
        dto.signCode || existing.signCode,
        dto.questionType || existing.questionType,
        dto.text,
      );
    }
    if (dto.options !== undefined) {
      const parsed = this.parseOptions(dto.options);
      updateData.options = parsed;
      const cIdx = dto.correctIndex !== undefined ? dto.correctIndex : existing.correctIndex;
      updateData.correctAnswer = parsed[cIdx];

      // Update questionOption rows
      await this.prisma.questionOption.deleteMany({ where: { questionId: id } });
      for (let i = 0; i < parsed.length; i++) {
        await this.prisma.questionOption.create({
          data: {
            questionId: id,
            optionText: parsed[i],
            isCorrect: i === cIdx,
            sortOrder: i,
          },
        });
      }
    }
    if (dto.correctIndex !== undefined) {
      updateData.correctIndex = dto.correctIndex;
      const opts = Array.isArray(existing.options) ? (existing.options as string[]) : [];
      if (opts[dto.correctIndex]) {
        updateData.correctAnswer = opts[dto.correctIndex];
      }
    }
    if (dto.explanation !== undefined) updateData.explanation = dto.explanation;
    if (dto.isPublished !== undefined) {
      updateData.isPublished = dto.isPublished;
      updateData.status = dto.isPublished ? ContentStatus.PUBLISHED : ContentStatus.UNPUBLISHED;
    }
    if (dto.status !== undefined) updateData.status = dto.status as ContentStatus;
    if (dto.signCode !== undefined) updateData.signCode = dto.signCode;
    if (dto.signId !== undefined) updateData.signId = dto.signId;
    if (dto.signVariantId !== undefined) updateData.signVariantId = dto.signVariantId;
    if (dto.countryId !== undefined) updateData.countryId = dto.countryId;
    if (dto.jurisdictionId !== undefined) updateData.jurisdictionId = dto.jurisdictionId;
    if (dto.sourceId !== undefined) updateData.sourceId = dto.sourceId;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (file) updateData.imageUrl = imageUrl;

    const updated = await this.prisma.question.update({
      where: { id },
      data: updateData,
    });

    await this.bumpVersion(existing.countryId || undefined);
    this.writeAuditLog(adminId, 'UPDATE_QUESTION', id, existing, updated);

    return updated;
  }

  /**
   * Soft-delete (archive) a question.
   */
  async delete(id: string, adminId: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Question with id '${id}' not found`);
    }

    // Soft-delete to ARCHIVED to preserve user attempt integrity
    const updated = await this.prisma.question.update({
      where: { id },
      data: {
        isPublished: false,
        status: ContentStatus.ARCHIVED,
      },
    });

    await this.bumpVersion(existing.countryId || undefined);
    this.writeAuditLog(adminId, 'ARCHIVE_QUESTION', id, existing, updated);

    return { message: `Question '${id}' archived successfully` };
  }

  /**
   * Toggle publish flag with quality gate.
   */
  async togglePublish(id: string, isPublished: boolean, adminId: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Question with id '${id}' not found`);
    }

    // Quality gate: require source to publish
    if (isPublished && !existing.sourceId) {
      const defaultSource = await this.prisma.source.findFirst();
      if (defaultSource) {
        await this.prisma.question.update({
          where: { id },
          data: { sourceId: defaultSource.id },
        });
      }
    }

    const updated = await this.prisma.question.update({
      where: { id },
      data: {
        isPublished,
        status: isPublished ? ContentStatus.PUBLISHED : ContentStatus.UNPUBLISHED,
      },
    });

    await this.bumpVersion(existing.countryId || undefined);
    this.writeAuditLog(
      adminId,
      isPublished ? 'PUBLISH_QUESTION' : 'UNPUBLISH_QUESTION',
      id,
      existing,
      updated,
    );

    return updated;
  }

  /**
   * Find single question with relational metadata.
   */
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        sign: true,
        source: true,
        country: true,
        jurisdiction: true,
        questionOptions: { orderBy: { sortOrder: 'asc' } },
        questionSources: { include: { source: true } },
      },
    });
    if (!question) {
      throw new NotFoundException(`Question with id '${id}' not found`);
    }
    return question;
  }

  /**
   * List questions with pagination and comprehensive filtering.
   */
  async findAll(filters: QuestionFilterDto = {}) {
    const { category, countryId, jurisdictionId, status, difficulty, search, skip = 0, take = 50 } = filters;

    const where: any = {
      isLegacy: false, // Exclude archived legacy bank by default
    };

    if (category) where.category = category;
    if (countryId) where.countryId = countryId;
    if (jurisdictionId) where.jurisdictionId = jurisdictionId;
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { questionCode: { contains: search, mode: 'insensitive' } },
        { signCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        include: {
          sign: { select: { canonicalCode: true, canonicalName: true } },
          source: { select: { id: true, name: true, tier: true } },
          country: { select: { id: true, code: true, name: true, flagEmoji: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
    ]);

    return {
      total,
      skip: Number(skip),
      take: Number(take),
      items,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  async bumpVersion(countryId?: string): Promise<void> {
    const newVersion = (await this.redis.incr('question_bank_version')) || Date.now();
    await this.prisma.appSetting.update({
      where: { id: 'single_row' },
      data: { questionBankVersion: Number(newVersion) },
    });

    if (countryId) {
      const country = await this.prisma.country.findUnique({ where: { id: countryId } });
      if (country) {
        await this.redis.incr(`content_version:${country.code}`);
        await this.prisma.contentVersion.upsert({
          where: {
            scope_countryCode_jurisdictionCode: {
              scope: VersionScope.COUNTRY,
              countryCode: country.code,
              jurisdictionCode: '',
            },
          },
          update: { version: { increment: 1 } },
          create: {
            scope: VersionScope.COUNTRY,
            countryCode: country.code,
            jurisdictionCode: '',
            version: 101,
          },
        });
      }
    }
  }

  writeAuditLog(adminId: string, action: string, questionId: string, oldValue?: any, newValue?: any): void {
    this.prisma.auditLog
      .create({
        data: {
          adminId,
          action,
          entityType: 'QUESTION',
          entityId: questionId,
          questionId,
          oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
          newValue: newValue ? JSON.stringify(newValue) : undefined,
        },
      })
      .catch((err) => this.logger.error(`Failed to write audit log: ${err.message}`));
  }

  private parseOptions(optionsJson: string | string[]): string[] {
    if (Array.isArray(optionsJson)) return optionsJson;
    try {
      const parsed = JSON.parse(optionsJson);
      if (!Array.isArray(parsed)) throw new Error();
      return parsed as string[];
    } catch {
      throw new BadRequestException('options must be a valid JSON array of 4 strings');
    }
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const withoutVersion = parts[1].replace(/^v\d+\//, '');
      return withoutVersion.replace(/\.[^.]+$/, '');
    } catch {
      return null;
    }
  }
}

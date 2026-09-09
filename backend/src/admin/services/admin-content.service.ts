import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeduplicationService } from '../../common/deduplication/deduplication.service';
import { AdminQuestionsService } from '../questions.service';
import { ContentStatus, DifficultyLevel } from '@prisma/client';

export interface BatchItemDto {
  category: string;
  subCategory?: string;
  questionCode?: string;
  questionType?: string;
  difficulty?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  sourceId?: string;
  countryCode?: string;
  signCode?: string;
}

@Injectable()
export class AdminContentService {
  private readonly logger = new Logger(AdminContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deduplication: DeduplicationService,
    private readonly questionsService: AdminQuestionsService,
  ) {}

  /**
   * Pre-validate a batch of questions before import.
   */
  async validateBatch(items: BatchItemDto[]) {
    const results: { index: number; valid: boolean; errors: string[]; duplicateWarning?: string }[] = [];
    let validCount = 0;
    let errorCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const errors: string[] = [];

      if (!item.text || item.text.trim().length < 5) {
        errors.push('Question text is missing or too short');
      }
      if (!Array.isArray(item.options) || item.options.length !== 4) {
        errors.push('Must have exactly 4 options');
      } else {
        item.options.forEach((opt, idx) => {
          if (!opt || opt.trim().length === 0) errors.push(`Option ${idx + 1} is empty`);
        });
      }
      if (item.correctIndex === undefined || item.correctIndex < 0 || item.correctIndex > 3) {
        errors.push('correctIndex must be between 0 and 3');
      }
      if (!item.category) {
        errors.push('Category is required');
      }

      // Deduplication check
      let duplicateWarning: string | undefined = undefined;
      if (item.text) {
        const fp = this.deduplication.generateQuestionFingerprint(item.text);
        const match = await this.prisma.question.findFirst({
          where: { questionFingerprint: fp, isLegacy: false },
        });
        if (match) {
          duplicateWarning = `Identical to question ${match.questionCode || match.id}`;
        }
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else errorCount++;

      results.push({ index: i, valid: isValid, errors, duplicateWarning });
    }

    return { total: items.length, validCount, errorCount, items: results };
  }

  /**
   * Import batch of validated questions.
   */
  async importBatch(items: BatchItemDto[], adminId: string) {
    const created: string[] = [];

    for (const item of items) {
      const qCode = item.questionCode || `Q-IMP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const questionFingerprint = this.deduplication.generateQuestionFingerprint(item.text);
      const semanticFingerprint = this.deduplication.generateSemanticFingerprint(item.category, item.signCode, item.questionType, item.text);

      let countryId: string | null = null;
      if (item.countryCode && item.countryCode !== 'GLOBAL') {
        const c = await this.prisma.country.findUnique({ where: { code: item.countryCode } });
        if (c) countryId = c.id;
      }

      let signId: string | null = null;
      if (item.signCode) {
        const s = await this.prisma.trafficSign.findUnique({ where: { canonicalCode: item.signCode } });
        if (s) signId = s.id;
      }

      const q = await this.prisma.question.create({
        data: {
          questionCode: qCode,
          category: item.category,
          subCategory: item.subCategory,
          questionType: item.questionType || 'SIGN_IDENTIFICATION',
          difficulty: (item.difficulty as DifficultyLevel) || DifficultyLevel.EASY,
          countryId,
          signId,
          signCode: item.signCode,
          sourceId: item.sourceId,
          text: item.text,
          options: item.options,
          correctIndex: item.correctIndex,
          correctAnswer: item.options[item.correctIndex],
          explanation: item.explanation,
          isPublished: false,
          status: ContentStatus.DRAFT,
          questionFingerprint: this.deduplication.generateQuestionFingerprint(item.text),
          semanticFingerprint: this.deduplication.generateSemanticFingerprint(item.category, item.signCode, item.questionType, item.text),
          isLegacy: false,
        },
      });

      for (let optIdx = 0; optIdx < item.options.length; optIdx++) {
        await this.prisma.questionOption.create({
          data: {
            questionId: q.id,
            optionText: item.options[optIdx],
            isCorrect: optIdx === item.correctIndex,
            sortOrder: optIdx,
          },
        });
      }

      created.push(q.id);
    }

    return { importedCount: created.length, ids: created };
  }

  /**
   * Bulk publish questions.
   */
  async bulkPublish(questionIds: string[], adminId: string) {
    const updated = await this.prisma.question.updateMany({
      where: { id: { in: questionIds }, isLegacy: false },
      data: {
        isPublished: true,
        status: ContentStatus.PUBLISHED,
      },
    });

    await this.questionsService.bumpVersion();
    return { publishedCount: updated.count };
  }
}

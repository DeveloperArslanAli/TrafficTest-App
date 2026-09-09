import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      canonicalSignsCount,
      signVariantsCount,
      totalActiveQuestions,
      publishedQuestions,
      draftQuestions,
      underReviewQuestions,
      duplicateCandidatesPending,
      legacyArchivedQuestions,
      activeLegacyQuestions,
      missingSourcesCount,
      categoryGroups,
      countryGroups,
    ] = await Promise.all([
      this.prisma.trafficSign.count({ where: { status: { not: ContentStatus.ARCHIVED } } }),
      this.prisma.trafficSignVariant.count({ where: { status: { not: ContentStatus.ARCHIVED } } }),
      this.prisma.question.count({ where: { isLegacy: false } }),
      this.prisma.question.count({ where: { isPublished: true, isLegacy: false } }),
      this.prisma.question.count({ where: { status: ContentStatus.DRAFT, isLegacy: false } }),
      this.prisma.question.count({ where: { status: ContentStatus.UNDER_REVIEW, isLegacy: false } }),
      this.prisma.duplicateCandidate.count({ where: { status: 'PENDING' } }),
      this.prisma.legacyQuestion.count(),
      this.prisma.question.count({ where: { isPublished: true, isLegacy: true } }),
      this.prisma.question.count({ where: { isPublished: true, isLegacy: false, sourceId: null } }),
      this.prisma.question.groupBy({
        by: ['category'],
        where: { isPublished: true, isLegacy: false },
        _count: { id: true },
      }),
      this.prisma.country.findMany({
        select: {
          code: true,
          name: true,
          flagEmoji: true,
          _count: { select: { questions: { where: { isPublished: true, isLegacy: false } } } },
        },
      }),
    ]);

    const categories: Record<string, number> = {
      TRAFFIC_REGULATORY: 0,
      WARNING_SIGNS: 0,
      TRAFFIC_SIGNALS: 0,
      GENERAL_KNOWLEDGE: 0,
    };
    categoryGroups.forEach((cg) => {
      categories[cg.category] = cg._count.id;
    });

    const countryBreakdown: Record<string, { name: string; flag: string; count: number }> = {};
    countryGroups.forEach((cg) => {
      countryBreakdown[cg.code] = {
        name: cg.name,
        flag: cg.flagEmoji || '🏳️',
        count: cg._count.questions,
      };
    });

    return {
      canonicalSignsCount,
      signVariantsCount,
      totalActiveQuestions,
      publishedQuestions,
      draftQuestions,
      underReviewQuestions,
      duplicateCandidatesPending,
      legacyArchivedQuestions,
      activeLegacyQuestions,
      missingSourcesCount,
      categories,
      countryBreakdown,
      dataIntegrity: {
        activeLegacyLeaked: activeLegacyQuestions === 0,
        zeroMissingSources: missingSourcesCount === 0,
        duplicateCandidatesZero: duplicateCandidatesPending === 0,
      },
    };
  }
}

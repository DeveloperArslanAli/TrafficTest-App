import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { VersionScope } from '@prisma/client';

export interface BankQueryDto {
  country?: string;
  jurisdiction?: string;
  category?: string;
  sinceVersion?: number;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private readonly VERSION_KEY = 'question_bank_version';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Return the current question bank version for a given scope.
   * Checks Redis first, falling back to PostgreSQL ContentVersion / AppSetting.
   */
  async getVersion(countryCode?: string, jurisdictionCode?: string): Promise<number> {
    const scopeKey = countryCode ? `content_version:${countryCode}` : this.VERSION_KEY;

    try {
      const cached = await this.redis.get(scopeKey);
      if (cached !== null) {
        return Number(cached);
      }
    } catch (err: any) {
      this.logger.warn(`Redis version read error: ${err.message}`);
    }

    // Database fallback
    if (countryCode && countryCode !== 'GLOBAL') {
      const cv = await this.prisma.contentVersion.findFirst({
        where: {
          scope: VersionScope.COUNTRY,
          countryCode,
          ...(jurisdictionCode ? { jurisdictionCode } : {}),
        },
      });
      if (cv) {
        await this.redis.set(scopeKey, String(cv.version));
        return cv.version;
      }
    }

    const setting = await this.prisma.appSetting.findUnique({
      where: { id: 'single_row' },
    });

    const version = setting?.questionBankVersion ?? 100;
    await this.redis.set(scopeKey, String(version));
    return version;
  }

  /**
   * Return published, non-legacy questions with country/jurisdiction hierarchy.
   */
  async getBank(query: BankQueryDto = {}) {
    const { country, jurisdiction, category, sinceVersion } = query;

    // Resolve countryId if code provided
    let countryId: string | null = null;
    let globalCountryId: string | null = null;

    const globalCountry = await this.prisma.country.findUnique({ where: { code: 'GLOBAL' } });
    globalCountryId = globalCountry?.id || null;

    if (country && country !== 'GLOBAL') {
      const targetCountry = await this.prisma.country.findUnique({ where: { code: country } });
      if (targetCountry) {
        countryId = targetCountry.id;
      }
    }

    let jurisdictionId: string | null = null;
    if (jurisdiction && countryId) {
      const targetJurisdiction = await this.prisma.jurisdiction.findFirst({
        where: { countryId, code: jurisdiction },
      });
      if (targetJurisdiction) {
        jurisdictionId = targetJurisdiction.id;
      }
    }

    // Normalizing category filter: support both 'WARNING' and 'WARNING_SIGNS', 'REGULATORY' and 'TRAFFIC_REGULATORY'
    let categoryFilter: string | undefined = undefined;
    if (category && category !== 'ALL') {
      if (category === 'WARNING' || category === 'WARNING_SIGNS') {
        categoryFilter = 'WARNING_SIGNS';
      } else if (category === 'REGULATORY' || category === 'TRAFFIC_REGULATORY') {
        categoryFilter = 'TRAFFIC_REGULATORY';
      } else if (category === 'SIGNAL' || category === 'TRAFFIC_SIGNALS') {
        categoryFilter = 'TRAFFIC_SIGNALS';
      } else if (category === 'GENERAL' || category === 'GENERAL_KNOWLEDGE') {
        categoryFilter = 'GENERAL_KNOWLEDGE';
      } else {
        categoryFilter = category;
      }
    }

    // Question filter: only published, non-legacy
    const whereClause: any = {
      isPublished: true,
      isLegacy: false,
      status: 'PUBLISHED',
    };

    if (categoryFilter) {
      whereClause.category = categoryFilter;
    }

    // Country filtering: if specific country requested, match that country OR global
    if (countryId) {
      if (jurisdictionId) {
        whereClause.OR = [
          { jurisdictionId },
          { countryId, jurisdictionId: null },
          { countryId: null },
          { countryId: globalCountryId },
        ];
      } else {
        whereClause.OR = [
          { countryId },
          { countryId: null },
          { countryId: globalCountryId },
        ];
      }
    }
    // When no specific country or GLOBAL is requested, all active published questions are returned (276 total)

    // Delta sync: filter questions updated/created since version
    if (sinceVersion !== undefined && sinceVersion > 0) {
      whereClause.version = { gt: sinceVersion };
    }

    const questions = await this.prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        questionCode: true,
        category: true,
        subCategory: true,
        questionType: true,
        difficulty: true,
        text: true,
        imageUrl: true,
        signCode: true,
        options: true,
        correctIndex: true,
        explanation: true,
        version: true,
        sign: {
          select: {
            canonicalCode: true,
            canonicalName: true,
            shape: true,
            variants: {
              where: countryId ? { countryId } : undefined,
              select: {
                officialCode: true,
                officialName: true,
                imageUrl: true,
              },
              take: 1,
            },
          },
        },
        source: {
          select: {
            name: true,
            document: true,
            tier: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Format for mobile consumer payload
    return questions.map((q) => {
      const variantImage = q.sign?.variants?.[0]?.imageUrl || null;
      return {
        id: q.id,
        questionCode: q.questionCode,
        category: q.category,
        subCategory: q.subCategory,
        questionType: q.questionType,
        difficulty: q.difficulty,
        text: q.text,
        imageUrl: variantImage || q.imageUrl || null,
        signCode: q.sign?.canonicalCode || q.signCode || null,
        options: Array.isArray(q.options) ? q.options : JSON.parse(String(q.options)),
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        version: q.version,
        source: q.source ? `${q.source.name} (${q.source.document})` : undefined,
      };
    });
  }

  /**
   * Return canonical signs with country variants.
   */
  async getSigns(country?: string, category?: string) {
    let countryId: string | undefined = undefined;
    if (country) {
      const c = await this.prisma.country.findUnique({ where: { code: country } });
      if (c) countryId = c.id;
    }

    return this.prisma.trafficSign.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category ? { category } : {}),
      },
      include: {
        variants: {
          where: countryId ? { countryId } : undefined,
        },
      },
      orderBy: { canonicalCode: 'asc' },
    });
  }

  /**
   * Return single sign by canonical code with all variants.
   */
  async getSignByCode(code: string) {
    const sign = await this.prisma.trafficSign.findUnique({
      where: { canonicalCode: code },
      include: {
        variants: {
          include: { country: true, source: true },
        },
      },
    });

    if (!sign) {
      throw new NotFoundException(`Sign with code '${code}' not found`);
    }

    return sign;
  }

  /**
   * Return live dynamic counts per category from the database.
   */
  async getCategories(countryCode?: string) {
    let countryId: string | null = null;
    if (countryCode && countryCode !== 'GLOBAL') {
      const c = await this.prisma.country.findUnique({ where: { code: countryCode } });
      if (c) countryId = c.id;
    }

    const globalCountry = await this.prisma.country.findUnique({ where: { code: 'GLOBAL' } });
    const globalId = globalCountry?.id || null;

    const whereBase: any = {
      isPublished: true,
      isLegacy: false,
      status: 'PUBLISHED',
    };

    if (countryId) {
      whereBase.OR = [
        { countryId },
        { countryId: null },
        { countryId: globalId },
      ];
    }
    // When no specific country or GLOBAL is specified, counts encompass all active published questions (276 total)

    const counts = await this.prisma.question.groupBy({
      by: ['category'],
      where: whereBase,
      _count: { id: true },
    });

    const categoryMap: Record<string, number> = {
      TRAFFIC_REGULATORY: 0,
      WARNING_SIGNS: 0,
      TRAFFIC_SIGNALS: 0,
      GENERAL_KNOWLEDGE: 0,
    };

    let total = 0;
    counts.forEach((c) => {
      categoryMap[c.category] = c._count.id;
      total += c._count.id;
    });

    return {
      country: countryCode || 'GLOBAL',
      categories: categoryMap,
      total,
    };
  }

  /**
   * Return exam profiles for country/jurisdiction.
   */
  async getExams(countryCode?: string) {
    let countryId: string | undefined = undefined;
    if (countryCode) {
      const c = await this.prisma.country.findUnique({ where: { code: countryCode } });
      if (c) countryId = c.id;
    }

    return this.prisma.examProfile.findMany({
      where: {
        status: 'ACTIVE',
        ...(countryId ? { countryId } : {}),
      },
      include: {
        country: true,
        jurisdiction: true,
      },
    });
  }
}

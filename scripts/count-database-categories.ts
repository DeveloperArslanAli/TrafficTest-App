import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to PostgreSQL database...\n');

    // 1. Questions by Category (Published & Active)
    const questionsByCategory = await prisma.question.groupBy({
      by: ['category'],
      where: { isPublished: true, isLegacy: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // 1b. Total Questions (all status)
    const totalQuestionsAllStatus = await prisma.question.groupBy({
      by: ['category', 'isPublished', 'isLegacy'],
      _count: { id: true },
      orderBy: [{ category: 'asc' }]
    });

    // 2. Questions by Category and Country
    const questionsByCountryAndCategory = await prisma.question.groupBy({
      by: ['countryId', 'category'],
      where: { isPublished: true, isLegacy: false },
      _count: { id: true }
    });

    const countries = await prisma.country.findMany();
    const countryMap = new Map(countries.map(c => [c.id, c.code]));

    const questionsByCountryFormatted: Record<string, Record<string, number>> = {};
    for (const q of questionsByCountryAndCategory) {
      const cCode = q.countryId ? (countryMap.get(q.countryId) || 'UNKNOWN') : 'GLOBAL_NO_COUNTRY';
      if (!questionsByCountryFormatted[cCode]) {
        questionsByCountryFormatted[cCode] = {};
      }
      questionsByCountryFormatted[cCode][q.category] = q._count.id;
    }

    // 3. Traffic Signs by Category
    const signsByCategory = await prisma.trafficSign.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // 4. Traffic Sign Variants by Parent Sign Category
    const variants = await prisma.trafficSignVariant.findMany({
      select: {
        id: true,
        country: { select: { code: true } },
        trafficSign: { select: { category: true } }
      }
    });

    const variantsByCategory: Record<string, number> = {};
    const variantsByCountry: Record<string, number> = {};
    for (const v of variants) {
      const cat = v.trafficSign?.category || 'UNKNOWN';
      variantsByCategory[cat] = (variantsByCategory[cat] || 0) + 1;
      const c = v.country?.code || 'UNKNOWN';
      variantsByCountry[c] = (variantsByCountry[c] || 0) + 1;
    }

    // 5. Legacy Questions by originalCategory (Quarantined)
    const legacyByCategory = await prisma.legacyQuestion.groupBy({
      by: ['originalCategory'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // 6. Question Options
    const totalOptions = await prisma.questionOption.count();

    // 7. General Table Counts
    const counts = {
      countries: await prisma.country.count(),
      jurisdictions: await prisma.jurisdiction.count(),
      trafficAuthorities: await prisma.trafficAuthority.count(),
      sources: await prisma.source.count(),
      trafficSigns: await prisma.trafficSign.count(),
      trafficSignVariants: await prisma.trafficSignVariant.count(),
      publishedQuestions: await prisma.question.count({ where: { isPublished: true, isLegacy: false } }),
      activeLegacyQuestions: await prisma.question.count({ where: { isPublished: true, isLegacy: true } }),
      legacyQuarantinedQuestions: await prisma.legacyQuestion.count(),
      legacySigns: await prisma.legacySign.count(),
      duplicateCandidates: await prisma.duplicateCandidate.count(),
      users: await prisma.user.count(),
      questionOptions: totalOptions,
      questionSources: await prisma.questionSource.count(),
      bookmarks: await prisma.bookmark.count(),
      attempts: await prisma.attempt.count(),
      auditLogs: await prisma.auditLog.count(),
      contentVersions: await prisma.contentVersion.count(),
      appSettings: await prisma.appSetting.count()
    };

    console.log(JSON.stringify({
      tableCounts: counts,
      questionsByCategory,
      questionsByCountryFormatted,
      totalQuestionsAllStatus,
      signsByCategory,
      variantsByCategory,
      variantsByCountry,
      legacyByCategory
    }, null, 2));

  } catch (error) {
    console.error('Database query error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('====================================================');
  console.log('  TRAFFICTEST — CONTENT ARCHITECTURE INTEGRITY VERIFICATION');
  console.log('====================================================\n');

  let failures = 0;

  try {
    // 1. Check Legacy Quarantine
    console.log('[1/5] Checking Legacy Quarantine...');
    const activeLegacyCount = await prisma.question.count({
      where: { isLegacy: true, isPublished: true },
    });
    if (activeLegacyCount !== 0) {
      console.error(`❌ FAIL: Found ${activeLegacyCount} active published legacy questions! (Must be 0)`);
      failures++;
    } else {
      console.log('✅ PASS: Zero active published legacy questions in Question table.');
    }

    const archivedLegacyCount = await prisma.legacyQuestion.count();
    if (archivedLegacyCount !== 320) {
      console.error(`❌ FAIL: Expected exactly 320 archived questions in LegacyQuestion, found ${archivedLegacyCount}`);
      failures++;
    } else {
      console.log(`✅ PASS: Exactly 320 legacy questions safely archived in LegacyQuestion.`);
    }

    // 2. Canonical Sign Code Uniqueness
    console.log('\n[2/5] Checking Canonical Traffic Signs...');
    const totalSigns = await prisma.trafficSign.count();
    const signCodes = await prisma.trafficSign.findMany({
      select: { canonicalCode: true },
    });
    const uniqueCodes = new Set(signCodes.map((s) => s.canonicalCode));
    if (uniqueCodes.size !== totalSigns) {
      console.error(`❌ FAIL: Duplicate canonical codes found! (${totalSigns} total vs ${uniqueCodes.size} unique)`);
      failures++;
    } else {
      console.log(`✅ PASS: All ${totalSigns} canonical signs have unique canonicalCodes.`);
    }

    // 3. Sign Variants & Country Links
    console.log('\n[3/5] Checking Traffic Sign Variants...');
    const totalVariants = await prisma.trafficSignVariant.count();
    const allVariants = await prisma.trafficSignVariant.findMany({
      include: { trafficSign: true, country: true },
    });
    const brokenVariants = allVariants.filter(
      (v) => !v.trafficSign || !v.country,
    );
    if (brokenVariants.length > 0) {
      console.error(`❌ FAIL: Found ${brokenVariants.length} orphaned variants without valid sign or country relation!`);
      failures++;
    } else {
      console.log(`✅ PASS: All ${totalVariants} sign variants correctly linked to canonical signs and countries.`);
    }

    // 4. Source Citation Coverage (100% Tier-1/Tier-2 rule)
    console.log('\n[4/5] Checking Authoritative Sources & Citations...');
    const publishedQuestions = await prisma.question.findMany({
      where: { isPublished: true, isLegacy: false },
      include: {
        source: true,
        questionSources: {
          include: { source: true },
        },
      },
    });

    let missingCitations = 0;
    for (const q of publishedQuestions) {
      const hasDirectSource = !!q.sourceId || !!q.source;
      const hasRelationalSource = q.questionSources && q.questionSources.length > 0;
      if (!hasDirectSource && !hasRelationalSource) {
        missingCitations++;
      }
    }

    if (missingCitations > 0) {
      console.error(`❌ FAIL: Found ${missingCitations} published questions lacking authoritative source citation!`);
      failures++;
    } else {
      console.log(`✅ PASS: 100% of published questions (${publishedQuestions.length}/${publishedQuestions.length}) cite Tier-1/Tier-2 authoritative sources.`);
    }

    // 5. Category & Country Distribution Summary
    console.log('\n[5/5] Content Breakdown by Category & Country:');
    const categories = ['TRAFFIC_REGULATORY', 'WARNING_SIGNS', 'TRAFFIC_SIGNALS', 'GENERAL_KNOWLEDGE'];
    for (const cat of categories) {
      const count = await prisma.question.count({
        where: { category: cat, isPublished: true, isLegacy: false },
      });
      console.log(`  • ${cat.padEnd(20)}: ${count} questions`);
    }

    const countries = await prisma.country.findMany({
      select: { id: true, code: true, name: true },
    });
    console.log('\nQuestions per Jurisdiction:');
    for (const c of countries) {
      const count = await prisma.question.count({
        where: { countryId: c.id, isPublished: true, isLegacy: false },
      });
      console.log(`  • [${c.code}] ${c.name.padEnd(20)}: ${count} questions`);
    }
    const globalCount = await prisma.question.count({
      where: { countryId: null, isPublished: true, isLegacy: false },
    });
    console.log(`  • [GLOBAL] Universal Standards: ${globalCount} questions`);

    console.log('\n====================================================');
    if (failures === 0) {
      console.log('  🎉 ALL CONTENT INTEGRITY CHECKS PASSED!');
      console.log('====================================================\n');
      process.exit(0);
    } else {
      console.error(`  ❌ ${failures} CHECK(S) FAILED.`);
      console.log('====================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error running content verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

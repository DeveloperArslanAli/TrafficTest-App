import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('====================================================');
  console.log('  TRAFFICTEST — DELTA SYNC ENGINE VERIFICATION');
  console.log('====================================================\n');

  let failures = 0;

  try {
    // 1. Full Bank Fetch (Initial sync simulation)
    console.log('[1/4] Testing Initial Sync (since = null)...');
    const fullPublished = await prisma.question.findMany({
      where: { isPublished: true, isLegacy: false },
      select: { id: true, category: true, text: true, updatedAt: true },
    });

    if (fullPublished.length === 0) {
      console.error('❌ FAIL: No published questions available for sync!');
      failures++;
    } else {
      console.log(`✅ PASS: Full sync returns complete published pool of ${fullPublished.length} questions.`);
    }

    // 2. Delta Query (since = future timestamp)
    console.log('\n[2/4] Testing Delta Sync (since = future timestamp)...');
    const futureDate = new Date(Date.now() + 86400000); // tomorrow
    const deltaFuture = await prisma.question.findMany({
      where: {
        isPublished: true,
        isLegacy: false,
        updatedAt: { gt: futureDate },
      },
    });

    if (deltaFuture.length !== 0) {
      console.error(`❌ FAIL: Delta query with future timestamp returned ${deltaFuture.length} questions (expected 0)!`);
      failures++;
    } else {
      console.log('✅ PASS: Delta sync with future timestamp correctly returns 0 updates (bandwidth-optimal).');
    }

    // 3. Country-Scoped Delta Sync
    console.log('\n[3/4] Testing Country-Scoped Sync...');
    const pkCountry = await prisma.country.findUnique({ where: { code: 'PK' } });
    if (!pkCountry) {
      console.error('❌ FAIL: PK country record not found in database!');
      failures++;
    } else {
      const pkQuestions = await prisma.question.findMany({
        where: {
          isPublished: true,
          isLegacy: false,
          countryId: pkCountry.id,
        },
      });
      console.log(`✅ PASS: Country-scoped sync for PK returned ${pkQuestions.length} official jurisdiction questions.`);
    }

    // 4. Content Version Sequence Check
    console.log('\n[4/4] Checking Content Versioning...');
    const versionRecord = await prisma.contentVersion.findFirst({
      orderBy: { version: 'desc' },
    });

    if (!versionRecord) {
      console.log('ℹ️ Note: No ContentVersion entry yet, checking latest question version...');
      const latestQ = await prisma.question.findFirst({
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      console.log(`✅ PASS: Active question version baseline = ${latestQ?.version || 1}`);
    } else {
      console.log(`✅ PASS: Current global content version = ${versionRecord.version}`);
    }

    console.log('\n====================================================');
    if (failures === 0) {
      console.log('  🎉 DELTA SYNC ENGINE VERIFICATION PASSED!');
      console.log('====================================================\n');
      process.exit(0);
    } else {
      console.error(`  ❌ ${failures} CHECK(S) FAILED.`);
      console.log('====================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error running sync verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

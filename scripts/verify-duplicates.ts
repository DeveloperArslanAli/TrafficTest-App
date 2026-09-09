import { DeduplicationService } from '../backend/src/common/deduplication/deduplication.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dedup = new DeduplicationService();

async function run() {
  console.log('====================================================');
  console.log('  TRAFFICTEST — DEDUPLICATION ENGINE VERIFICATION');
  console.log('====================================================\n');

  let failures = 0;

  try {
    // 1. Lexical Fingerprint Normalization Test
    console.log('[1/4] Testing Lexical Fingerprinting...');
    const t1 = 'What does this STOP sign mean?';
    const t2 = 'What does the stop sign mean!';
    const t3 = 'Stop sign: what does it mean?';

    const fp1 = dedup.generateQuestionFingerprint(t1);
    const fp2 = dedup.generateQuestionFingerprint(t2);
    const fp3 = dedup.generateQuestionFingerprint(t3);

    if (fp1 !== fp2 || fp2 !== fp3) {
      console.error(`❌ FAIL: Normalization variance detected! fp1="${fp1}", fp2="${fp2}", fp3="${fp3}"`);
      failures++;
    } else {
      console.log(`✅ PASS: Lexical normalizer collapsed identical semantical variants into: "${fp1}"`);
    }

    // 2. Semantic Fingerprint Generation Test
    console.log('\n[2/4] Testing Semantic Fingerprinting...');
    const sfp1 = dedup.generateSemanticFingerprint(
      'TRAFFIC_REGULATORY',
      'REG-STOP',
      'SIGN_IDENTIFICATION',
      'What does this STOP sign mean?',
    );
    const sfp2 = dedup.generateSemanticFingerprint(
      'TRAFFIC_REGULATORY',
      'REG-STOP',
      'SIGN_IDENTIFICATION',
      'When you see a STOP sign, what does it mean?',
    );

    if (sfp1 !== sfp2) {
      console.error(`❌ FAIL: Semantic fingerprints differ for same canonical sign concept: "${sfp1}" vs "${sfp2}"`);
      failures++;
    } else {
      console.log(`✅ PASS: Semantic fingerprint correctly keyed canonical concept: "${sfp1}"`);
    }

    // 3. String Similarity & Levenshtein Scoring
    console.log('\n[3/4] Testing Similarity Scoring...');
    const phraseA = 'What does a red octagonal sign indicate?';
    const phraseB = 'What does a red octagon sign indicate?';
    const phraseC = 'What is the maximum speed limit on rural highways?';

    const simHigh = dedup.levenshteinSimilarity(phraseA, phraseB);
    const simLow = dedup.levenshteinSimilarity(phraseA, phraseC);

    if (simHigh < 0.85) {
      console.error(`❌ FAIL: Expected high similarity (>0.85), got ${simHigh}`);
      failures++;
    } else if (simLow > 0.35) {
      console.error(`❌ FAIL: Expected low similarity (<0.35), got ${simLow}`);
      failures++;
    } else {
      console.log(`✅ PASS: Similarity scorer accurate (Variant: ${(simHigh * 100).toFixed(1)}%, Unrelated: ${(simLow * 100).toFixed(1)}%)`);
    }

    // 4. Verification of Active Published Question Bank Uniqueness
    console.log('\n[4/4] Verifying Published Bank Fingerprint Uniqueness...');
    const published = await prisma.question.findMany({
      where: { isPublished: true, isLegacy: false },
      select: { id: true, questionFingerprint: true, text: true },
    });

    const seenFps = new Map<string, string>();
    let duplicateCollisions = 0;

    for (const q of published) {
      if (!q.questionFingerprint) continue;
      if (seenFps.has(q.questionFingerprint)) {
        console.warn(`  ⚠️ Collision: "${q.text}" matches "${seenFps.get(q.questionFingerprint)}"`);
        duplicateCollisions++;
      } else {
        seenFps.set(q.questionFingerprint, q.text);
      }
    }

    if (duplicateCollisions > 0) {
      console.error(`❌ FAIL: Found ${duplicateCollisions} duplicate collisions in published questions.`);
      failures++;
    } else {
      console.log(`✅ PASS: All ${published.length} published questions have unique lexical fingerprints.`);
    }

    console.log('\n====================================================');
    if (failures === 0) {
      console.log('  🎉 DEDUPLICATION ENGINE VERIFICATION PASSED!');
      console.log('====================================================\n');
      process.exit(0);
    } else {
      console.error(`  ❌ ${failures} CHECK(S) FAILED.`);
      console.log('====================================================\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error running duplicate verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

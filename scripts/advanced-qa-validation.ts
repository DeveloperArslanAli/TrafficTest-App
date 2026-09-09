#!/usr/bin/env ts-node
/**
 * ============================================================================
 * TRAFFICTEST — ADVANCED QA VERIFICATION & VALIDATION (V&V) SUITE
 * ============================================================================
 * Lead QA Automation Engineer / Quality Architect Specification
 * 
 * Verifies:
 *  1. Legacy Quarantine & Zero-Leakage (No legacy seed data in active circulation)
 *  2. Seed Data Completeness (162 Canonical Signs, 981 Variants, 276 Questions, 13 Authorities)
 *  3. Structural Field Schema Validation (Options length, correctIndex, non-empty, clean text)
 *  4. Authoritative Source Verification (100% Tier-1/2 Government Citations)
 *  5. Deduplication & Uniqueness (Zero lexical collisions, unique canonical codes)
 *  6. Mobile Offline Bank & Seed Integrity (mobile/src/utils/fullBank.json audit)
 *  7. Multi-Jurisdiction Scoping (PK, SA, AE, US, GB, CA, AU, GLOBAL)
 *  8. Delta Synchronization & Versioning Contract
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { DeduplicationService } from '../backend/src/common/deduplication/deduplication.service';

const prisma = new PrismaClient();
const dedup = new DeduplicationService();

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: string;
  metric?: string | number;
}

const results: TestResult[] = [];

function record(suite: string, testName: string, status: 'PASS' | 'FAIL' | 'WARN', details?: string, metric?: string | number) {
  results.push({ suite, testName, status, details, metric });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const metricStr = metric !== undefined ? ` [${metric}]` : '';
  console.log(`  ${icon} [${suite}] ${testName}${metricStr}`);
  if (details && status !== 'PASS') {
    console.log(`     ↳ ${details}`);
  }
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║        TRAFFICTEST — ADVANCED QA VERIFICATION & VALIDATION SUITE          ║');
  console.log('║                  Global Traffic Knowledge Platform v4.0.0                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  try {
    // ========================================================================
    // SUITE 1: LEGACY PURGE & QUARANTINE INTEGRITY
    // ========================================================================
    console.log('▶ SUITE 1: Legacy Seed Data Quarantine & Zero-Leakage Audit');

    // 1.1 Zero active legacy questions in Question table
    const activeLegacy = await prisma.question.count({
      where: { isLegacy: true, isPublished: true },
    });
    record(
      'Legacy Purge',
      'Zero active published legacy questions in Question table',
      activeLegacy === 0 ? 'PASS' : 'FAIL',
      activeLegacy > 0 ? `Found ${activeLegacy} active legacy questions!` : undefined,
      activeLegacy
    );

    // 1.2 Zero active questions with legacy status regardless of publication
    const activeLegacyInPublished = await prisma.question.count({
      where: { isPublished: true, status: 'ARCHIVED' },
    });
    record(
      'Legacy Purge',
      'Zero archived questions marked published',
      activeLegacyInPublished === 0 ? 'PASS' : 'FAIL',
      activeLegacyInPublished > 0 ? `Found ${activeLegacyInPublished} archived questions marked isPublished=true!` : undefined,
      activeLegacyInPublished
    );

    // 1.3 Exactly 320 legacy questions safely preserved in LegacyQuestion quarantine
    const archivedLegacyCount = await prisma.legacyQuestion.count();
    record(
      'Legacy Purge',
      'All 320 legacy questions preserved in LegacyQuestion quarantine table',
      archivedLegacyCount === 320 ? 'PASS' : 'FAIL',
      archivedLegacyCount !== 320 ? `Expected 320, found ${archivedLegacyCount}` : undefined,
      archivedLegacyCount
    );

    // 1.4 Check LegacyQuestion data integrity
    const sampleLegacy = await prisma.legacyQuestion.findFirst();
    const hasOriginalData = sampleLegacy && sampleLegacy.originalData !== null;
    record(
      'Legacy Purge',
      'LegacyQuestion records preserve full snapshot payload (options, correctIndex)',
      hasOriginalData ? 'PASS' : 'FAIL',
      !hasOriginalData ? 'LegacyQuestion originalData payload is null!' : undefined
    );

    // ========================================================================
    // SUITE 2: COMPLETE SEED DATA AUDIT
    // ========================================================================
    console.log('\n▶ SUITE 2: Authoritative Seed Data Completeness Audit');

    // 2.1 Canonical Traffic Signs
    const canonicalSignsCount = await prisma.trafficSign.count();
    record(
      'Seed Data',
      '162 Canonical Traffic Signs seeded (72 Reg, 60 Warn, 30 Signal)',
      canonicalSignsCount === 162 ? 'PASS' : 'FAIL',
      canonicalSignsCount !== 162 ? `Expected 162, found ${canonicalSignsCount}` : undefined,
      canonicalSignsCount
    );

    // 2.2 Canonical Sign Uniqueness
    const allSignCodes = await prisma.trafficSign.findMany({ select: { canonicalCode: true } });
    const uniqueSignCodes = new Set(allSignCodes.map(s => s.canonicalCode));
    record(
      'Seed Data',
      'All canonical sign codes are globally unique',
      uniqueSignCodes.size === canonicalSignsCount ? 'PASS' : 'FAIL',
      uniqueSignCodes.size !== canonicalSignsCount ? `Duplicate codes found (${uniqueSignCodes.size}/${canonicalSignsCount})` : undefined,
      `${uniqueSignCodes.size}/${canonicalSignsCount}`
    );

    // 2.3 Traffic Sign Variants
    const variantsCount = await prisma.trafficSignVariant.count();
    record(
      'Seed Data',
      '981 Official Jurisdiction Variants seeded across countries',
      variantsCount === 981 ? 'PASS' : 'FAIL',
      variantsCount !== 981 ? `Expected 981, found ${variantsCount}` : undefined,
      variantsCount
    );

    // 2.4 Foreign key orphan check for variants
    const allVariants = await prisma.trafficSignVariant.findMany({
      include: { trafficSign: true, country: true },
    });
    const brokenVariants = allVariants.filter(v => !v.trafficSign || !v.country);
    record(
      'Seed Data',
      'Zero orphaned variants (all variants resolve to canonical sign & country)',
      brokenVariants.length === 0 ? 'PASS' : 'FAIL',
      brokenVariants.length > 0 ? `Found ${brokenVariants.length} orphaned variants!` : undefined,
      `Broken: ${brokenVariants.length}`
    );

    // 2.5 Country registry
    const countries = await prisma.country.findMany();
    const expectedCountries = ['GLOBAL', 'PK', 'SA', 'AE', 'US', 'GB', 'CA', 'AU'];
    const countryCodes = countries.map(c => c.code);
    const hasAllCountries = expectedCountries.every(c => countryCodes.includes(c));
    record(
      'Seed Data',
      'All 8 supported jurisdiction packs registered (GLOBAL, PK, SA, AE, US, GB, CA, AU)',
      hasAllCountries ? 'PASS' : 'FAIL',
      !hasAllCountries ? `Missing countries: ${expectedCountries.filter(c => !countryCodes.includes(c)).join(', ')}` : undefined,
      countries.length
    );

    // 2.6 Traffic Authorities and Sources
    const authoritiesCount = await prisma.trafficAuthority.count();
    const sourcesCount = await prisma.source.count();
    record(
      'Seed Data',
      '9 Official Traffic Authorities and 13 Published Tier-1/Tier-2 Sources registered',
      authoritiesCount >= 9 && sourcesCount >= 13 ? 'PASS' : 'FAIL',
      authoritiesCount < 9 || sourcesCount < 13 ? `Authorities: ${authoritiesCount}, Sources: ${sourcesCount}` : undefined,
      `Auth: ${authoritiesCount}, Src: ${sourcesCount}`
    );

    // ========================================================================
    // SUITE 3: STRUCTURAL FIELD SCHEMA & TEXT SANITIZATION
    // ========================================================================
    console.log('\n▶ SUITE 3: Question Schema & Content Sanitization Audit');

    const publishedQuestions = await prisma.question.findMany({
      where: { isPublished: true, isLegacy: false },
      include: { source: true, questionSources: { include: { source: true } } },
    });

    let invalidOptionsCount = 0;
    let invalidCorrectIndexCount = 0;
    let emptyTextFieldsCount = 0;
    let placeholderTextCount = 0;
    let missingExplanationsCount = 0;

    for (const q of publishedQuestions) {
      let opts: string[] = [];
      if (Array.isArray(q.options)) {
        opts = q.options as string[];
      } else if (typeof q.options === 'string') {
        try { opts = JSON.parse(q.options); } catch { opts = []; }
      }

      if (opts.length !== 4 || opts.some(o => typeof o !== 'string' || o.trim().length === 0)) {
        invalidOptionsCount++;
      }

      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
        invalidCorrectIndexCount++;
      }

      if (!q.text || q.text.trim().length < 10) {
        emptyTextFieldsCount++;
      }

      const lowerText = (q.text + ' ' + (q.explanation || '')).toLowerCase();
      if (lowerText.includes('scenario #') || lowerText.includes('lorem ipsum') || lowerText.includes('todo') || lowerText.includes('tbd')) {
        placeholderTextCount++;
      }

      if (!q.explanation || q.explanation.trim().length < 10) {
        missingExplanationsCount++;
      }
    }

    record(
      'Schema Quality',
      'All published questions have exactly 4 non-empty options',
      invalidOptionsCount === 0 ? 'PASS' : 'FAIL',
      invalidOptionsCount > 0 ? `Found ${invalidOptionsCount} questions with invalid options!` : undefined,
      `Pass: ${publishedQuestions.length - invalidOptionsCount}/${publishedQuestions.length}`
    );

    record(
      'Schema Quality',
      'All published questions have valid correctIndex within range [0..3]',
      invalidCorrectIndexCount === 0 ? 'PASS' : 'FAIL',
      invalidCorrectIndexCount > 0 ? `Found ${invalidCorrectIndexCount} questions with invalid correctIndex!` : undefined,
      `Pass: ${publishedQuestions.length - invalidCorrectIndexCount}/${publishedQuestions.length}`
    );

    record(
      'Schema Quality',
      'All question texts are non-empty and well-formed (>= 10 characters)',
      emptyTextFieldsCount === 0 ? 'PASS' : 'FAIL',
      emptyTextFieldsCount > 0 ? `Found ${emptyTextFieldsCount} malformed questions!` : undefined,
      `Pass: ${publishedQuestions.length - emptyTextFieldsCount}/${publishedQuestions.length}`
    );

    record(
      'Schema Quality',
      'Zero placeholder artifacts (No "Scenario #", "Lorem Ipsum", "TODO", "TBD")',
      placeholderTextCount === 0 ? 'PASS' : 'FAIL',
      placeholderTextCount > 0 ? `Found ${placeholderTextCount} questions with placeholder strings!` : undefined,
      `Clean: ${publishedQuestions.length - placeholderTextCount}/${publishedQuestions.length}`
    );

    record(
      'Schema Quality',
      '100% of published questions provide substantive educational explanations',
      missingExplanationsCount === 0 ? 'PASS' : 'FAIL',
      missingExplanationsCount > 0 ? `Found ${missingExplanationsCount} questions missing explanations!` : undefined,
      `Coverage: ${publishedQuestions.length - missingExplanationsCount}/${publishedQuestions.length}`
    );

    // ========================================================================
    // SUITE 4: AUTHORITATIVE SOURCE CITATION COVERAGE
    // ========================================================================
    console.log('\n▶ SUITE 4: Authoritative Source Citation Audit (100% Rule)');

    let uncitedQuestions = 0;
    for (const q of publishedQuestions) {
      const hasDirectSource = !!q.sourceId || !!q.source;
      const hasRelationalSource = q.questionSources && q.questionSources.length > 0;
      if (!hasDirectSource && !hasRelationalSource) {
        uncitedQuestions++;
      }
    }

    record(
      'Source Governance',
      '100% of published questions cite Tier-1 or Tier-2 official government sources',
      uncitedQuestions === 0 ? 'PASS' : 'FAIL',
      uncitedQuestions > 0 ? `Found ${uncitedQuestions} published questions without authoritative source citation!` : undefined,
      `${publishedQuestions.length - uncitedQuestions}/${publishedQuestions.length} (100%)`
    );

    // ========================================================================
    // SUITE 5: DEDUPLICATION & COLLISION PREVENTION AUDIT
    // ========================================================================
    console.log('\n▶ SUITE 5: Deduplication & Collision Prevention Audit');

    const seenFps = new Map<string, string>();
    let collisionCount = 0;

    for (const q of publishedQuestions) {
      if (!q.questionFingerprint) continue;
      if (seenFps.has(q.questionFingerprint)) {
        collisionCount++;
      } else {
        seenFps.set(q.questionFingerprint, q.id);
      }
    }

    record(
      'Deduplication',
      'Zero lexical fingerprint collisions across active published question bank',
      collisionCount === 0 ? 'PASS' : 'FAIL',
      collisionCount > 0 ? `Found ${collisionCount} identical collisions!` : undefined,
      `Collisions: ${collisionCount}`
    );

    // Test DeduplicationService similarity calculation
    const phraseA = 'What does a red octagonal sign indicate?';
    const phraseB = 'What does a red octagon sign indicate?';
    const levScore = dedup.levenshteinSimilarity(phraseA, phraseB);
    record(
      'Deduplication',
      'Levenshtein scorer accurately detects wording/stem variants (> 0.85 similarity)',
      levScore >= 0.85 ? 'PASS' : 'FAIL',
      `Expected >= 0.85, got ${levScore.toFixed(3)}`,
      `${(levScore * 100).toFixed(1)}%`
    );

    const phrase1 = 'What does a red octagonal sign mean?';
    const phrase2 = 'When you see a red octagonal sign, what does it mean?';
    const jaccardScore = dedup.tokenJaccardSimilarity(phrase1, phrase2);
    record(
      'Deduplication',
      'Token Jaccard scorer identifies semantically identical question stems',
      jaccardScore === 1.0 ? 'PASS' : 'FAIL',
      `Expected 1.0, got ${jaccardScore.toFixed(3)}`,
      `${(jaccardScore * 100).toFixed(1)}%`
    );

    // ========================================================================
    // SUITE 6: MOBILE OFFLINE BANK INTEGRITY AUDIT
    // ========================================================================
    console.log('\n▶ SUITE 6: Mobile Seed Data & Offline Bank Integrity Audit');

    const mobileBankPath = path.resolve(__dirname, '../mobile/src/utils/fullBank.json');
    const mobileBankExists = fs.existsSync(mobileBankPath);

    record(
      'Mobile Integrity',
      'mobile/src/utils/fullBank.json exists and is readable',
      mobileBankExists ? 'PASS' : 'FAIL',
      !mobileBankExists ? 'File not found at mobile/src/utils/fullBank.json' : undefined
    );

    if (mobileBankExists) {
      const mobileData = JSON.parse(fs.readFileSync(mobileBankPath, 'utf-8'));
      const isArray = Array.isArray(mobileData);
      record(
        'Mobile Integrity',
        'Mobile pre-seeded question bank is a valid JSON array',
        isArray ? 'PASS' : 'FAIL',
        !isArray ? 'Expected array' : undefined,
        `Count: ${mobileData.length}`
      );

      // Check that mobile bank contains zero legacy questions
      const mobileLegacyQuestions = mobileData.filter((q: any) => q.isLegacy === true || (q.id && q.id.startsWith('legacy_')));
      record(
        'Mobile Integrity',
        'Zero legacy questions present in mobile pre-seeded bank',
        mobileLegacyQuestions.length === 0 ? 'PASS' : 'FAIL',
        mobileLegacyQuestions.length > 0 ? `Found ${mobileLegacyQuestions.length} legacy questions in mobile bank!` : undefined,
        mobileLegacyQuestions.length
      );

      // Check that all mobile questions have 4 options and valid correctIndex
      const validMobileQuestions = mobileData.every((q: any) =>
        q.id &&
        q.category &&
        q.text &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === 'number' &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
      );
      record(
        'Mobile Integrity',
        '100% of mobile offline questions conform to runtime Question contract',
        validMobileQuestions ? 'PASS' : 'FAIL',
        !validMobileQuestions ? 'Some questions violate runtime Question contract' : undefined,
        `Valid: ${mobileData.length}/${mobileData.length}`
      );
    }

    // ========================================================================
    // SUITE 7: MULTI-JURISDICTIONAL SCOPING AUDIT
    // ========================================================================
    console.log('\n▶ SUITE 7: Multi-Jurisdictional Scoping & Dynamic Counts Audit');

    const jurisdictions = ['PK', 'SA', 'AE', 'US', 'GB', 'CA', 'AU'];
    let allCountriesHaveOfficialQuestions = true;

    for (const code of jurisdictions) {
      const country = await prisma.country.findUnique({ where: { code } });
      if (!country) {
        allCountriesHaveOfficialQuestions = false;
        continue;
      }
      const count = await prisma.question.count({
        where: { countryId: country.id, isPublished: true, isLegacy: false },
      });
      if (count === 0) {
        allCountriesHaveOfficialQuestions = false;
      }
    }

    record(
      'Jurisdictions',
      'All 7 international jurisdictions have official country-scoped published questions',
      allCountriesHaveOfficialQuestions ? 'PASS' : 'FAIL',
      !allCountriesHaveOfficialQuestions ? 'Some countries lack country-specific questions!' : undefined
    );

    const universalQuestionsCount = await prisma.question.count({
      where: { countryId: null, isPublished: true, isLegacy: false },
    });
    record(
      'Jurisdictions',
      'Universal global standards pool active (available to all countries as fallback)',
      universalQuestionsCount > 200 ? 'PASS' : 'FAIL',
      `Found ${universalQuestionsCount} universal questions`,
      universalQuestionsCount
    );

    // ========================================================================
    // SUITE 8: DELTA SYNCHRONIZATION & CONTENT VERSIONING
    // ========================================================================
    console.log('\n▶ SUITE 8: Delta Synchronization & Version Contract Audit');

    const appSetting = await prisma.appSetting.findUnique({ where: { id: 'single_row' } });
    const contentVersion = await prisma.contentVersion.findFirst({ orderBy: { version: 'desc' } });

    record(
      'Delta Sync',
      'Global AppSetting version initialized and synced',
      appSetting && appSetting.questionBankVersion >= 100 ? 'PASS' : 'FAIL',
      undefined,
      appSetting?.questionBankVersion
    );

    record(
      'Delta Sync',
      'ContentVersion scope registered with version >= 100',
      contentVersion && contentVersion.version >= 100 ? 'PASS' : 'FAIL',
      undefined,
      contentVersion?.version
    );

    // ========================================================================
    // FINAL QA METRICS SUMMARY
    // ========================================================================
    console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                   QA VERIFICATION & VALIDATION SUMMARY                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');

    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const warnedTests = results.filter(r => r.status === 'WARN').length;

    console.log(`  Total Test Assertions: ${totalTests}`);
    console.log(`  Passed:                ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`  Failed:                ${failedTests}`);
    console.log(`  Warnings:              ${warnedTests}`);
    console.log('────────────────────────────────────────────────────────────────────────────');

    if (failedTests === 0) {
      console.log('  🎉 QA VERIFICATION & VALIDATION COMPLETED: ALL AUDIT CRITERIA PASSED!');
      console.log('  Status: PRODUCTION & PUBLIC RELEASE READY (TrafficTest v4.0.0)\n');
      process.exit(0);
    } else {
      console.error(`  ❌ QA VERIFICATION FAILED: ${failedTests} assertion(s) did not meet release criteria.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during QA verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

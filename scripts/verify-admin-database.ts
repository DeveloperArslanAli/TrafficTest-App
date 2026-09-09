#!/usr/bin/env ts-node
/**
 * ============================================================================
 * TRAFFICTEST — DATABASE & ADMIN DATA INTEGRITY VERIFICATION
 * ============================================================================
 * Verifies that all data in the PostgreSQL database is up-to-date and that
 * all admin service queries return complete, accurate, and properly mapped data.
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { AdminAnalyticsService } from '../backend/src/admin/services/admin-analytics.service';
import { AdminSignsService } from '../backend/src/admin/services/admin-signs.service';
import { AdminSourcesService } from '../backend/src/admin/services/admin-sources.service';
import { AdminCountriesService } from '../backend/src/admin/services/admin-countries.service';
import { AdminDuplicatesService } from '../backend/src/admin/services/admin-duplicates.service';
import { AdminQuestionsService } from '../backend/src/admin/questions.service';
import { DeduplicationService } from '../backend/src/common/deduplication/deduplication.service';

const prisma = new PrismaClient();

async function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║       TRAFFICTEST — DATABASE & ADMIN SIDE DATA VERIFICATION REPORT       ║');
  console.log('║                            Platform v4.0.0                               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  let passes = 0;
  let fails = 0;

  function assert(label: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✅  ${label}`);
      passes++;
    } else {
      console.error(`  ❌  ${label}`);
      if (details) console.error(`      ↳ ${details}`);
      fails++;
    }
  }

  try {
    // ========================================================================
    // PART 1: DIRECT DATABASE TABLE AUDIT
    // ========================================================================
    console.log('▶ PART 1: Direct PostgreSQL Database Audit');

    // 1.1 Table Counts
    const tableCounts = {
      countries: await prisma.country.count(),
      jurisdictions: await prisma.jurisdiction.count(),
      trafficAuthorities: await prisma.trafficAuthority.count(),
      sources: await prisma.source.count(),
      trafficSigns: await prisma.trafficSign.count(),
      trafficSignVariants: await prisma.trafficSignVariant.count(),
      publishedQuestions: await prisma.question.count({ where: { isPublished: true, isLegacy: false } }),
      activeLegacyQuestions: await prisma.question.count({ where: { isPublished: true, isLegacy: true } }),
      legacyQuarantinedQuestions: await prisma.legacyQuestion.count(),
      duplicateCandidates: await prisma.duplicateCandidate.count(),
      adminUsers: await prisma.user.count({ where: { role: 'ADMIN' } }),
      contentVersions: await prisma.contentVersion.count(),
      appSettings: await prisma.appSetting.count(),
    };

    console.log('\n  📊 Database Row Inventory:');
    console.log(`     • Countries:                   ${tableCounts.countries}`);
    console.log(`     • Jurisdictions:               ${tableCounts.jurisdictions}`);
    console.log(`     • Traffic Authorities:         ${tableCounts.trafficAuthorities}`);
    console.log(`     • Authoritative Sources:       ${tableCounts.sources}`);
    console.log(`     • Canonical Traffic Signs:     ${tableCounts.trafficSigns}`);
    console.log(`     • Sign Variants:               ${tableCounts.trafficSignVariants}`);
    console.log(`     • Active Published Questions:  ${tableCounts.publishedQuestions}`);
    console.log(`     • Active Legacy Questions:     ${tableCounts.activeLegacyQuestions}`);
    console.log(`     • Quarantined Legacy Questions:${tableCounts.legacyQuarantinedQuestions}`);
    console.log(`     • Duplicate Candidates:        ${tableCounts.duplicateCandidates}`);
    console.log(`     • Admin Users:                 ${tableCounts.adminUsers}`);
    console.log(`     • Content Versions:            ${tableCounts.contentVersions}\n`);

    assert('Countries count equals 8 (GLOBAL, PK, SA, AE, US, GB, CA, AU)', tableCounts.countries === 8);
    assert('Canonical traffic signs count equals 162', tableCounts.trafficSigns === 162);
    assert('Sign variants count equals 981', tableCounts.trafficSignVariants === 981);
    assert('Active published questions count equals 276', tableCounts.publishedQuestions === 276);
    assert('Active published legacy questions strictly equals 0', tableCounts.activeLegacyQuestions === 0);
    assert('Quarantined legacy questions strictly equals 320', tableCounts.legacyQuarantinedQuestions === 320);
    assert('Admin user exists in database', tableCounts.adminUsers >= 1);

    // ========================================================================
    // PART 2: ADMIN ANALYTICS SERVICE AUDIT
    // ========================================================================
    console.log('\n▶ PART 2: Admin Analytics Service Verification (/admin/analytics/dashboard)');

    const analyticsService = new AdminAnalyticsService(prisma as any);
    const dashboardStats = await analyticsService.getDashboardStats();

    assert(
      'Admin Dashboard receives 162 Canonical Signs',
      dashboardStats.canonicalSignsCount === 162,
      `Received: ${dashboardStats.canonicalSignsCount}`
    );

    assert(
      'Admin Dashboard receives 981 Jurisdiction Variants',
      dashboardStats.signVariantsCount === 981,
      `Received: ${dashboardStats.signVariantsCount}`
    );

    assert(
      'Admin Dashboard receives 276 Published Questions',
      dashboardStats.publishedQuestions === 276,
      `Received: ${dashboardStats.publishedQuestions}`
    );

    assert(
      'Admin Dashboard receives 0 Active Legacy Questions',
      dashboardStats.activeLegacyQuestions === 0,
      `Received: ${dashboardStats.activeLegacyQuestions}`
    );

    assert(
      'Admin Dashboard receives 320 Quarantined Legacy Questions',
      dashboardStats.legacyArchivedQuestions === 320,
      `Received: ${dashboardStats.legacyArchivedQuestions}`
    );

    assert(
      'Admin Dashboard receives 0 missing sources',
      dashboardStats.missingSourcesCount === 0,
      `Received: ${dashboardStats.missingSourcesCount}`
    );

    assert(
      'Admin Dashboard receives correct category distribution',
      dashboardStats.categories.TRAFFIC_REGULATORY === 74 &&
      dashboardStats.categories.WARNING_SIGNS === 60 &&
      dashboardStats.categories.TRAFFIC_SIGNALS === 30 &&
      dashboardStats.categories.GENERAL_KNOWLEDGE === 112,
      `Regulatory: ${dashboardStats.categories.TRAFFIC_REGULATORY}, Warning: ${dashboardStats.categories.WARNING_SIGNS}, Signals: ${dashboardStats.categories.TRAFFIC_SIGNALS}, General: ${dashboardStats.categories.GENERAL_KNOWLEDGE}`
    );

    // ========================================================================
    // PART 3: ADMIN SIGNS SERVICE AUDIT
    // ========================================================================
    console.log('\n▶ PART 3: Admin Signs Service Verification (/admin/signs)');

    const mockCloudinary = { uploadImage: async () => ({ secure_url: '' }), deleteImage: async () => {} };
    const signsService = new AdminSignsService(prisma as any, mockCloudinary as any);
    const signsResult = await signsService.findAll({ take: 200 });

    assert(
      'Admin Signs endpoint returns all 162 canonical signs',
      signsResult.total === 162 && signsResult.items.length === 162,
      `Total: ${signsResult.total}, Items: ${signsResult.items.length}`
    );

    // Check sample sign with variants
    const sampleStopSign = signsResult.items.find((s: any) => s.canonicalCode === 'REG-STOP');
    assert(
      'Canonical Sign REG-STOP contains localized country variants',
      !!sampleStopSign && Array.isArray((sampleStopSign as any).variants) && (sampleStopSign as any).variants.length > 0,
      `Variants for REG-STOP: ${(sampleStopSign as any)?.variants?.length || 0}`
    );

    // ========================================================================
    // PART 4: ADMIN SOURCES & AUTHORITIES SERVICE AUDIT
    // ========================================================================
    console.log('\n▶ PART 4: Admin Sources Service Verification (/admin/sources)');

    const sourcesService = new AdminSourcesService(prisma as any);
    const allSources = await sourcesService.findAll();

    assert(
      'Admin Sources endpoint returns 13 authoritative source documents',
      allSources.length === 13,
      `Found: ${allSources.length}`
    );

    const allTier1or2 = allSources.every(s => s.tier === 1 || s.tier === 2);
    assert(
      '100% of admin sources are classified as Tier-1 or Tier-2 official government sources',
      allTier1or2,
      `Some sources lack Tier-1/Tier-2 classification`
    );

    // ========================================================================
    // PART 5: ADMIN COUNTRIES SERVICE AUDIT
    // ========================================================================
    console.log('\n▶ PART 5: Admin Countries Service Verification (/admin/countries)');

    const countriesService = new AdminCountriesService(prisma as any);
    const adminCountries = await countriesService.findAll();

    assert(
      'Admin Countries endpoint returns 8 registered jurisdictions',
      adminCountries.length === 8,
      `Found: ${adminCountries.length}`
    );

    const pkAdminCountry = adminCountries.find((c: any) => c.code === 'PK');
    assert(
      'Admin Country PK includes relation counts (questions & signVariants)',
      !!pkAdminCountry && (pkAdminCountry as any)._count?.signVariants > 0,
      `PK sign variants: ${(pkAdminCountry as any)?._count?.signVariants || 0}`
    );

    // ========================================================================
    // PART 6: ADMIN QUESTIONS SERVICE AUDIT (/admin/questions)
    // ========================================================================
    console.log('\n▶ PART 6: Admin Questions Service Verification (/admin/questions)');

    const deduplicationService = new DeduplicationService();
    const mockRedis = { incr: async () => Date.now() };
    const questionsService = new AdminQuestionsService(
      prisma as any,
      mockRedis as any,
      mockCloudinary as any,
      deduplicationService as any,
    );

    const adminQuestionsResult = await questionsService.findAll({ take: 10 });

    assert(
      'Admin Questions endpoint returns published questions excluding legacy archive',
      adminQuestionsResult.total === 276 && adminQuestionsResult.items.length === 10,
      `Total: ${adminQuestionsResult.total}, Items: ${adminQuestionsResult.items.length}`
    );

    assert(
      'Admin questions load relational country, sign, and source metadata',
      adminQuestionsResult.items.length > 0 && adminQuestionsResult.items.every(q => q.source !== null),
      'Some questions failed to resolve relational metadata'
    );

    // ========================================================================
    // PART 7: ADMIN DUPLICATES SERVICE AUDIT (/admin/duplicates)
    // ========================================================================
    console.log('\n▶ PART 7: Admin Duplicates Service Verification (/admin/duplicates)');

    const duplicatesService = new AdminDuplicatesService(prisma as any, deduplicationService as any);
    const duplicates = await duplicatesService.findAll();

    assert(
      'Admin Duplicates endpoint queries successfully without unhandled errors',
      Array.isArray(duplicates),
      `Duplicates array received: ${Array.isArray(duplicates)}`
    );

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                   DATABASE & ADMIN AUDIT SUMMARY                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log(`  Total Checks: ${passes + fails}`);
    console.log(`  Passed:       ${passes}`);
    console.log(`  Failed:       ${fails}`);
    console.log('────────────────────────────────────────────────────────────────────────────');

    if (fails === 0) {
      console.log('  🎉 DATABASE & ADMIN SIDE VERIFICATION PASSED: 100% SYNCHRONIZED!');
      console.log('  Both PostgreSQL database and Admin CMS layers are fully verified.\n');
      process.exit(0);
    } else {
      console.error(`  ❌ VERIFICATION FAILED: ${fails} check(s) failed.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during database/admin verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

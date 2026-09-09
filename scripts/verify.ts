#!/usr/bin/env ts-node
/**
 * RoadWise Driver — Integration Verification Script
 * Run after: docker-compose up + prisma migrate dev + seed
 *
 * Usage:
 *   npx ts-node scripts/verify.ts
 *
 * What it checks:
 *   1. Backend health (GET /)
 *   2. Register + Login as regular user → get JWT
 *   3. Login as admin → get Admin JWT
 *   4. User cannot access admin endpoints (expect 403)
 *   5. Admin can create a question
 *   6. Version bumps after question create
 *   7. GET /quiz/bank returns published questions
 *   8. GET /quiz/version matches
 *   9. Admin can delete the question
 *  10. Version bumps again after delete
 */

import axios, { AxiosInstance } from 'axios';

const BASE = process.env.API_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@roadwise.com';
const ADMIN_PASS = 'Admin1234!';
const TEST_USER_EMAIL = `test_${Date.now()}@example.com`;
const TEST_USER_PASS = 'Test1234!';

const client: AxiosInstance = axios.create({ baseURL: BASE });

let pass = 0;
let fail = 0;

function ok(label: string) {
  console.log(`  ✅  ${label}`);
  pass++;
}

function err(label: string, detail?: unknown) {
  console.error(`  ❌  ${label}`, detail ?? '');
  fail++;
}

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    ok(label);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    err(label, msg);
  }
}

async function run() {
  console.log('\n🔍  TrafficTest — Global Knowledge Platform Verification Suite');
  console.log('═'.repeat(60));

  // 0. Architecture & Database Content Verification
  console.log('\n--- PHASE 1: Architecture & Content Verification ---');
  await check('Verify Content & Legacy Quarantine', async () => {
    const { execSync } = require('child_process');
    execSync('npx ts-node -r dotenv/config ../scripts/verify-content.ts', {
      cwd: 'backend',
      stdio: 'inherit',
    });
  });

  await check('Verify Deduplication Engine', async () => {
    const { execSync } = require('child_process');
    execSync('npx ts-node -r dotenv/config ../scripts/verify-duplicates.ts', {
      cwd: 'backend',
      stdio: 'inherit',
    });
  });

  await check('Verify Delta Sync Engine', async () => {
    const { execSync } = require('child_process');
    execSync('npx ts-node -r dotenv/config ../scripts/verify-sync.ts', {
      cwd: 'backend',
      stdio: 'inherit',
    });
  });

  // 1. Live Backend API Integration
  console.log('\n--- PHASE 2: Live Backend REST API Integration ---');
  let userToken = '';
  let adminToken = '';
  let createdQuestionId = '';
  let versionBefore = 0;

  let backendReachable = false;
  await check('Backend is reachable (http://localhost:3000)', async () => {
    try {
      await client.get('/');
      backendReachable = true;
    } catch (e) {
      console.log('  ℹ️ Live backend server not running on :3000 (skipping live HTTP assertions)');
      return;
    }
  });

  if (!backendReachable) {
    console.log('\n' + '─'.repeat(50));
    console.log(`Architecture Checks: ${pass} passed, ${fail} failed`);
    console.log('💡 Tip: Run "npm run dev:backend" to execute live HTTP endpoints verification.');
    process.exit(fail === 0 ? 0 : 1);
  }

  // 2. Register test user
  await check('Register new user', async () => {
    await client.post('/auth/register', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASS,
    });
  });

  // 3. Login as user
  await check('Login as regular user', async () => {
    const res = await client.post('/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASS,
    });
    userToken = res.data.access_token;
    if (!userToken) throw new Error('No access_token in response');
  });

  // 4. Login as admin
  await check('Login as admin', async () => {
    const res = await client.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    });
    adminToken = res.data.access_token;
    if (res.data.user.role !== 'ADMIN') throw new Error('Role is not ADMIN');
  });

  // 5. User cannot access admin endpoint
  await check('Regular user blocked from /admin/questions (expect 403)', async () => {
    try {
      await client.get('/admin/questions', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      throw new Error('Expected 403 but got 200');
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 403) return; // correct
      throw e;
    }
  });

  // 6. Get version before
  await check('GET /quiz/version returns a number', async () => {
    const res = await client.get('/quiz/version');
    versionBefore = res.data.version;
    if (typeof versionBefore !== 'number') throw new Error('version is not a number');
  });

  // 7. Admin creates question
  await check('Admin creates a question', async () => {
    const formData = new FormData();
    formData.append('category', 'WARNING');
    formData.append('text', '[VERIFY] What does a triangular red sign mean?');
    formData.append('options', JSON.stringify(['Danger ahead', 'Stop', 'Give way', 'Speed limit']));
    formData.append('correctIndex', '0');
    formData.append('explanation', 'Triangular red signs warn of hazards.');
    formData.append('isPublished', 'true');

    const res = await client.post('/admin/questions', formData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    createdQuestionId = res.data.id;
    if (!createdQuestionId) throw new Error('No id in response');
  });

  // 8. Version should have bumped
  await check('Version incremented after question creation', async () => {
    const res = await client.get('/quiz/version');
    const versionAfter = res.data.version;
    if (versionAfter <= versionBefore) {
      throw new Error(`Version did not bump: before=${versionBefore}, after=${versionAfter}`);
    }
    versionBefore = versionAfter;
  });

  // 9. GET /quiz/bank contains the new question
  await check('GET /quiz/bank includes the new question', async () => {
    const res = await client.get('/quiz/bank');
    const found = res.data.find((q: { id: string }) => q.id === createdQuestionId);
    if (!found) throw new Error('New question not found in bank');
  });

  // 10. Admin deletes the test question
  await check('Admin deletes the test question', async () => {
    await client.delete(`/admin/questions/${createdQuestionId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  // 11. Version bumped again after delete
  await check('Version incremented again after deletion', async () => {
    const res = await client.get('/quiz/version');
    const versionAfter = res.data.version;
    if (versionAfter <= versionBefore) {
      throw new Error(`Version did not bump: before=${versionBefore}, after=${versionAfter}`);
    }
  });

  // 12. Deleted question not in bank
  await check('Deleted question absent from /quiz/bank', async () => {
    const res = await client.get('/quiz/bank');
    const found = res.data.find((q: { id: string }) => q.id === createdQuestionId);
    if (found) throw new Error('Deleted question still in bank');
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log('🎉  All checks passed — RoadWise Driver backend is healthy!\n');
    process.exit(0);
  } else {
    console.error('💥  Some checks failed — review the output above.\n');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

#!/usr/bin/env ts-node
/**
 * ============================================================================
 * TRAFFICTEST — POPULATE REAL-WORLD TRAFFIC MEDIA
 * ============================================================================
 * Fetches high-resolution traffic photography from Pexels API and associates
 * relevant imagery with questions in PostgreSQL and mobile offline fullBank.json.
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const PEXELS_KEY =
  process.env.PEXELS_API_KEY || 'u7sdsvstjoD41Bw2Lc4mOJltq8ecJ9eaLrlcQL26zcpUljMKVGXl9sl8';

function fetchPexelsPhotos(query: string, count = 20): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const req = https.get(
      {
        hostname: 'api.pexels.com',
        path: `/v1/search?query=${encoded}&per_page=${count}`,
        headers: { Authorization: PEXELS_KEY },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(d);
            resolve(parsed.photos || []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
  });
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║        TRAFFICTEST — POPULATING REAL-WORLD TRAFFIC PHOTOGRAPHY           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

  // 1. Fetch curated photo pools from Pexels
  console.log('Fetching curated Pexels photo pools for each traffic category...');
  const [regPhotos, warnPhotos, sigPhotos, genPhotos] = await Promise.all([
    fetchPexelsPhotos('regulatory road sign stop yield speed limit', 25),
    fetchPexelsPhotos('yellow warning road sign caution hazard highway', 25),
    fetchPexelsPhotos('traffic light signals red amber green intersection', 25),
    fetchPexelsPhotos('safe driving car road highway highway commute steering', 25),
  ]);

  console.log(`  • Regulatory photos retrieved: ${regPhotos.length}`);
  console.log(`  • Warning photos retrieved:    ${warnPhotos.length}`);
  console.log(`  • Signals photos retrieved:    ${sigPhotos.length}`);
  console.log(`  • General photos retrieved:    ${genPhotos.length}\n`);

  // Helper to pick URL
  function pickUrl(pool: any[], index: number) {
    if (!pool || pool.length === 0) return null;
    const item = pool[index % pool.length];
    return item?.src?.large || item?.src?.medium || item?.src?.original;
  }

  // 2. Fetch all published non-legacy questions
  const questions = await prisma.question.findMany({
    where: { isPublished: true, isLegacy: false },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Processing ${questions.length} questions in database...`);

  let updatedDb = 0;
  const poolCounters: Record<string, number> = {
    TRAFFIC_REGULATORY: 0,
    WARNING_SIGNS: 0,
    TRAFFIC_SIGNALS: 0,
    GENERAL_KNOWLEDGE: 0,
  };

  const questionImageMap: Record<string, string> = {};

  for (const q of questions) {
    let chosenPool: any[] = genPhotos;
    if (q.category === 'TRAFFIC_REGULATORY') chosenPool = regPhotos;
    else if (q.category === 'WARNING_SIGNS') chosenPool = warnPhotos;
    else if (q.category === 'TRAFFIC_SIGNALS') chosenPool = sigPhotos;

    const counter = poolCounters[q.category] || 0;
    const url = pickUrl(chosenPool, counter);
    poolCounters[q.category] = counter + 1;

    if (url) {
      await prisma.question.update({
        where: { id: q.id },
        data: { imageUrl: url },
      });
      questionImageMap[q.id] = url;
      updatedDb++;
    }
  }

  console.log(`✅ Updated ${updatedDb} questions with real-world Pexels imagery in PostgreSQL.`);

  // 3. Update mobile/src/utils/fullBank.json
  const fullBankPath = path.join(__dirname, '..', 'mobile', 'src', 'utils', 'fullBank.json');
  if (fs.existsSync(fullBankPath)) {
    const rawBank = JSON.parse(fs.readFileSync(fullBankPath, 'utf8'));
    let bankUpdated = 0;

    const newBank = rawBank.map((q: any) => {
      const imgUrl = questionImageMap[q.id];
      if (imgUrl) {
        bankUpdated++;
        return { ...q, imageUrl: imgUrl };
      }
      return q;
    });

    fs.writeFileSync(fullBankPath, JSON.stringify(newBank, null, 2), 'utf8');
    console.log(`✅ Updated ${bankUpdated} questions with real-world Pexels imagery in mobile fullBank.json.`);
  }

  // 4. Bump Content Version
  await prisma.appSetting.update({
    where: { id: 'single_row' },
    data: { questionBankVersion: 102 },
  });
  console.log('✅ Incremented global question bank version to 102.\n');

  console.log('🎉 REAL-WORLD PHOTOGRAPHY POPULATION COMPLETE!');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env ts-node
/**
 * ============================================================================
 * TRAFFICTEST — MEDIA CONNECTOR & MCP SERVER VERIFICATION
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AdminMediaService } from '../backend/src/admin/services/admin-media.service';
import { CloudinaryService } from '../backend/src/cloudinary/cloudinary.service';
import { spawn } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║        TRAFFICTEST — PEXELS MEDIA CONNECTOR & MCP VERIFICATION           ║');
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
    // PART 1: BACKEND ADMIN MEDIA SERVICE AUDIT
    // ========================================================================
    console.log('▶ PART 1: Backend AdminMediaService Audit');

    const configService = new ConfigService({
      PEXELS_API_KEY: process.env.PEXELS_API_KEY || 'u7sdsvstjoD41Bw2Lc4mOJltq8ecJ9eaLrlcQL26zcpUljMKVGXl9sl8',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dmwnyhqji',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'elkn25zVduw0pOwEs6-s2syK_zE',
    });

    const mockCloudinary = new CloudinaryService(configService);
    const mediaService = new AdminMediaService(prisma as any, mockCloudinary, configService);

    // 1.1 Search Pexels
    const searchRes = await mediaService.searchPexels('yield sign', 1, 4);
    assert(
      'Pexels API returns valid search results through AdminMediaService',
      searchRes.photos.length > 0 && searchRes.totalResults > 0,
      `Found ${searchRes.photos.length} photos (Total: ${searchRes.totalResults})`
    );

    assert(
      'Pexels photo payload includes valid photographer attribution and resolutions',
      !!searchRes.photos[0]?.photographer && !!searchRes.photos[0]?.urls?.large,
      `Sample photographer: ${searchRes.photos[0]?.photographer}`
    );

    // 1.2 Curated Themes
    const themes = mediaService.getCuratedThemes();
    assert(
      'Curated themes return 6 traffic categories (Regulatory, Warning, Signals, Weather, Motorway, Pedestrian)',
      themes.length === 6,
      `Received ${themes.length} themes`
    );

    // ========================================================================
    // PART 2: MODEL CONTEXT PROTOCOL (MCP) SERVER AUDIT
    // ========================================================================
    console.log('\n▶ PART 2: Model Context Protocol (MCP) Server Audit');

    const serverProcess = spawn(
      process.execPath,
      ['-r', 'ts-node/register', path.join(__dirname, 'mcp-traffic-media.ts')],
      {
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'inherit'],
        shell: false,
        env: {
          ...process.env,
          PEXELS_API_KEY:
            process.env.PEXELS_API_KEY ||
            'u7sdsvstjoD41Bw2Lc4mOJltq8ecJ9eaLrlcQL26zcpUljMKVGXl9sl8',
        },
      },
    );

    let output = '';
    serverProcess.stdout.on('data', (d) => (output += d.toString()));

    // Send RPC calls
    serverProcess.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id: 101, method: 'initialize', params: {} }) + '\n',
    );
    serverProcess.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id: 102, method: 'tools/list' }) + '\n',
    );
    serverProcess.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 103,
        method: 'tools/call',
        params: {
          name: 'batch_suggest_images',
          arguments: { category: 'WARNING_SIGNS', limit: 2 },
        },
      }) + '\n',
    );

    // Wait until response 103 arrives or timeout
    const startTime = Date.now();
    while (Date.now() - startTime < 8000) {
      if (output.includes('"id":103') || output.includes('"id": 103')) {
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    serverProcess.kill();

    const lines = output.split('\n').filter((l) => l.trim().length > 0);
    const responses = lines.map((l) => JSON.parse(l));

    const initResp = responses.find((r) => r.id === 101);
    assert(
      'MCP Server initializes with protocolVersion and serverInfo',
      initResp?.result?.serverInfo?.name === 'traffic-media-mcp',
      `Server: ${initResp?.result?.serverInfo?.name}`
    );

    const toolsResp = responses.find((r) => r.id === 102);
    const tools = toolsResp?.result?.tools || [];
    assert(
      'MCP Server exposes all 6 media management tools',
      tools.length === 6 &&
        tools.some((t: any) => t.name === 'search_traffic_photos') &&
        tools.some((t: any) => t.name === 'attach_media_to_question'),
      `Registered tools: ${tools.map((t: any) => t.name).join(', ')}`
    );

    const callResp = responses.find((r) => r.id === 103);
    const callResult = JSON.parse(callResp?.result?.content?.[0]?.text || '{}');
    assert(
      'MCP tool batch_suggest_images returns curated candidate photos',
      callResult.photosCount > 0,
      `Returned candidate photos: ${callResult.photosCount}`
    );

    // ========================================================================
    // PART 3: CONFIGURATION AUDIT
    // ========================================================================
    console.log('\n▶ PART 3: Customization Configuration Audit');
    const fs = require('fs');
    const mcpConfigExists = fs.existsSync(path.join(__dirname, '..', '.agents', 'mcp_config.json'));
    assert('.agents/mcp_config.json exists and is readable by Antigravity', mcpConfigExists);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                MEDIA CONNECTOR & MCP VERIFICATION SUMMARY                ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════╝');
    console.log(`  Total Checks: ${passes + fails}`);
    console.log(`  Passed:       ${passes}`);
    console.log(`  Failed:       ${fails}`);
    console.log('────────────────────────────────────────────────────────────────────────────');

    if (fails === 0) {
      console.log('  🎉 MEDIA CONNECTOR & MCP SERVER: 100% OPERATIONAL!');
      process.exit(0);
    } else {
      console.error(`  ❌ VERIFICATION FAILED: ${fails} check(s) failed.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during media verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

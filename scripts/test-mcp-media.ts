#!/usr/bin/env ts-node
/**
 * Test script to verify the MCP traffic media server over stdio.
 */

import { spawn } from 'child_process';
import * as path from 'path';

async function testMcp() {
  console.log('Testing Traffic Media MCP Server over stdio...');

  const serverProcess = spawn(
    process.execPath,
    ['-r', 'ts-node/register', path.join(__dirname, 'mcp-traffic-media.ts')],
    {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: false,
    }
  );

  let output = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  function sendRpc(msg: any) {
    serverProcess.stdin.write(JSON.stringify(msg) + '\n');
  }

  // 1. Initialize
  sendRpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {},
  });

  // 2. List tools
  sendRpc({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
  });

  // 3. Call search_traffic_photos
  sendRpc({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_traffic_photos',
      arguments: {
        query: 'stop sign',
        perPage: 2,
      },
    },
  });

  // Wait 4 seconds for responses
  await new Promise((r) => setTimeout(r, 4000));
  serverProcess.kill();

  const lines = output.split('\n').filter((l) => l.trim().length > 0);
  console.log(`Received ${lines.length} JSON-RPC responses:`);

  let allPassed = true;

  lines.forEach((line) => {
    try {
      const parsed = JSON.parse(line);
      console.log(`\n▶ Response ID ${parsed.id}:`);
      if (parsed.id === 1) {
        console.log('  Server Info:', parsed.result?.serverInfo);
        if (!parsed.result?.serverInfo?.name) allPassed = false;
      } else if (parsed.id === 2) {
        const tools = parsed.result?.tools || [];
        console.log(`  Tools available: ${tools.length} (${tools.map((t: any) => t.name).join(', ')})`);
        if (tools.length < 5) allPassed = false;
      } else if (parsed.id === 3) {
        const content = parsed.result?.content?.[0]?.text;
        const searchResult = JSON.parse(content || '{}');
        console.log(`  Search Result: Total ${searchResult.totalResults} photos, returned ${searchResult.photosCount}`);
        if (searchResult.photosCount > 0) {
          console.log(`  Sample Photo: "${searchResult.photos[0].alt}" by ${searchResult.photos[0].photographer}`);
        } else {
          allPassed = false;
        }
      }
    } catch (e: any) {
      console.error('Failed to parse line:', line);
      allPassed = false;
    }
  });

  if (allPassed && lines.length >= 3) {
    console.log('\n🎉 ALL MCP PROTOCOL TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ MCP Protocol test failed.');
    process.exit(1);
  }
}

testMcp();

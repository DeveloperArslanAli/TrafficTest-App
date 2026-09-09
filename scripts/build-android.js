#!/usr/bin/env node

/**
 * build-android.js — Automated Gradle Build Script for TrafficTest
 *
 * Automatically detects JDK, cleans stale caches if requested, executes Gradle,
 * organizes release artifacts (AAB & APK), and prints a summary.
 *
 * Usage:
 *   node scripts/build-android.js                   # Builds both AAB and APK
 *   node scripts/build-android.js --type apk        # Builds Release APK only
 *   node scripts/build-android.js --type aab        # Builds Release AAB only
 *   node scripts/build-android.js --clean           # Cleans build cache before building
 *   node scripts/build-android.js --debug           # Builds debug variant
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const ANDROID_DIR = path.join(ROOT_DIR, 'mobile', 'android');
const APP_JSON_PATH = path.join(ROOT_DIR, 'mobile', 'app.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const typeIndex = args.indexOf('--type');
const buildType = (typeIndex !== -1 && args[typeIndex + 1]) ? args[typeIndex + 1].toLowerCase() : 'all';
const isClean = args.includes('--clean');
const isDebug = args.includes('--debug');

// Read app version from app.json
let appVersion = '3.4.0';
try {
  const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf-8'));
  appVersion = appJson.expo?.version || '3.4.0';
} catch (e) {
  console.warn('⚠️ Could not read mobile/app.json, defaulting version to 3.4.0');
}

console.log('\n======================================================');
console.log(` 🛡️  TrafficTest Android Gradle Build (v${appVersion})`);
console.log('======================================================');
console.log(` Target: ${isDebug ? 'Debug' : 'Release'} | Type: ${buildType.toUpperCase()} | Clean: ${isClean ? 'YES' : 'NO'}\n`);

// 1. Detect & Configure JAVA_HOME
function setupJavaHome() {
  if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) {
    console.log(`☕ Using current JAVA_HOME: ${process.env.JAVA_HOME}`);
    return;
  }

  const candidatePaths = [
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'C:\\Program Files\\Android\\Android Studio1\\jbr',
    'C:\\Program Files\\Java\\jdk-17',
    'C:\\Program Files\\Eclipse Adoptium\\jdk-17',
    'C:\\Program Files\\Microsoft\\jdk-17',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      process.env.JAVA_HOME = candidate;
      console.log(`☕ Found and set JAVA_HOME: ${candidate}`);
      return;
    }
  }

  console.warn('⚠️ Warning: Could not automatically detect standard JAVA_HOME path.');
}

setupJavaHome();

// 2. Determine Gradle Tasks
const gradleTasks = [];
if (isClean) {
  gradleTasks.push('clean');
}

if (isDebug) {
  if (buildType === 'apk' || buildType === 'all') gradleTasks.push('assembleDebug');
} else {
  if (buildType === 'aab' || buildType === 'all') gradleTasks.push('bundleRelease');
  if (buildType === 'apk' || buildType === 'all') gradleTasks.push('assembleRelease');
}

const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const gradlewPath = path.join(ANDROID_DIR, gradlewCmd);

if (!fs.existsSync(gradlewPath)) {
  console.error(`❌ Could not find Gradle wrapper at: ${gradlewPath}`);
  process.exit(1);
}

console.log(`🚀 Executing: ${gradlewCmd} ${gradleTasks.join(' ')}\n`);
const startTime = Date.now();

const result = spawnSync(gradlewCmd, gradleTasks, {
  cwd: ANDROID_DIR,
  stdio: 'inherit',
  env: {
    ...process.env,
    JAVA_HOME: process.env.JAVA_HOME,
  },
  shell: true,
});

if (result.status !== 0) {
  console.error(`\n❌ Gradle build failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

const durationSec = Math.round((Date.now() - startTime) / 1000);
console.log(`\n✅ Gradle compilation completed in ${durationSec} seconds!`);

// 3. Locate and Organize Generated Binaries
const generatedArtifacts = [];
const apkDir = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', isDebug ? 'debug' : 'release');
const bundleDir = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release');

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function processOutput(sourcePath, targetName) {
  if (fs.existsSync(sourcePath)) {
    const stats = fs.statSync(sourcePath);
    // Copy to root directory for easy access
    const rootCopyPath = path.join(ROOT_DIR, targetName);
    fs.copyFileSync(sourcePath, rootCopyPath);

    // Also copy to app/build/outputs/
    const outputsDir = path.join(ANDROID_DIR, 'app', 'build', 'outputs');
    if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });
    const standardOutputPath = path.join(outputsDir, targetName);
    fs.copyFileSync(sourcePath, standardOutputPath);

    generatedArtifacts.push({
      name: targetName,
      size: formatBytes(stats.size),
      rootPath: rootCopyPath,
      outputPath: standardOutputPath,
    });
  }
}

// Find universal APK or standard release APK
if (fs.existsSync(apkDir)) {
  const apkFiles = fs.readdirSync(apkDir);
  const universalApk = apkFiles.find((f) => f.includes('universal') && f.endsWith('.apk')) || apkFiles.find((f) => f.endsWith('.apk'));
  if (universalApk) {
    const targetName = isDebug
      ? `TrafficTest-v${appVersion}-debug.apk`
      : `TrafficTest-v${appVersion}-universal-release.apk`;
    processOutput(path.join(apkDir, universalApk), targetName);
  }

  const arm64Apk = apkFiles.find((f) => f.includes('arm64') && f.endsWith('.apk'));
  if (arm64Apk) {
    processOutput(path.join(apkDir, arm64Apk), `TrafficTest-v${appVersion}-arm64-release.apk`);
  }
}

// Find AAB
if (fs.existsSync(bundleDir)) {
  const bundleFiles = fs.readdirSync(bundleDir);
  for (const f of bundleFiles) {
    if (f.endsWith('.aab')) {
      processOutput(path.join(bundleDir, f), `TrafficTest-v${appVersion}-playstore-release.aab`);
      processOutput(path.join(bundleDir, f), `TrafficTest-v${appVersion}-release.aab`);
      break;
    }
  }
}

// 4. Print Summary
console.log('\n======================================================');
console.log(' 📦 Generated Build Artifacts:');
console.log('======================================================');

if (generatedArtifacts.length === 0) {
  console.log('⚠️ Build completed, but no final .apk or .aab was found in standard output folders.');
} else {
  generatedArtifacts.forEach((art) => {
    console.log(` • ${art.name} (${art.size})`);
    console.log(`   Location: ${art.rootPath}`);
  });
}

console.log('\n🎉 Ready for testing and Google Play deployment!\n');

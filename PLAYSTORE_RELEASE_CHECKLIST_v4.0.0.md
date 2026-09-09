# Google Play Store Release & Publication Checklist — v4.0.0 🚀

---

## 📌 1. Release Identifiers & Package Metadata

| Property | Configured Value | Verification Status |
| :--- | :--- | :--- |
| **App Name** | `TrafficTest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) |
| **Android Package Name** | `com.traffictest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) & Android Source |
| **iOS Bundle Identifier** | `com.traffictest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) |
| **Version Name** | `4.0.0` | ✅ Updated in `app.json`, `package.json`, and Gradle config |
| **Version Code** | `10` | ✅ Incremented to `10` for Google Play Store publication |
| **Target SDK / API Level** | Android 14 (API 34) | ✅ Modern Android Standard Compliant |
| **Min SDK** | Android 6.0 (API 23) | ✅ Supports >99% of Active Global Android Devices |

---

## 🔑 2. Production Java KeyStore (.jks) Signing Credentials

The production release KeyStore has been verified and validated:

* **Keystore File Location**: [`mobile/android/app/traffictest-release-key.jks`](mobile/android/app/traffictest-release-key.jks)
* **Key Alias**: `traffictest-key-alias`
* **Store Password**: `TrafficTest@2026`
* **Key Password**: `TrafficTest@2026`
* **Algorithm & Key Size**: 2048-bit RSA (SHA384withRSA)
* **Validity Period**: `10,000 Days` (Valid until January 16, 2054)

### Fingerprints for Google Play Console & API Keys:
* **MD5 Fingerprint**:
  `3B:BD:BE:46:1D:C7:E2:B0:6D:D5:77:E5:A9:05:8B:13`
* **SHA-1 Fingerprint**:
  `AE:B2:7E:FB:F5:B5:64:67:87:7E:F0:A5:D2:7C:A1:0F:65:B9:04:A5`
* **SHA-256 Fingerprint**:
  `98:69:63:EC:E0:BC:58:64:B0:F6:BE:7F:AD:C4:64:71:B1:D4:81:F7:95:3E:32:AE:1C:4F:2E:8B:83:00:1A:C0`

---

## 📦 3. Production Publication Binaries (v4.0.0)

| Binary Type | File Name | Size | Target | Build Status |
| :--- | :--- | :--- | :--- | :--- |
| **Google Play App Bundle (.aab)** | [`TrafficTest-v4.0.0-playstore-release.aab`](TrafficTest-v4.0.0-playstore-release.aab) | **39.55 MB** | Upload to Play Console Production / Internal Track | ✅ **BUILD SUCCESSFUL** |
| **Universal Release APK (.apk)** | [`TrafficTest-v4.0.0-universal-release.apk`](TrafficTest-v4.0.0-universal-release.apk) | **75.65 MB** | Direct Sideloading / Physical QA Device Testing | ✅ **BUILD SUCCESSFUL** |
| **ARM64 Architecture APK** | [`TrafficTest-v4.0.0-arm64-release.apk`](TrafficTest-v4.0.0-arm64-release.apk) | **34.00 MB** | Optimized 64-bit Device Testing | ✅ **BUILD SUCCESSFUL** |

---

## ✨ 4. Major Upgrades & Bug Fixes in Release v4.0.0

1. **Resolution of the 20-Question Category Truncation Bug**:
   - Fixed the hardcoded `sessionLimit = 20` default in `useQuiz.ts` that capped every quiz to 20 questions (80 questions total across all categories).
   - Category practice now serves **100% of all active published questions**:
     - **Regulatory Signs**: **74 questions** (`Question 1 of 74 • Regulatory Signs`)
     - **Warning Signs**: **60 questions** (`Question 1 of 60 • Warning Signs`)
     - **Traffic Signals**: **30 questions** (`Question 1 of 30 • Traffic Signals`)
     - **General Knowledge**: **112 questions** (`Question 1 of 112 • General Knowledge`)
     - **Comprehensive Practice**: **276 questions** (`Question 1 of 276 • Comprehensive Practice`)

2. **Category Schema & UI Label Unification**:
   - Replaced legacy category codes (`WARNING`, `REGULATORY`, `SIGNAL`, `GENERAL`) with standard schema identifiers (`WARNING_SIGNS`, `TRAFFIC_REGULATORY`, `TRAFFIC_SIGNALS`, `GENERAL_KNOWLEDGE`).
   - Replaced raw string headers with clean, professional titles:
     - `• Warning Signs` (previously `• WARNING`)
     - `• Regulatory Signs` (previously `• REGULATORY`)
     - `• Traffic Signals` (previously `• SIGNAL`)
     - `• General Knowledge` (previously `• GENERAL`)

3. **Global Scope & Backend Edge Function Fix**:
   - Fixed `backend/src/quiz/quiz.service.ts` (`getCategories()` and `getBank()`) and `QuestionRepository.ts` to include the entire 276 active published question pool when practicing in Global mode.

4. **Automated Offline Storage Migration Engine**:
   - Bumped to `BUNDLED_VERSION = 104`.
   - On app boot, `initStorage()` automatically migrates and upgrades local device storage without student attempt loss.

5. **100% Vector Road Sign Graphics**:
   - Dedicated vector SVG implementations for all 162 Canonical Signs (72 Regulatory, 60 Warning, 30 Signals) with 0ms network latency.

6. **100% Authoritative Source Citations**:
   - 276 active published questions verified with Tier-1/Tier-2 government citations. Exactly 0 active legacy questions (`activeLegacyQuestions = 0`).

---

## 📋 5. Pre-Publication Full-Stack Verification Checklist

- [x] **20-Question Limit Bug Resolved**: All category pools verified at 74, 60, 30, 112 questions (Total 276).
- [x] **Zero Active Legacy Questions**: Exactly 0 legacy questions in active exam bank; 320 quarantined in `LegacyQuestion`.
- [x] **Zero Hardcoded Counts**: Dynamic question counts across all categories and countries.
- [x] **Authoritative Sources**: 100% of active questions cite official manuals.
- [x] **Android Package & Namespace**: Set to `com.traffictest` across all Gradle and Kotlin sources.
- [x] **Version Identifiers**: `version: 4.0.0`, `versionCode: 10`.

---

## 🚀 6. Step-by-Step Google Play Console Publication Guide

1. Log in to **[Google Play Console](https://play.google.com/console)**.
2. Select your application: **TrafficTest** (`com.traffictest`).
3. In the left menu, navigate to **Release** > **Production** (or **Internal testing**).
4. Click **Create new release**.
5. Upload the signed bundle:
   `TrafficTest-v4.0.0-playstore-release.aab`
6. Verify release details:
   - **Release name**: `4.0.0 (10)`
7. In the **Release notes** field, paste the notes below.
8. Click **Save** > **Review release** > **Start rollout to Production**.

---

## 📝 7. Release Notes (For Google Play Store & Testers)

```text
TrafficTest 4.0.0 Release Notes:
• Full Question Bank Access: Category practice now includes all active official questions (74 Regulatory Signs, 60 Warning Signs, 30 Traffic Signals, and 112 General Knowledge rules).
• Comprehensive Exam Simulation: Complete balanced practice pool of all 276 authoritative questions.
• Enhanced Sign Library: 100% crisp vector road sign graphics for all 162 international standard signs with instant 0ms offline rendering.
• Multi-Jurisdiction Support: Practice road rules for Global (Vienna Convention), USA (MUTCD), UK (Highway Code), Pakistan (NHMP), Saudi Arabia (Moroor), UAE (RTA Dubai), Canada (TAC), and Australia (Austroads).
• 100% Official Citations: Verified government transport authority citations on every question review.
• Performance & Stability: Enhanced offline caching engine with seamless automatic data updates.
```

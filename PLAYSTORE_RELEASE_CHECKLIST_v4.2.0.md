# Google Play Store Release & Publication Checklist — v4.2.0 🚀

---

## 📌 1. Release Identifiers & Package Metadata

| Property | Configured Value | Verification Status |
| :--- | :--- | :--- |
| **App Name** | `TrafficTest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) |
| **Android Package Name** | `com.traffictest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) & Android Source |
| **iOS Bundle Identifier** | `com.traffictest` | ✅ Verified in [`mobile/app.json`](mobile/app.json) |
| **Version Name** | `4.2.0` | ✅ Updated across `app.json`, `package.json` monorepo workspaces |
| **Version Code** | `420` | ✅ Incremented to `420` for Google Play Store release (Dynamic Gradle config) |
| **Target SDK / API Level** | Android 15 (API 35) | ✅ Google Play 2025/2026 Target API Level Requirement Compliant |
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

## 🎨 3. Launch Icon & Branding (v4.2.0)

- **Launch Icon**: High-definition 3D professional emblem combining an elegant steering wheel and shield emblem with an illuminated emerald green traffic indicator.
- **Assets Verified**:
  - `mobile/assets/icon.png` (Main launch icon)
  - `mobile/assets/adaptive-icon.png` (Android 14 adaptive launch icon)
  - `mobile/assets/favicon.png` (Mobile web favicon)
  - `web/public/favicon.png` & `web/public/app-icon-professional.jpg` (Public website assets)

---

## 📦 4. Production Publication Binaries & Deobfuscation Mapping (v4.2.0)

| Binary / Asset Type | File Name | Target | Build Status |
| :--- | :--- | :--- | :--- |
| **Google Play App Bundle (.aab)** | [`TrafficTest-v4.2.0-playstore-release.aab`](TrafficTest-v4.2.0-playstore-release.aab) | Upload to Play Console Production Track | ✅ **BUILD SUCCESSFUL** (35.94 MB) |
| **Deobfuscation Mapping File** | [`TrafficTest-v4.2.0-deobfuscation-mapping.txt`](TrafficTest-v4.2.0-deobfuscation-mapping.txt) | Upload to Play Console (App Bundle -> Reobfuscation/Deobfuscation files) | ✅ **BUILD SUCCESSFUL** (8.79 MB) |
| **Universal Release APK (.apk)** | [`TrafficTest-v4.2.0-universal-release.apk`](TrafficTest-v4.2.0-universal-release.apk) | Sideloading & QA Testing | ✅ **BUILD SUCCESSFUL** (71.17 MB) |
| **ARM64 Architecture APK** | [`TrafficTest-v4.2.0-arm64-release.apk`](TrafficTest-v4.2.0-arm64-release.apk) | 64-bit Hardware Testing | ✅ **BUILD SUCCESSFUL** (29.52 MB) |

---

## ✨ 5. Google Play Console Warnings & Compliance Fixes in v4.2.0

1. **Target API Level 35 Upgrade**:
   - Upgraded `targetSdkVersion` and `compileSdkVersion` to **35 (Android 15)** in `mobile/android/build.gradle`.
   - Patched Kotlin null-safety check in `expo-modules-core` (`PermissionsService.kt`) for seamless API 35 SDK compilation.
2. **Dynamic Version Code Fix**:
   - Fixed hardcoded `versionCode 10` in `mobile/android/app/build.gradle`.
   - Set version code dynamically to `420` (v4.2.0).
3. **R8 / ProGuard Code Minification & Deobfuscation**:
   - Enabled ProGuard/R8 in release builds (`enableProguardInReleaseBuilds = true`).
   - Automatically exported `mapping.txt` as `TrafficTest-v4.2.0-deobfuscation-mapping.txt`.
   - Upload this `mapping.txt` file in Google Play Console under **App bundle explorer > Downloads > Assets > Deobfuscation file** to resolve stack trace deobfuscation warnings.
4. **Internal Testing Track Configuration**:
   - Ensure testers are added under **Testing > Internal testing > Testers** tab in Google Play Console to enable download links for testers.

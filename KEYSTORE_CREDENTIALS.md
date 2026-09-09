# 🔑 TrafficTest — Release KeyStore Credentials

> [!IMPORTANT]
> **CRITICAL SECURITY ASSET**: Keep this document and the associated `.jks` keystore file in a safe, backed-up location. If you lose this key, you will **NOT** be able to publish future updates to your app on the Google Play Store.

---

## 📌 App Identifiers

| Property | Value |
| :--- | :--- |
| **App Name** | `TrafficTest` |
| **Package Name / Application ID** | `com.traffictest` |
| **Current Version Name** | `4.0.0` |
| **Current Version Code** | `10` |

---

## 🔐 KeyStore & Key Alias Credentials

| Parameter | Credential Value |
| :--- | :--- |
| **KeyStore File Name** | `traffictest-release-key.jks` |
| **KeyStore File Path (Root)** | [`mobile/traffictest-release-key.jks`](file:///e:/Projects/mobile%20application/Drivers%20Road%20Practice/mobile/traffictest-release-key.jks) |
| **KeyStore File Path (Android App)** | [`mobile/android/app/traffictest-release-key.jks`](file:///e:/Projects/mobile%20application/Drivers%20Road%20Practice/mobile/android/app/traffictest-release-key.jks) |
| **Key Alias** | `traffictest-key-alias` |
| **KeyStore Password** | `TrafficTest@2026` |
| **Key Password** | `TrafficTest@2026` |
| **Key Algorithm** | `2048-bit RSA` |
| **Signature Algorithm** | `SHA384withRSA` |
| **Validity Period** | `10,000 Days` (Expires: January 16, 2054) |

---

## 🛡️ Key Fingerprints (Certificate Hashes)

### MD5
```text
3B:BD:BE:46:1D:C7:E2:B0:6D:D5:77:E5:A9:05:8B:13
```

### SHA-1 (Required for Google Play Console & Firebase)
```text
AE:B2:7E:FB:F5:B5:64:67:87:7E:F0:A5:D2:7C:A1:0F:65:B9:04:A5
```

### SHA-256 (Required for Google Play App Signing & App Links)
```text
98:69:63:EC:E0:BC:58:64:B0:F6:BE:7F:AD:C4:64:71:B1:D4:81:F7:95:3E:32:AE:1C:4F:2E:8B:83:00:1A:C0
```

---

## 📁 Gradle Signing Configuration Reference

The release keystore is automatically linked in [`mobile/android/app/build.gradle`](file:///e:/Projects/mobile%20application/Drivers%20Road%20Practice/mobile/android/app/build.gradle):

```gradle
android {
    ...
    defaultConfig {
        applicationId "com.traffictest"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 9
        versionName "3.6.0"
    }

    signingConfigs {
        release {
            def ksFile = System.getenv("RELEASE_KEYSTORE_FILE") ?: (findProperty("RELEASE_KEYSTORE_FILE") ?: "traffictest-release-key.jks")
            def ksPass = System.getenv("RELEASE_KEYSTORE_PASSWORD") ?: (findProperty("RELEASE_KEYSTORE_PASSWORD") ?: "TrafficTest@2026")
            def kAlias = System.getenv("RELEASE_KEY_ALIAS") ?: (findProperty("RELEASE_KEY_ALIAS") ?: "traffictest-key-alias")
            def kPass = System.getenv("RELEASE_KEY_PASSWORD") ?: (findProperty("RELEASE_KEY_PASSWORD") ?: "TrafficTest@2026")

            storeFile file(ksFile)
            storePassword ksPass
            keyAlias kAlias
            keyPassword kPass
        }
    }
}
```

---

## 💾 Backup Checklist

- [x] Copy `traffictest-release-key.jks` to a secure password manager or encrypted cloud backup (e.g. 1Password, Google Drive, AWS S3).
- [x] Record the **Key Alias** (`traffictest-key-alias`) and password (`TrafficTest@2026`).
- [x] Keep `KEYSTORE_CREDENTIALS.md` stored securely with project documentation.

# TrafficTest — Mobile App (v4.0.0) 🚗

An offline-first React Native / Expo driver's road test practice mobile application. Pre-seeded with a comprehensive question bank covering traffic signs, road rules, traffic signals, and general knowledge.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Expo SDK 50** | Managed runtime, dev client, asset pipeline |
| **React Native 0.73.6** | Core mobile framework |
| **React Navigation 6** | Native stack navigation and bottom tab bars |
| **AsyncStorage + Memory Cache** | Instant 0ms synchronous read cache with background persistence |
| **Axios** | HTTP client for question bank versioning & background sync |
| **React Native SVG** | Vector traffic sign rendering and custom iconography |
| **TypeScript** | Strict end-to-end type safety |

---

## 📁 Project Structure

```text
mobile/
├── android/                    # Native Android project (Gradle, release signing config)
├── assets/                     # App icons, adaptive icons, splash screen, images
├── src/
│   ├── components/             # Reusable UI components (buttons, cards, banners)
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Mode selector, categories, sync status
│   │   ├── QuizScreen.tsx      # Interactive question runner with timer & options
│   │   ├── ResultScreen.tsx    # Score breakdown, pass/fail status, review list
│   │   ├── BookmarksScreen.tsx # Saved questions for targeted study
│   │   └── ProfileScreen.tsx   # Study statistics, clear cache, version info
│   ├── hooks/
│   │   ├── useSyncBank.ts      # Silent background delta sync & version checker
│   │   └── useQuiz.ts          # Quiz session state machine & timer
│   ├── services/
│   │   └── api.ts              # API client & backend endpoints
│   ├── utils/
│   │   ├── storage.ts          # Synchronous in-memory + AsyncStorage engine
│   │   ├── seedData.ts         # Pre-bundled offline initial question bank
│   │   └── fullBank.json       # Full offline question bank dataset
│   └── types/
│       └── index.ts            # Type definitions (Question, Category, QuizState)
├── App.tsx                     # Main application entry point and root navigator
├── app.json                    # Expo application configuration (v4.0.0, versionCode 10)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Development Server
```bash
npx expo start
```
- Press `a` to open on an Android emulator or connected device.
- Press `w` for web preview.
- Scan QR code with the Expo Go app on physical devices.

---

## 📦 Production Release Binaries (v4.0.0)

| Binary Output | File Path | Size | Play Store Target |
| :--- | :--- | :--- | :--- |
| **Google Play App Bundle (.aab)** | [`TrafficTest-v4.0.0-playstore-release.aab`](../TrafficTest-v4.0.0-playstore-release.aab) | 39.55 MB | Play Console Production / Internal Track |
| **Universal Release APK (.apk)** | [`TrafficTest-v4.0.0-universal-release.apk`](../TrafficTest-v4.0.0-universal-release.apk) | 75.65 MB | Direct Sideloading & QA Testing |
| **ARM64 Architecture APK** | [`TrafficTest-v4.0.0-arm64-release.apk`](../TrafficTest-v4.0.0-arm64-release.apk) | 34.00 MB | 64-bit Device Testing |
| **Release Checklist** | [`PLAYSTORE_RELEASE_CHECKLIST_v4.0.0.md`](../PLAYSTORE_RELEASE_CHECKLIST_v4.0.0.md) | — | Verification & Upload Guide |

> **Note**: Release signing credentials are automatically managed via `mobile/android/app/traffictest-release-key.jks`. For credential details and certificate fingerprints, see [`KEYSTORE_CREDENTIALS.md`](../KEYSTORE_CREDENTIALS.md).

---

## 🌍 Multi-Jurisdiction Country Selector

The app features dynamic country switching without requiring separate builds:
* 🌐 **Global Standards** (Vienna Convention on Road Signs and Signals)
* 🇵🇰 **Pakistan** (National Highways & Motorway Police — NHMP)
* 🇸🇦 **Saudi Arabia** (General Directorate of Traffic — Moroor)
* 🇦🇪 **United Arab Emirates** (Roads and Transport Authority — RTA Dubai)
* 🇺🇸 **United States** (Federal Highway Administration — MUTCD)
* 🇬🇧 **United Kingdom** (Department for Transport — Highway Code)
* 🇨🇦 **Canada** (Transportation Association of Canada — TAC)
* 🇦🇺 **Australia** (Austroads & AS 1742)

---

## 💾 Storage & Caching Engine

The application uses an offline-first hybrid storage architecture:
1. **Synchronous Memory Cache**: On app boot, `initStorage()` warms an in-memory key-value cache. All read operations (`getString`, `getNumber`, `getBoolean`) return immediately in `0ms` without async delays or UI flickering.
2. **Asynchronous Persistence**: All writes (`set`, `delete`) write immediately to memory and persist asynchronously to `@react-native-async-storage/async-storage`.

### Storage Keys Reference

| Key | Type | Description |
|---|---|---|
| `question_bank` | `string` (JSON) | Array of full question bank objects |
| `selected_country_code` | `string` | Active user country ISO code (e.g. `GLOBAL`, `PK`, `SA`, `US`) |
| `question_bank_version` | `string` / `number` | Version identifier of currently cached question bank |
| `bookmarked_question_ids` | `string` (JSON) | Array of bookmarked question ID strings |
| `total_attempts` | `number` | Cumulative number of quizzes completed |
| `total_score` | `number` | Cumulative score points earned across all quizzes |
| `total_questions_attempted` | `number` | Cumulative questions attempted |
| `auth_token` | `string` | User session JWT token (if authenticated) |

---

## 🌐 Background Delta Sync Workflow

- On app launch, `useSyncBank` contacts `GET /api/quiz/sync-bank?since=<lastSynced>&countryCode=<selectedCountry>`.
- Only modified questions, new additions, and deleted question IDs (tombstones) are downloaded.
- Local cache updates silently without disrupting ongoing student quiz sessions.

---

## 🎯 Practice Configurations

- **Category Practice**: Configurable randomized questions from the chosen category (**Traffic Signs**, **Road Rules**, **Traffic Signals**, **General Knowledge**) scoped to the selected jurisdiction.
- **Comprehensive Practice ("All Questions")**: Balanced pool of official questions covering all categories for the active jurisdiction.
- **Anti-Rote Randomization**: Shuffles options dynamically on every quiz run and recalculates `correctIndex`.
- **Authoritative Citations**: Displays verified Tier-1/Tier-2 government sources on question reviews.
- **Pass Threshold**: 80% score required to pass.

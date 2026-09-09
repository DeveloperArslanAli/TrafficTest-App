# TrafficTest 🛡️ — Global Traffic Knowledge Platform

A full-stack, offline-first global driver's licensing and road safety platform featuring an Android/iOS mobile application, cloud backend API with deduplication engine, and an enterprise administration dashboard.

---

## Architecture Overview

```text
┌────────────────────────────────┐         HTTPS / REST         ┌──────────────────────────────────────┐
│       Admin CMS Dashboard      │ ───────────────────────────▶ │            NestJS Backend            │
│    (React 18 + Vite + AntD)    │                              │        (Port 3000, JWT Auth)         │
│           Port 5173            │ ◀─────────────────────────── │  Prisma ORM + PostgreSQL + Redis     │
└────────────────────────────────┘                              └──────────────────────────────────────┘
                                                                            ▲         │
                                                       Offline Delta Sync   │         │ Cloudinary
                                                      (GET /api/quiz/sync)  │         ▼ (Sign Media CDN)
                                                                ┌──────────────────────────────────────┐
                                                                │          Mobile App (Expo)           │
                                                                │       TrafficTest v4.0.0 (AAB)       │
                                                                │  Offline-First Dynamic Question Bank │
                                                                └──────────────────────────────────────┘
```

---

## Monorepo Structure

```text
Drivers Road Practice/
├── admin/                  # Enterprise React 18 + Vite + Ant Design CMS (Port 5173)
│   ├── src/pages/          # Dashboard, Signs, Duplicates, Sources, Countries, Questions, Import
│   └── src/services/       # REST services for authoritative traffic content
├── backend/                # NestJS + Prisma + PostgreSQL + Redis Architecture (Port 3000)
│   ├── prisma/             # Multi-tenant schema (Canonical Signs, Variants, Sources, Quarantine)
│   └── src/                # Deduplication engine, Admin modules, Delta Sync, Auth
├── mobile/                 # React Native / Expo mobile app (com.traffictest)
│   ├── src/repositories/   # QuestionRepository, SyncRepository (Zero hardcoded counts)
│   ├── src/screens/        # Country Selector, Quiz with Authoritative Citations, Bookmarks, Profile
│   └── src/utils/          # Pre-seeded offline bank with vector graphics
├── web/                    # Public Website — Vite + Vanilla JS/CSS (Port 5174)
│   ├── src/pages/          # Landing, About, Services, Contact, Privacy, Data Deletion, Terms
│   ├── src/components/     # Navbar, Footer, ScrollReveal
│   └── src/styles/         # 4-theme design system (Ocean, Emerald, Amber, Slate)
├── shared/                 # Authoritative traffic datasets (162 Signs, 981 Variants, 7 Countries)
├── scripts/                # Verification suite (content, duplicates, sync, release build)
├── docker-compose.yml      # Local container orchestration (PostgreSQL & Redis)
├── KEYSTORE_CREDENTIALS.md # Keystore signing fingerprints and alias credentials
├── PLAYSTORE_RELEASE_CHECKLIST_v4.0.0.md # Play Store v4.0.0 release checklist
└── README.md
```

---

## Core Platform Highlights

| Component | Highlights |
|---|---|
| **Global Knowledge Model** | 162 Canonical Road Signs, 981 Jurisdiction Variants, and dynamic country-scoped question banks (Global / Vienna Convention, Pakistan, Saudi Arabia, UAE, United States, United Kingdom, Canada, Australia). |
| **Zero Active Legacy Questions** | 100% of legacy flat questions safely archived in `LegacyQuestion`. Zero legacy questions remain active in the published question bank. |
| **100% Authoritative Sources** | Every published question is linked to Tier-1 or Tier-2 official government sources (FHWA, UK DfT, NHMP, Saudi Moroor, UAE RTA Dubai, TAC Canada, Austroads). |
| **Deduplication Engine** | Lexical normalizer (stop-word pruning, token sorting) and semantic fingerprinting with Levenshtein scoring to eliminate redundant and rote questions. |
| **Offline-First Dynamic Mobile App** | Zero hardcoded counts (no 820/320/80 assumptions). Features dynamic category counts, interactive country selector, anti-rote option shuffle, and vector sign rendering. |
| **Silent Delta Synchronization** | Bandwidth-optimal delta sync (`/api/quiz/sync-bank`) querying timestamp-based updates and tombstones without interrupting active practice sessions. |
| **Enterprise Admin Portal** | Real-time analytics KPI dashboard, Canonical Sign & Variant Manager, Duplicate Candidate Reviewer, Source Catalog, Country Manager, and Bulk JSON Ingestion. |

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js**: 20.x or higher
- **PostgreSQL 15+** (Local or via Docker)
- **Redis 7+** (Local or via Docker; backend provides graceful fallback if Redis is offline)
- **JDK 17** (Android Studio JBR recommended for Android builds)

### 1. Start Infrastructure (PostgreSQL & Redis)
From the root workspace directory:
```bash
npm run docker:up
```
*Or use local PostgreSQL service on port `5432` with credentials configured in `backend/.env`.*

### 2. Backend Setup & Database Seeding
```bash
# In backend directory
cd backend
cp .env.example .env     # Update database credentials if necessary

# Apply schema migrations and seed authoritative global content
npm run prisma:migrate
npm run prisma:seed

# Start backend server (runs at http://localhost:3000)
npm run start:dev
```

### 3. Admin Dashboard
```bash
# In admin directory
cd admin
npm install
npm run dev              # Runs at http://localhost:5173
```

### 4. Mobile Application
```bash
# In mobile directory
cd mobile
npm install
npx expo start           # Run Expo development server or press 'a' for Android
```

---

## Default Credentials

### Admin Web Portal (`http://localhost:5173`)
| Field | Value |
|---|---|
| **Email** | `admin@roadwise.com` |
| **Password** | `Admin1234!` |
| **Role** | `ADMIN` |

---

## Root NPM Scripts & Verification Suite

| Command | Action |
|---|---|
| `npm run verify` | Runs complete verification suite (Content, Deduplication, Sync, API) |
| `npm run qa:validate` | Deep 27-point QA Verification & Validation suite (Seed purge, schema, citations, deduplication) |
| `npm run verify:content` | Asserts 0 active legacy questions, 100% Tier-1/2 source citations, canonical uniqueness |
| `npm run verify:duplicates` | Validates lexical & semantic fingerprinting, similarity scoring, uniqueness |
| `npm run verify:sync` | Tests full sync, timestamp delta queries, country-scoping, and content versioning |
| `npm run dev:backend` | Starts NestJS API in development watch mode |
| `npm run dev:admin` | Starts Vite admin dashboard dev server |
| `npm run dev:mobile` | Launches Expo development server for mobile |
| `npm run build:apk` | Compiles & signs release Universal APK via Gradle |
| `npm run build:aab` | Compiles & signs release Play Store App Bundle (AAB) |
| `npm run build:android` | Compiles & signs both APK and AAB release binaries |

---

## API Reference

### Public & Student Endpoints
- `GET /api/quiz/sync-bank` — Bandwidth-optimal delta synchronization supporting `since` timestamp and `countryCode`.
- `GET /api/quiz/version` — Fetch current content version counter.
- `GET /api/quiz/categories` — Live category list with dynamic question counts for the requested jurisdiction.
- `GET /api/quiz/signs` — Canonical traffic signs and jurisdiction-specific official variants.
- `POST /api/auth/register` — Register a student driver profile.
- `POST /api/auth/login` — Authenticate and obtain JWT bearer token.

### Admin Protected Endpoints (`Authorization: Bearer <JWT>`)
- `GET /api/admin/analytics/overview` — Live KPIs (total questions, canonical signs, variants, source coverage, pending duplicates).
- `GET /api/admin/questions` — Paginated questions with search, country, category, and status filters.
- `POST /api/admin/questions` — Create authoritative question with source linkage and automatic fingerprinting.
- `GET /api/admin/signs` — Manage 162 Canonical Signs and 981 Jurisdiction Variants.
- `GET /api/admin/duplicates` — Review duplicate candidates with similarity scores and resolution actions (`RESOLVED_DISTINCT`, `MERGED`, `DISMISSED`).
- `GET /api/admin/sources` — Catalog of Tier-1/Tier-2 traffic authorities and published manuals.
- `POST /api/admin/content/import` — Ingest authoritative question batches with automated deduplication checks.

---

## Android Production Release & Play Store

The mobile application is configured for production releases under package identifier `com.traffictest`.

### Keystore Configuration
- **Keystore File**: `mobile/android/app/traffictest-release-key.jks`
- **Key Alias**: `traffictest-key-alias`
- **Full Credential Documentation**: Refer to [`KEYSTORE_CREDENTIALS.md`](KEYSTORE_CREDENTIALS.md)

### Building Release Packages
```bash
# Automated release compilation from workspace root:
npm run build:android

# Or directly via Gradle in mobile/android:
cd mobile/android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat bundleRelease assembleRelease
```

### Generated Release Artifacts (v4.0.0)
| Binary Output | File Path | Size | Play Store Target |
| :--- | :--- | :--- | :--- |
| **Google Play App Bundle (.aab)** | [`TrafficTest-v4.0.0-playstore-release.aab`](TrafficTest-v4.0.0-playstore-release.aab) | 39.55 MB | Play Console Production / Internal Track |
| **Universal Release APK (.apk)** | [`TrafficTest-v4.0.0-universal-release.apk`](TrafficTest-v4.0.0-universal-release.apk) | 75.65 MB | Direct Sideloading & QA Testing |
| **ARM64 Architecture APK** | [`TrafficTest-v4.0.0-arm64-release.apk`](TrafficTest-v4.0.0-arm64-release.apk) | 34.00 MB | 64-bit Device Testing |
| **Release Checklist** | [`PLAYSTORE_RELEASE_CHECKLIST_v4.0.0.md`](PLAYSTORE_RELEASE_CHECKLIST_v4.0.0.md) | — | Verification & Upload Guide |


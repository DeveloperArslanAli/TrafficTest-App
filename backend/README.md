# TrafficTest — Backend API & Global Traffic Engine 🛡️

A production NestJS backend service powering the **Global Traffic Knowledge Platform** with multi-jurisdiction content modeling, canonical traffic signs and official country variants, a real-time deduplication engine, delta synchronization, and an enterprise Admin CMS.

---

## Architecture Overview

```text
┌───────────────────────────────┐
│   Admin Dashboard (Port 5173) │
└──────────────┬────────────────┘
               │  HTTPS / REST (JWT Auth)
               ▼
┌─────────────────────────────────────────────────────────────┐
│                 NestJS Backend (Port 3000)                  │
│                                                             │
│  ├── AuthModule (JWT, Argon2/Bcrypt)                        │
│  ├── QuizModule (Delta Sync, Dynamic Categories, Signs)     │
│  ├── AdminModule (Questions, Signs, Duplicates, Sources)    │
│  ├── DeduplicationService (Lexical, Semantic, Levenshtein)  │
│  └── RedisService (Resilient Caching + PostgreSQL Fallback) │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│      PostgreSQL 15 Database   │ │    Redis In-Memory Cache  │
│  (162 Signs, 981 Variants,    │ │ (Version counter, bank    │
│   276 Published Questions,    │ │  caching, delta queries)  │
│   320 Archived Legacy)        │ └───────────────────────────┘
└───────────────────────────────┘
```

---

## Core Capabilities

### 1. Canonical Sign & Variant Architecture
* **Canonical Traffic Signs**: 162 unique sign definitions identified by immutable canonical codes (e.g. `REG-STOP`, `WARN-SHARP-BEND`, `SIG-RED-LIGHT`), shape, and driver action.
* **Jurisdiction Variants**: 981 localized sign variants linked to specific countries (PK, SA, AE, US, GB, CA, AU) with local official codes and artwork paths.

### 2. Zero Active Legacy Content Quarantine
* All 320 legacy flat questions are preserved inside `LegacyQuestion` (`isLegacy: true, isPublished: false`).
* Guaranteed: `activeLegacyQuestions = 0`. Historical user exam attempts and bookmarks remain fully intact.

### 3. 100% Tier-1/Tier-2 Authoritative Sources
* Every active published question is linked to verified official government sources (FHWA, UK DfT, NHMP, Saudi Moroor, UAE RTA Dubai, TAC Canada, Austroads).

### 4. Deduplication Engine (`DeduplicationService`)
* **Lexical Normalization**: Case folding, punctuation removal, stop-word filtering (`what`, `does`, `this`, `sign`, `mean`, `it`, etc.), and alphabetical token sorting.
* **Semantic Fingerprinting**: SHA-256 hash combining category, canonical sign code, question type, and normalized text stem.
* **Similarity Scorer**: Levenshtein distance and token Jaccard similarity to catch near-duplicate questions across countries.

### 5. Delta Synchronization Engine (`/api/quiz/sync-bank`)
* Bandwidth-optimal synchronization: mobile clients send their last sync timestamp (`since`) and receive only modified/new questions and deleted IDs (tombstones).

---

## API Endpoints Reference

### Public & Mobile Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quiz/sync-bank` | Bandwidth-optimal delta sync supporting `since` and `countryCode` |
| `GET` | `/api/quiz/version` | Current published content version counter |
| `GET` | `/api/quiz/categories` | Categories with dynamic question counts per country |
| `GET` | `/api/quiz/signs` | Canonical traffic signs and localized country variants |
| `POST` | `/api/auth/register` | Student driver registration |
| `POST` | `/api/auth/login` | Student / Admin authentication returning JWT |

### Admin Endpoints (`Authorization: Bearer <JWT>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/analytics/overview` | Live KPIs (Total published, canonical signs, variants, source coverage) |
| `GET` | `/api/admin/questions` | Paginated questions with country, category, search, and status filters |
| `POST` | `/api/admin/questions` | Create question with automatic fingerprinting and source linkage |
| `GET` | `/api/admin/signs` | Canonical sign registry and country variant management |
| `GET` | `/api/admin/duplicates` | Duplicate candidate triage (`RESOLVED_DISTINCT`, `MERGED`, `DISMISSED`) |
| `GET` | `/api/admin/sources` | Catalog of Tier-1/Tier-2 traffic authorities and published manuals |
| `GET` | `/api/admin/countries` | Active country jurisdictions, driving sides, and active questions |
| `POST` | `/api/admin/content/import` | Batch JSON ingestion with automated duplicate detection |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (port `5432`)
- Redis 7+ (port `6379`, optional — system safely falls back to PostgreSQL if Redis is offline)

### Environment Setup (`.env`)
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roadwise?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
ADMIN_EMAIL="admin@roadwise.com"
ADMIN_PASSWORD="Admin1234!"
```

### Setup Commands
```bash
# Install dependencies
npm install

# Push schema to database
npx prisma db push

# Seed authoritative global content and quarantine legacy records
npx ts-node prisma/seed.ts

# Start development server
npm run start:dev

# Build for production
npm run build
```

---

## Verification Commands
```bash
# Verify content architecture, legacy quarantine, and source coverage
npx ts-node -r dotenv/config ../scripts/verify-content.ts

# Verify deduplication engine
npx ts-node -r dotenv/config ../scripts/verify-duplicates.ts

# Verify delta sync querying
npx ts-node -r dotenv/config ../scripts/verify-sync.ts
```

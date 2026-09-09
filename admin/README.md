# TrafficTest — Admin CMS Portal 🛡️

The enterprise administration dashboard for the **Global Traffic Knowledge Platform**, built with **React 18**, **Vite**, and **Ant Design 5**.

---

## Features & Modules

```text
admin/src/
├── pages/
│   ├── Dashboard.tsx            # Live KPI statistics, category distribution, duplicate counters
│   ├── Signs/
│   │   └── SignList.tsx         # 162 Canonical Signs with nested 981 Jurisdiction Variants
│   ├── Duplicates/
│   │   └── DuplicateReview.tsx  # Side-by-side duplicate candidate comparison & triage
│   ├── Sources/
│   │   └── SourceList.tsx       # Tier-1/Tier-2 official authorities and published documents
│   ├── Countries/
│   │   └── CountryList.tsx      # Multi-country registry, driving side, and question counters
│   ├── Content/
│   │   └── ContentImport.tsx    # Bulk JSON batch ingestion with deduplication checks
│   ├── Questions/
│   │   └── QuestionList.tsx     # Authoritative question management and filtering
│   └── Login.tsx                # Admin authentication with JWT session persistence
├── components/
│   └── AdminLayout.tsx          # Responsive navigation sidebar, breadcrumbs, user dropdown
└── services/                    # Axios REST client with bearer token interception
```

---

## Core Workflows

### 1. KPI Analytics Dashboard (`/`)
- Displays real-time counts for published questions, canonical traffic signs, jurisdiction variants, and Tier-1 source coverage.
- Monitors pending duplicate candidates requiring review.

### 2. Canonical Signs & Variants (`/signs`)
- Searchable directory of canonical signs by code, shape, and category.
- Expandable rows detailing all localized country variants (e.g. `REG-STOP` in Pakistan, Saudi Arabia, USA, UK, etc.).

### 3. Duplicate Review Center (`/duplicates`)
- Automated detection flags questions with lexical or semantic similarity (> 85%).
- Side-by-side comparison displaying character/word diffs.
- Triage actions: **Resolve Distinct**, **Merge Questions**, or **Dismiss**.

### 4. Authoritative Sources Catalog (`/sources`)
- Management of Tier-1 official government agencies (FHWA, UK DfT, NHMP, Saudi Moroor, UAE RTA Dubai, TAC Canada, Austroads).
- Document and section citation tracking.

### 5. Bulk Content Ingestion (`/content/import`)
- Upload structured JSON batches of questions and sign definitions.
- Automatic deduplication and verification against existing canonical codes.

---

## Getting Started

### Prerequisites
- Node.js 20+
- Running NestJS backend at `http://localhost:3000`

### Setup & Development
```bash
# In admin directory
cd admin

# Install dependencies
npm install

# Start development server (runs at http://localhost:5173)
npm run dev

# Build for production deployment
npm run build
```

### Default Admin Credentials
* **URL**: `http://localhost:5173`
* **Email**: `admin@roadwise.com`
* **Password**: `Admin1234!`
* **Role**: `ADMIN`

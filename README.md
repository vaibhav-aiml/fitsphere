# FitSphere - AI-Powered Fitness & Nutrition SaaS Platform

FitSphere is a production-inspired, full-stack AI fitness platform built with a **Next.js 14 + TypeScript** frontend and an **Express 5 + MongoDB (Mongoose)** backend. It features AI-powered coaching, personalized Jeff Nippard Powerbuilding workout plans, an AI Nutrition Hub, exercise video demonstrations, social feeds, and gamified achievements.

---

## 🚀 Recent Architecture & Feature Updates

### 🧠 1. Scalable AI Workout Planner (`/api/v1/ai-planner`)
- **NDJSON Progress-Streamed Generation** (`POST /generate-stream`): Real-time progress events streamed to the frontend for transparent UX during plan generation.
- **Groq AI Engine with Exponential Backoff & Jitter**: Integrated `llama-3.3-70b-versatile` with randomized jitter backoff (`1s`, `2s`, `4s`) for transient 429/500/503 error resilience.
- **Jeff Nippard Powerbuilding System**: Prompts enforce **5 to 6 distinct exercises for every workout day** (Primary Compound, Secondary Compound, Upper/Lower assistance, and Isolations for Delts, Arms, Calves, Core).
- **Professional PDF Export (`📄 Export PDF`)**: Client-side and server-supported PDF document exporter powered by `jsPDF`.
- **Data Integrity & Versioning**: Optimistic concurrency control via `expectedVersion` versioning conflict checks (returns HTTP 409 Conflict on stale updates) and single-active-plan ownership rules.
- **DTO Layer Decoupling**: Strict transformer layer (`toPlanDTO`, `toPlanSummaryDTO`) preventing internal MongoDB `_id` / `__v` leaks.

### 🥗 2. AI Nutrition & Macronutrient Hub (`/nutrition`)
- **⚡ AI Diet Plan Generator** (`POST /api/nutrition/ai-diet-plan`): Calculates TDEE, BMR, daily calorie/macro targets, and generates a personalized 4-meal daily menu with cooking steps.
- **🤖 AI Natural Language Meal Scanner** (`POST /api/nutrition/ai-analyze-meal`): Accepts plain-text meal descriptions (e.g. *"200g grilled chicken with 1 cup brown rice and olive oil"*), extracts ingredients, and logs calculated macros directly.
- **❓ AI Nutritionist & Diet Coach** (`POST /api/nutrition/ai-ask-coach`): Interactive AI modal providing evidence-based sports nutrition and supplement timing advice.
- **📊 Bento Macro & Hydration Grid**: Real-time progress bars for Calories, Protein, Carbs, Fats, and Water (+250ml / +500ml quick log buttons).
- **🛒 Smart Grocery List & 💊 Supplement Tracker**: Categorized shopping list check-off and supplement reminder schedule.

### 🏋️ 3. Exercise Library (`/exercises`)
- **45 Video Demonstrations**: Audited and fixed YouTube embed URLs across Chest, Back, Legs, Shoulders, Arms, and Core.
- **Direct YouTube Fallback**: Includes a direct **`Watch on YouTube ↗`** link under every video player for browser shielding compatibility.

### 🛡️ 4. Enterprise Reliability & Observability
- **Startup Environment Validation**: Fail-fast `validateEnvOnStartup()` service verifying mandatory `PORT`, `GROQ_API_KEY`, and `JWT_SECRET` environment variables.
- **Graceful Process Signal Handling**: Signal handlers (`SIGTERM`, `SIGINT`, `unhandledRejection`, `uncaughtException`) stop ingress via `server.close()`, drain active NDJSON SSE streams, and gracefully close Mongoose DB pools.
- **Operational Metrics**: Endpoint at `/api/v1/ai-planner/admin/metrics` supporting both JSON and Prometheus format telemetry.

---

## 🏗️ Architecture Overview

FitSphere is structured as a decoupled monorepo:

```
fitsphere/
├── backend/                  # Node.js + Express 5 API Service
│   ├── src/
│   │   ├── config/           # Database, AI, Safety Rules & Env Validation
│   │   ├── controllers/      # Business logic (Workout Planner, AI Coach, Nutrition)
│   │   ├── dto/              # Client-safe DTO Transformers
│   │   ├── middleware/       # Auth, Rate Limiter, Error Handler, Validation
│   │   ├── models/           # Mongoose schemas & indexes
│   │   ├── prompts/          # Groq AI System Prompts
│   │   ├── routes/           # Express domain routers (/api/v1/ai-planner, /api/nutrition)
│   │   ├── services/         # AI Provider, Progression Engine, Pipeline Services
│   │   └── server.js         # Express bootstrap & signal handlers
│   ├── __tests__/            # Jest + Supertest test suites
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 # Next.js 14 App Router + TailwindCSS
│   ├── src/
│   │   ├── app/              # Next.js page components (/plans, /nutrition, /exercises, /ai-coach)
│   │   ├── components/       # UI & Layout components
│   │   ├── hooks/            # Custom Hooks (useRequireAuth)
│   │   └── lib/              # Shared Axios client (api.ts) & utilities
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # Multi-container orchestration (Backend, Frontend, MongoDB)
└── .github/workflows/ci.yml # GitHub Actions CI pipeline
```

---

## ⚙️ Prerequisites

- **Node.js**: v20.x or higher
- **MongoDB**: v7.0.x (Local instance or MongoDB Atlas)
- **Groq API Key**: Optional for live AI generation (`GROQ_API_KEY`)
- **Docker & Docker Compose**: (Optional, for containerized execution)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API Server Port | `5000` |
| `MONGODB_URI` | MongoDB Connection String *(Mandatory)* | `mongodb://localhost:27017/fitsphere` |
| `JWT_SECRET` | Secret Key for Signing JWTs *(Mandatory)* | `your-secret-key-change-this` |
| `GROQ_API_KEY` | Groq API Key for AI Features | `gsk_...` |
| `GROQ_MODEL` | Primary LLM Model | `llama-3.3-70b-versatile` |
| `CORS_ORIGIN` | Allowed Client Origins | `http://localhost:3000` |
| `NODE_ENV` | Environment Mode | `development` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | API Endpoint URL | `http://localhost:5000/api` |
| `NEXTAUTH_URL` | NextAuth Canonical URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth Sessions | `your-nextauth-secret` |

---

## 🏁 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, and GROQ_API_KEY
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🐳 Running with Docker Compose

```bash
docker-compose up --build
```

---

## 🧪 Testing & CI

```bash
cd backend
npm test
```

---

## 📄 License

ISC License

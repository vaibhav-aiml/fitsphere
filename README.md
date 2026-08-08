<div align="center">

# 🏋️‍♂️ FitSphere

### AI-Powered Fitness & Nutrition SaaS Platform

*Personalized coaching. Smart nutrition. Real workouts. Live step & sport tracking. Built to scale.*

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](#-license)

🚀 **Live Frontend:** [fitsphere-phi.vercel.app](https://fitsphere-phi.vercel.app)
⚡ **Live Backend API:** [fitsphere-api-hdaf.onrender.com](https://fitsphere-api-hdaf.onrender.com)

[Repository](https://github.com/vaibhav-aiml/fitsphere) · [Live App](https://fitsphere-phi.vercel.app) · [About & Pricing](https://fitsphere-phi.vercel.app/about) · [Quick Start](#-quick-start-local-development) · [Docker Setup](#-running-with-docker-compose) · [Environment Variables](#-environment-variables)

</div>

---

FitSphere is a production-inspired, full-stack AI fitness platform built with a **Next.js 14 + TypeScript** frontend and an **Express 5 + MongoDB (Mongoose)** backend. It features AI-powered coaching, real-time step and multi-sport activity tracking, personalized Jeff Nippard Powerbuilding workout plans, an AI Nutrition Hub, exercise video demonstrations, social feeds, gamified achievements, and Google OAuth authentication.

## 🌐 Live Deployments

| Component | Platform | URL |
|---|---|---|
| 🌐 **Frontend Web App** | Vercel | [https://fitsphere-phi.vercel.app](https://fitsphere-phi.vercel.app) |
| ⚙️ **Backend API** | Render | [https://fitsphere-api-hdaf.onrender.com](https://fitsphere-api-hdaf.onrender.com) |

---

## 📚 Table of Contents

- [Live Deployments](#-live-deployments)
- [Recent Architecture & Feature Updates](#-recent-architecture--feature-updates)
- [Architecture Overview](#️-architecture-overview)
- [Route Map](#-route-map)
- [Prerequisites](#️-prerequisites)
- [Environment Variables](#-environment-variables)
- [Quick Start](#-quick-start-local-development)
- [Running with Docker Compose](#-running-with-docker-compose)
- [Testing & CI](#-testing--ci)
- [License](#-license)

---

## 🚀 Recent Architecture & Feature Updates

### 🏃‍♂️ Real-Time Step Tracker & Live Multi-Sport Engine
`/workout/live` & `/api/active-sessions`

| Capability | Detail |
|---|---|
| **Multi-Sport Profiles** | Live session tracking across 9 activity profiles (Running, Outdoor Walking, Cycling, Trekking, Indoor Treadmill, Badminton, Basketball, Gym/HIIT, Jump Rope) |
| **Dynamic MET Calorie Matrix** | Piecewise-linear MET scaling driven by GPS speed (Running, Outdoor Walking, Cycling), cadence (Treadmill, Jump Rope, Badminton, Basketball), or motion/rep bursts (Gym/HIIT) |
| **HTML5 Sensors & GPS Filtering** | `DeviceMotionEvent` peak-detection step counter + `Geolocation.watchPosition` observer with a 20m accuracy filter, 3m noise-floor filter, and activity-specific max-speed gates (30 km/h running/walking/trekking, 65 km/h cycling) |
| **Web Platform & iOS Shielding** | Universal Web Audio API milestone chimes (`AudioContext`, with `webkitAudioContext` fallback), Screen Wake Lock (`navigator.wakeLock`) re-acquired on refocus, and Page Visibility (`visibilitychange`) auto-pause requiring explicit user resume |
| **Crash Recovery & Autosave** | 15-second `localStorage` session snapshots with a "Resume Session / Discard" banner on reload |
| **Telemetry & Privacy** | 10-second telemetry snapshot buffering, post-workout step/distance manual correction (`isManuallyEdited`), and social-feed sharing that excludes raw GPS coordinates |

### 🎨 Rebranded About & Pricing Experience
`/about`

| Capability | Detail |
|---|---|
| **Custom Brand Mark** | Hand-built inline SVG `LogoMark` (a barbell bent into a partial ring) replacing the previous emoji badge across the sidebar, mobile nav, auth modal, loading states, and favicon |
| **Creator & Tech Stack Section** | Creator card with GitHub link, plus a badge grid of the live tech stack (Next.js 14, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, Groq AI) |
| **INR Pricing Tiers** | Starter ₹0, Pro ₹499/mo ("Most Popular"), Elite ₹999/mo, each with their real feature lists |
| **Design System Consistency** | Built entirely on the existing `obsidian` / `charcoal` / `blaze` (orange) neumorphic theme — no new color tokens introduced |

### 📱 Full Mobile Responsiveness
| Capability | Detail |
|---|---|
| **Off-Canvas Sidebar Drawer** | The dashboard's fixed sidebar now converts to a slide-in drawer with backdrop below the `md:` breakpoint, leaving desktop behavior untouched |
| **Fixed Collapse/Expand & Close Bugs** | Resolved the desktop sidebar toggle losing its expand control and the mobile drawer's close button not dismissing the overlay |

### 🧠 Scalable AI Workout Planner
`/api/v1/ai-planner`

| Capability | Detail |
|---|---|
| **NDJSON Progress Streaming** | `POST /generate-stream` — real-time progress events streamed to the frontend for transparent UX during plan generation |
| **Groq AI Engine** | `llama-3.3-70b-versatile` with exponential backoff & jitter (`1s`, `2s`, `4s`) for transient 429/500/503 error resilience |
| **Jeff Nippard Powerbuilding System** | Prompts enforce 5–6 distinct exercises per workout day (Primary Compound, Secondary Compound, Upper/Lower assistance, Isolations for Delts, Arms, Calves, Core) |
| **📄 Professional PDF Export** | Client-side and server-supported PDF exporter powered by `jsPDF` |
| **Data Integrity & Versioning** | Optimistic concurrency control via `expectedVersion` — returns HTTP 409 Conflict on stale updates; single-active-plan ownership rules |
| **DTO Layer Decoupling** | Strict transformer layer (`toPlanDTO`, `toPlanSummaryDTO`) preventing internal MongoDB `_id` / `__v` leaks |

### 🥗 AI Nutrition & Macronutrient Hub
`/nutrition`

| Capability | Detail |
|---|---|
| **⚡ AI Diet Plan Generator** | `POST /api/nutrition/ai-diet-plan` — calculates TDEE, BMR, daily calorie/macro targets, and generates a personalized 4-meal daily menu with cooking steps |
| **🤖 AI Meal Scanner** | `POST /api/nutrition/ai-analyze-meal` — accepts plain-text meal descriptions (e.g. *"200g grilled chicken with 1 cup brown rice and olive oil"*), extracts ingredients, and logs calculated macros directly |
| **❓ AI Nutritionist & Diet Coach** | `POST /api/nutrition/ai-ask-coach` — interactive AI modal providing evidence-based sports nutrition and supplement timing advice |
| **📊 Bento Macro & Hydration Grid** | Real-time progress bars for Calories, Protein, Carbs, Fats, and Water (+250ml / +500ml quick log buttons) |
| **🛒 Smart Grocery List & 💊 Supplement Tracker** | Categorized shopping list check-off and supplement reminder schedule |

### 🏋️ Exercise Library & Workout Logger
`/exercises` & `/workout`

- **45 Video Demonstrations** — audited and fixed YouTube embed URLs across Chest, Back, Legs, Shoulders, Arms, and Core
- **Direct YouTube Fallback** — a **`Watch on YouTube ↗`** link under every video player for browser shielding compatibility
- **Live Tracker Integration** — quick-launch banners and progress stats linking strength logs with live tracking sessions

### 🔐 Authentication
- **Google OAuth** via NextAuth on the frontend and `google-auth-library` token verification on the backend, alongside existing email/password JWT auth

### 🛡️ Enterprise Reliability & Observability

- **Startup Environment Validation** — fail-fast `validateEnvOnStartup()` service verifying mandatory `PORT`, `GROQ_API_KEY`, and `JWT_SECRET` environment variables
- **Graceful Process Signal Handling** — signal handlers (`SIGTERM`, `SIGINT`, `unhandledRejection`, `uncaughtException`) stop ingress via `server.close()`, drain active NDJSON SSE streams, and gracefully close Mongoose DB pools
- **Operational Metrics** — `/api/v1/ai-planner/admin/metrics` supporting both JSON and Prometheus format telemetry

---

## 🏗️ Architecture Overview

FitSphere is structured as a decoupled monorepo:

```
fitsphere/
├── backend/                  # Node.js + Express 5 API Service
│   ├── src/
│   │   ├── config/           # Database, AI (Groq), Env Validation
│   │   ├── controllers/      # Business logic (Active Session, Workout Planner, AI Coach, Nutrition)
│   │   ├── dto/               # Client-safe DTO Transformers
│   │   ├── middleware/       # Auth, Rate Limiter, Error Handler, Validation
│   │   ├── models/           # Mongoose schemas (ActiveWorkoutSession, WorkoutLog, User, etc.)
│   │   ├── services/         # AI Provider (Groq), Google Auth, Progression Engine
│   │   ├── routes/           # Express domain routers (/api/active-sessions, /api/v1/ai-planner, /api/nutrition)
│   │   └── server.js         # Express bootstrap & signal handlers
│   ├── __tests__/            # Jest + Supertest suites (activeSession, workout, auth)
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 # Next.js 14 App Router + TailwindCSS
│   ├── src/
│   │   ├── app/               # Page routes — see Route Map below
│   │   │   └── api/auth/[...nextauth]/  # NextAuth Google OAuth handler
│   │   ├── components/
│   │   │   ├── dashboard/    # SidebarNav (responsive drawer)
│   │   │   ├── landing/      # LandingHero, LandingNavbar
│   │   │   └── LogoMark.tsx  # Custom SVG brand mark
│   │   ├── hooks/             # useStepTracker, useRequireAuth
│   │   └── lib/                # Axios client (api.ts), metCalculations.ts
│   ├── public/                # manifest.json (PWA), static assets
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # Multi-container orchestration (Backend, Frontend, MongoDB)
└── .github/workflows/ci.yml  # GitHub Actions CI pipeline (backend lint & test)
```

---

## 🗺️ Route Map

| Route | Description |
|---|---|
| `/` | Authenticated dashboard — training portals, quick-launch cards |
| `/about` | Public marketing page — features, creator/tech stack, INR pricing |
| `/workout` | Strength workout logger |
| `/workout/live` | Real-time step & multi-sport activity tracker |
| `/workout-plan/[id]` | Individual AI-generated workout plan view |
| `/plans` | AI workout plan generator & management |
| `/exercises` | 45-video exercise library |
| `/nutrition` | AI nutrition hub — diet plans, meal scanner, coach |
| `/progress` | Strength + live session analytics and history |
| `/analytics` | Charted performance analytics (Recharts) |
| `/achievements` | Gamified milestones |
| `/ai-coach` | AI coaching chat interface |
| `/social` | Social workout feed |
| `/music` | Workout music integration |
| `/calendar` | Training calendar |
| `/export` | PDF export tools |
| `/auth/login`, `/auth/signup` | Email/password + Google OAuth entry points |

---

## ⚙️ Prerequisites

| Requirement | Version / Note |
|---|---|
| **Node.js** | v20.x or higher |
| **MongoDB** | v7.0.x (local instance or MongoDB Atlas) |
| **Groq API Key** | Optional — required only for live AI generation (`GROQ_API_KEY`) |
| **Google OAuth Credentials** | Optional — required only for "Sign in with Google" |
| **Docker & Docker Compose** | Optional — for containerized execution |

---

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PORT` | API Server Port | Optional (default `5000`) |
| `MONGODB_URI` | MongoDB Connection String | **Mandatory** |
| `JWT_SECRET` | Secret Key for Signing JWTs | **Mandatory** |
| `GROQ_API_KEY` | Groq API Key for AI Features (planner, nutrition, coach) | Optional — AI endpoints fail without it |
| `GROQ_MODEL` | Primary LLM Model | Optional (defaults to `llama-3.3-70b-versatile`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID, for verifying Google sign-in tokens | Optional — needed for Google login |
| `CORS_ORIGIN` | Allowed Client Origins | Optional (default `http://localhost:3000`) |
| `NODE_ENV` | Environment Mode | Optional (default `development`) |

> Note: the checked-in `backend/.env.example` currently lists `GOOGLE_CLIENT_ID` but not `GROQ_API_KEY`/`GROQ_MODEL`, even though both are read by `src/config/ai.js` and validated by `validateEnvOnStartup()`. Worth adding them to the example file to avoid new contributors missing them.

### Frontend — `frontend/.env.local`

| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | API Endpoint URL | **Mandatory** |
| `NEXTAUTH_URL` | NextAuth Canonical URL | **Mandatory** |
| `NEXTAUTH_SECRET` | Secret for NextAuth Sessions | **Mandatory** |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional — needed for Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional — needed for Google login |

`JWT_SECRET` and `NEXTAUTH_SECRET` are values you generate yourself (e.g. `openssl rand -base64 32`) — not third-party keys. `GROQ_API_KEY` and the `GOOGLE_CLIENT_*` pairs are the only credentials that require creating an external account, and both are optional unless you need those specific features.

---

## 🏁 Quick Start (Local Development)

### 1️⃣ Backend Setup

```bash
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT_SECRET, and (optionally) GROQ_API_KEY / GOOGLE_CLIENT_ID
npm install
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

| Service | URL |
|---|---|
| 🎨 Frontend UI | `http://localhost:3000` |
| ⚙️ Backend API | `http://localhost:5000` |

---

## 🐳 Running with Docker Compose

```bash
docker-compose up --build
```

> Spins up the Backend, Frontend, and MongoDB in a single multi-container orchestration.

---

## 🧪 Testing & CI

```bash
cd backend
npm test
```

Test suites (`auth.test.js`, `workout.test.js`, `activeSession.test.js`) run on **Jest + Supertest**, wired into the **GitHub Actions CI pipeline** (`.github/workflows/ci.yml`) on pushes and PRs to `main`, `master`, and `develop`.

---

## 📄 License

<div align="center">

**ISC License**

Made with 💪 and ☕ — [vaibhav-aiml/fitsphere](https://github.com/vaibhav-aiml/fitsphere)

</div>

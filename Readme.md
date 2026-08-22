# GlobeTrotter 🌍✈️

> **Modern, intelligent, and collaborative travel planning platform designed to dream, design, and organize multi-destination expeditions.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-4169E1.svg?logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-78%2F78%20Passing-brightgreen.svg)]()

---

## 🌟 Key Features

### 🗺️ **Interactive Itinerary & Stop Builder**
- **Multi-Destination Route Management**: Add and sequence city stops with arrival/departure dates.
- **Day-by-Day Activity Scheduling**: Assign activities to specific days with custom time slots, duration, and categories.
- **Visual Timelines**: Real-time breakdown of daily schedules with time badges and cost indicators.

### 🌍 **Curated Destination & Activity Catalog**
- **50+ Global Cities & 200+ Activities**: Discover curated destinations across Europe, Asia, Americas, Africa, and Oceania.
- **Smart Filtering & Sorting**: Filter by continent/region, search keywords, or sort by popularity rankings and cost.
- **Instant Activity Booking**: One-click addition of curated sights, dining spots, and excursions into your active trip.

### 💰 **Real-Time Budget & Expense Tracking**
- **Live Category Breakdown**: Automatic calculation across Lodging, Activities, Transport, and Dining.
- **Budget Alerts**: Visual spend-versus-budget progress bars and daily cost averages.

### 📅 **Interactive Expedition Calendar**
- **Monthly & Weekly Overview**: Visualize active and upcoming journeys across a calendar grid.
- **Date Jump Navigation**: Click any calendar day to inspect scheduled activities and destinations.

### 🤝 **Community Hub & 1-Click Itinerary Cloning**
- **Expedition Stories**: Share completed trips with photos, custom captions, and total costs to the community feed.
- **Social Engagement**: Like, comment, and engage with other travelers.
- **1-Click Clone**: Instantly clone any shared community itinerary directly into your personal trip planner.

### 🔗 **Public Trip Sharing & Export**
- **Shareable Web Links**: Generate unique public access links for friends, family, and co-travelers.
- **Read-Only Modal View**: Interactive preview of destinations, stops, and schedules without requiring sign-in.

### 🛡️ **Role-Based Admin & Moderation**
- **Admin Dashboard**: System-wide statistics for trips, users, and community engagements.
- **User Role Management**: Promote/demote user privileges (`admin` vs `user`).
- **Content Moderation**: Remove inappropriate community posts and moderate shared content.

### 🎨 **Editorial Design & Fluid UX**
- **Bespoke Editorial Aesthetics**: Clean ivory/monochrome styling with micro-animations powered by Framer Motion.
- **Cloudinary Media Uploads**: Fast avatar and trip cover photo uploading.
- **Toast Notifications & Auto-Refresh Auth**: Seamless JWT silent refreshes and contextual feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy 2.0 (Async), Asyncpg, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL (Neon Serverless) / SQLite with aiosqlite fallback |
| **Auth & Security** | JWT (Python-Jose), Bcrypt password hashing, SlowAPI rate limiting, Role-based guards |
| **Storage & Deploy** | Cloudinary (Images), Render (`render.yaml` Blueprints), Vercel |

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend

# Create virtual environment and install dependencies
uv venv && uv sync   # Or: python -m venv .venv && pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Start FastAPI server
uv run uvicorn app.main:app --reload --port 8000
```

> API documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend/globe-trotter

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```

> Open `http://localhost:3000` in your browser.

---

## 🧪 Testing

The backend includes a comprehensive test suite covering authentication, RBAC, IDOR security, concurrency reordering, database constraints, and catalog services:

```bash
cd backend
uv run pytest
# Output: 78 passed in ~38s (100% pass rate)
```

---

## 🌐 Deployment

### Render Blueprint (Automated)
Connect this repository to **[Render](https://dashboard.render.com)** as a **Blueprint**. The included [`render.yaml`](./render.yaml) automatically provisions both the FastAPI backend and Next.js frontend with all environment mappings.

### Standalone Frontend (Vercel or Render)
- **Root Directory**: `frontend/globe-trotter`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start -- -p $PORT`
- **Environment Variable**: `NEXT_PUBLIC_API_URL=https://<your-backend-url>`
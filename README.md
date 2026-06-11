# Product Management System

A full-stack product management application built as a technical assessment.

## Overview

| Layer    | Technology                    | Status          |
|----------|-------------------------------|-----------------|
| Mobile   | Flutter                       | Pending setup   |
| Web      | React + Vite                  | Pending setup   |
| Backend  | Node.js + Express             | Pending impl.   |
| Database | PostgreSQL 17                 | Schema ready    |
| Infra    | Docker Compose (local)        | Ready           |
| Deploy   | Railway + Vercel (production) | Pending         |

## Features

- Authentication — Register, Login, Logout (JWT)
- Product CRUD — Create, Read, Update, Delete products
- Product Search — Full-text search with trigram indexes
- User Profile — View and update profile, upload avatar
- Categories — Organize products by category *(enhancement)*
- Search History — Persist and recall recent searches *(enhancement)*

## Quick Start (Local)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Flutter SDK *(for mobile)*
- pnpm / npm

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env      # fill in values
npm install
npm run dev
```

### 3. Start the web app *(after initialization)*

```bash
cd apps/web
npm install
npm run dev
```

### 4. Start the mobile app *(after initialization)*

```bash
cd apps/mobile
flutter pub get
flutter run
```

## Project Structure

```
product-management-assessment/
├── apps/
│   ├── mobile/          Flutter application (to be initialized)
│   └── web/             React + Vite application (to be initialized)
├── backend/             Node.js + Express REST API
├── database/            SQL schema, seed data, ERD
├── docs/                Architecture, API, deployment, decisions
├── docker/              Docker service config overrides
├── screenshots/         App screenshots for documentation
└── docker-compose.yml   Local development orchestration
```

## Documentation

| Doc | Description |
|-----|-------------|
| [Architecture](docs/architecture.md) | System design overview |
| [API Reference](docs/api.md) | REST endpoint documentation |
| [Deployment](docs/deployment.md) | Railway + Vercel deployment guide |
| [Decisions](docs/decisions.md) | Architecture decision records |
| [Database](database/README.md) | Schema, ERD, migration guide |

## Production Deployment

- **API** → [Railway](https://railway.app) — auto-deploy from `main`
- **Database** → Railway PostgreSQL plugin
- **Web** → [Vercel](https://vercel.com) — auto-deploy from `main`
- **Mobile** → Built locally / distributed via APK or TestFlight

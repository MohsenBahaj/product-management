# Deployment Guide

## Environments

| Environment | API | Database | Web |
|---|---|---|---|
| Local | localhost:3000 | Docker postgres:17 | localhost:5173 |
| Production | Railway | Railway PostgreSQL | Vercel |

---

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 20+
- Flutter SDK (for mobile)

### Steps

```bash
# 1. Clone and enter
git clone <repo-url>
cd product-management-assessment

# 2. Start database
docker compose up postgres -d

# 3. Configure backend
cd backend
cp .env.example .env
# Edit .env — DB_* vars default to Docker values, only JWT_SECRET needs changing

# 4. Install dependencies & start API
npm install
npm run dev
# → http://localhost:3000

# 5. Start web app (after apps/web is initialized)
cd ../apps/web
npm install
npm run dev
# → http://localhost:5173

# 6. Start mobile app (after apps/mobile is initialized)
cd ../apps/mobile
flutter pub get
flutter run
```

---

## Production — Railway (API + Database)

### First Deploy

1. Push code to GitHub.
2. Create a new Railway project.
3. Add **PostgreSQL** plugin — Railway auto-injects `DATABASE_URL`.
4. Add a **Node.js** service pointed at the repo root with **root directory** set to `backend/`.
5. Set environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<long-random-secret>
   JWT_REFRESH_SECRET=<another-long-secret>
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   DATABASE_URL=<auto-injected-by-railway>
   ```
6. Railway builds and deploys on every push to `main`.

### Run Migrations

Railway does not auto-run `schema.sql`. Options:
- **Option A:** Add a `postinstall` or `migrate` npm script that runs `schema.sql` via `psql`.
- **Option B:** Run once manually via Railway's built-in terminal:
  ```bash
  psql $DATABASE_URL -f database/schema.sql
  ```

---

## Production — Vercel (Web App)

1. Import the GitHub repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Build command: `npm run build`; Output directory: `dist`.
4. Set environment variable: `VITE_API_URL=https://your-railway-api.up.railway.app/api`
5. Vercel deploys on every push to `main`.

---

## Mobile Distribution

- **Android:** Build APK with `flutter build apk --release` and distribute manually or via Firebase App Distribution.
- **iOS:** Requires Apple Developer account; build with Xcode.

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | auto | Railway injects this |
| `DATABASE_URL` | ✅ | Auto-injected by Railway PostgreSQL plugin |
| `JWT_SECRET` | ✅ | Min 64-char random string |
| `JWT_EXPIRES_IN` | | Default: `7d` |
| `JWT_REFRESH_SECRET` | ✅ | Different from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | | Default: `30d` |
| `CORS_ORIGINS` | ✅ | Vercel URL (comma-separated) |
| `UPLOAD_MAX_SIZE_MB` | | Default: `5` |

### Web (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Full Railway API base URL |

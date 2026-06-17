# NestMate — AI Apartment Finder & Roommate Matcher

A full-stack web app that helps people find apartments, compare listings, match
with compatible roommates, and use AI to decide whether a place fits their
lifestyle and budget.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · Auth.js
· OpenAI · Docker · GitHub Actions**.

---

## Features

| Area | What it does |
| --- | --- |
| **Authentication** | Email/password auth with Auth.js (credentials + JWT sessions), hashed with bcrypt. Role-based access (USER / ADMIN). |
| **Listing dashboard** | Browse, search, and filter apartments by city, beds, max rent, and pet policy, with sorting. |
| **Add / save / compare** | Create listings, save favorites, and compare up to four side by side on price, $/sqft, space, and amenities. |
| **Roommate profiles** | Each user has a roommate profile (budget, cleanliness, sleep schedule, social level, smoking, pets, interests, bio). |
| **Compatibility score** | Weighted 0–100 match score with a per-factor breakdown and shared-interest detection. |
| **AI lease analyzer** | Summarizes a lease in plain English and flags tenant-unfriendly clauses. |
| **AI neighborhood pros/cons** | Honest pros and cons for any neighborhood. |
| **AI lifestyle fit** | Scores how well a specific apartment fits your budget and preferences. |
| **Budget fit calculator** | Applies the 30%-of-income rule with roommate cost-splitting and a fit score. |
| **Commute notes** | Free-text commute notes on every listing. |
| **Favorites & shortlist** | Save listings and flag your top picks. |
| **Messaging** | In-app conversations with a simulated auto-reply for demos. |
| **Charts** | Rent-vs-budget bar charts and admin analytics (Recharts). |
| **Dark / light mode** | System-aware theme toggle (next-themes). |
| **Responsive UI** | Sidebar on desktop, bottom nav on mobile. |
| **Admin dashboard** | Platform totals, rent distribution, listings-by-city, recent activity. |

> **AI without a key:** all AI features call the OpenAI API when `OPENAI_API_KEY`
> is set, and otherwise fall back to a built-in deterministic generator — so the
> app is fully functional out of the box.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Set up the database (SQLite by default) and seed demo data
npx prisma db push
npm run db:seed

# 3. Run
npm run dev
# open http://localhost:3000
```

### Test accounts

| Role | Email | Password |
| --- | --- | --- |
| User | `demo@nestmate.app` | `password123` |
| Admin | `admin@nestmate.app` | `admin123` |

Other seeded roommate accounts (`jordan@`, `sam@`, `casey@`, `riley@`,
`taylor@` `@nestmate.app`) all use `password123`.

---

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a Postgres URL. |
| `AUTH_SECRET` | yes | Session signing secret. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | prod | Public base URL of the app. |
| `OPENAI_API_KEY` | no | Enables live OpenAI calls; falls back to local AI when empty. |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini`. |

---

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Generate the Prisma client and build for production. |
| `npm start` | Start the production server. |
| `npm run lint` | ESLint. |
| `npm test` | Run unit tests (Vitest). |
| `npm run db:push` | Sync the Prisma schema to the database. |
| `npm run db:seed` | Seed demo data. |
| `npm run db:reset` | Reset and reseed the database. |

---

## Project structure

```
src/
  app/
    (auth)/login, register        Auth pages
    (dashboard)/                  Authenticated app (sidebar + mobile nav)
      dashboard, apartments,
      compare, roommates,
      favorites, messages,
      profile, admin
    api/                          Route handlers (REST-ish JSON API)
  components/
    ui/                           Shadcn-style primitives
    ai/                           AI feature panels
    charts/                       Recharts wrappers
  lib/
    auth.ts                       Auth.js config
    prisma.ts                     Prisma singleton
    ai.ts                         OpenAI wrapper + local fallback
    budget.ts                     Budget fit calculator
    compatibility.ts              Roommate scoring
prisma/
  schema.prisma                   Data model
  seed.ts                         Seed script
tests/                            Vitest unit tests
```

Detailed docs:
- [API reference](docs/API.md)
- [Database schema](docs/DATABASE.md)

---

## Docker

```bash
# Build and run on SQLite with a persistent volume
docker compose up --build
# open http://localhost:3000
```

Set `OPENAI_API_KEY` and `AUTH_SECRET` in your shell or a `.env` file before
running to enable live AI and secure sessions.

---

## Switching to PostgreSQL

The app ships on SQLite for zero-config local runs. To use Postgres:

1. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your Postgres connection string, e.g.
   `postgresql://nestmate:nestmate@localhost:5432/apartment_finder?schema=public`.
   Start the bundled Postgres with `docker compose --profile postgres up db`.
3. Run `npx prisma db push && npm run db:seed`.

The schema avoids database-specific features, so no other changes are needed.

---

## Deployment

- **Render** — `render.yaml` deploys the Docker image with a persistent disk for
  SQLite. Push to GitHub, create a Blueprint on Render, and set `NEXTAUTH_URL`
  (and optionally `OPENAI_API_KEY`).
- **Vercel** — set the Prisma provider to `postgresql`, attach a managed Postgres
  (Neon/Vercel Postgres), set the env vars, and deploy.
- **Any Docker host** — `docker compose up --build`.

---

## CI/CD

`.github/workflows/ci.yml` runs on every push and PR:

1. Install dependencies
2. Generate the Prisma client and sync the schema
3. Seed the database
4. Lint
5. Unit tests
6. Production build
7. Docker image build (cached)

---

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 · Auth.js v5 ·
OpenAI SDK · Recharts · Zod · Vitest · Docker · GitHub Actions.

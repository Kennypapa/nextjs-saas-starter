# Next.js SaaS Starter

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-000000?style=for-the-badge&logo=auth0&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A production-oriented Next.js SaaS template — the frontend counterpart to [nestjs-rbac-starter](https://github.com/Kennypapa/nestjs-rbac-starter).

This is not a “dashboard UI kit.” It shows how I structure a real multi-tenant SaaS product: auth, RBAC, billing, teams, SEO, and DevOps wired together with clear engineering decisions.

---

## What a recruiter will see

In one scroll of this README (and the repo), you should be able to answer:

| Question | Answer in this project |
|----------|------------------------|
| Can they ship a full-stack SaaS UI? | Yes — App Router, Server Components, API routes, Postgres, Prisma |
| Do they understand auth & access control? | Login, register, email verification, password reset, RBAC, middleware, permission-based UI |
| Can they take payments? | Stripe Checkout, subscription plans, Customer Portal, upgrade/downgrade |
| Do they think beyond “it works on my machine”? | Docker, GitHub Actions CI/CD, Vercel, env validation |
| Do they care about product quality? | SEO (Metadata API, sitemap, robots, OG), dark mode, skeletons, toasts, error boundaries, responsive UI |

**Keywords this repo is meant to surface:** Next.js · React · TypeScript · Authentication · Authorization · Middleware · Stripe · PostgreSQL · Prisma · REST APIs · SEO · CI/CD · Docker · Vercel · Responsive Design · SaaS Architecture · Production Patterns

---

## Why this project exists

Most Next.js starters stop at a pretty landing page + a fake dashboard.

This one is built around the decisions SaaS products actually need:

- Auth that covers the full account lifecycle (not just login)
- Authorization that is secure by default (middleware + RBAC + permission UI)
- Billing that can go to production (Stripe Checkout + Portal)
- Multi-user orgs (invite members, roles, org settings)
- Shipability (Docker, CI, Vercel, SEO, DX polish)

Pair it with the NestJS RBAC backend when you want to show API + UI end-to-end.

---

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15 (App Router) |
| UI | React + TypeScript + Tailwind CSS |
| Auth | Auth.js / NextAuth (credentials + email flows) |
| Authorization | RBAC + middleware + permission-gated UI |
| Database | PostgreSQL |
| ORM | Prisma |
| Forms / validation | React Hook Form + Zod |
| Client data | React Query (TanStack Query) |
| Billing | Stripe (Checkout, Subscriptions, Portal) |
| Containers | Docker + Compose |
| CI/CD | GitHub Actions → Vercel |
| SEO | Metadata API, `robots.ts`, `sitemap.ts`, Open Graph, JSON-LD |

---

## Features

**Authentication**
- Login / register
- Forgot password / reset password
- Email verification
- Session handling via Auth.js

**Authorization**
- Roles + permissions (RBAC)
- Protected routes
- Next.js middleware for auth gates
- Permission-based UI (hide / disable actions the user can’t perform)

**Dashboard**
- Analytics cards
- Data tables
- Charts
- User profile + settings

**Billing**
- Stripe Checkout
- Subscription plans
- Customer Billing Portal
- Upgrade / downgrade flows

**Team / organization**
- Invite members
- Roles & permissions per org
- Organization settings

**Developer experience**
- Dark mode
- Loading skeletons
- Error boundaries
- Toast notifications
- Fully responsive layouts

**SEO**
- Metadata API
- `robots.ts` / `sitemap.ts`
- Open Graph tags
- Structured data (JSON-LD)
- Canonical URLs

**DevOps**
- Dockerized app + Postgres
- GitHub Actions CI (lint → typecheck → test → build)
- Vercel deployment
- Documented environment variables

---

## Architecture

```
Browser
  │
  ▼
Next.js Middleware (session + route protection)
  │
  ▼
App Router
  ├── Server Components (default — data close to the DB)
  ├── Client Components (forms, charts, interactive UI)
  └── Route Handlers / API routes
        │
        ├── Auth.js
        ├── Prisma → PostgreSQL
        └── Stripe (Checkout / webhooks / Portal)
```

**Auth flow:** credentials or email link → Auth.js session → middleware protects private routes → server components read the session → permission helpers gate UI and mutations.

**Billing flow:** user picks a plan → Stripe Checkout Session → webhook syncs subscription state to Postgres → Billing Portal for self-serve upgrades/cancels.

```
app/
├── (marketing)        # public landing, pricing, SEO pages
├── (auth)             # login, register, forgot/reset, verify
├── (dashboard)        # app shell: analytics, settings, billing, team
├── api/
│   ├── auth           # Auth.js handlers
│   ├── stripe         # checkout + portal + webhooks
│   └── ...            # REST-style route handlers
├── robots.ts
└── sitemap.ts

components/            # UI primitives + feature components
lib/                   # prisma, auth, stripe, permissions, validations
hooks/                 # React Query hooks
prisma/                # schema + migrations + seed
```

---

## Quick start

**Prerequisites:** Node.js 20+, Docker, Stripe account (test mode)

```bash
git clone https://github.com/Kennypapa/nextjs-saas-starter.git
cd nextjs-saas-starter
npm install
cp .env.example .env
npm run db:up
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

| | |
|--|--|
| App | http://localhost:3000 |
| Demo admin | `admin@example.com` / `Admin123!` |

> Postgres is mapped to host port **5434** by default so it won’t collide with local Postgres (`5432`) or the NestJS RBAC starter (`5433`).

**One-command stack:**

```bash
docker compose up --build
```

---

## Engineering decisions

**Why App Router?**  
Layouts, nested routing, streaming, and first-class Server Components are the modern Next.js default. For a SaaS product with marketing pages + an authenticated app shell, App Router keeps public and private surfaces cleanly separated with route groups.

**Why Server Components?**  
Fetch data on the server by default: fewer client bundles, no waterfalls for initial loads, and secrets stay off the client. Client Components are reserved for forms, charts, and anything that truly needs interactivity.

**Why Middleware?**  
Auth checks belong at the edge of the request — before a protected page renders. Middleware keeps “must be logged in / must belong to an org” consistent across the dashboard without repeating guards in every page.

**Why Prisma?**  
Type-safe queries, reviewable migrations, and a schema that documents the domain (users, orgs, roles, subscriptions). Same reason it backs the NestJS RBAC starter — one mental model across API and UI repos.

**Why Stripe?**  
Industry standard for SaaS billing. Checkout + Customer Portal cover the hard parts (PCI, invoices, payment methods) so the app focuses on syncing subscription state and enforcing plan limits.

**Why React Query?**  
Server Components handle first paint; React Query owns client-side cache, refetch, and mutation UX for interactive dashboard data (tables, team invites, billing status) without reinventing loading/error state.

**Why Docker?**  
Identical Postgres + app runtime for local, CI, and demos. Recruiters and collaborators can `docker compose up` without fighting machine-specific setup.

**Why CI/CD?**  
Every push should prove the app still lints, typechecks, tests, and builds. GitHub Actions catches regressions; Vercel ships previews and production. That’s how production teams actually ship.

---

## Security notes

- Passwords hashed server-side; sessions managed by Auth.js
- Protected routes enforced in middleware (not only in the UI)
- Permissions checked on the server for mutations — UI hiding is UX, not security
- Stripe webhooks verified with signing secrets
- Env vars documented via `.env.example`; secrets never committed
- Zod validation on forms and API inputs

---

## CI / CD pipeline

Every push / PR to `main`:

```
Install → Prisma generate → Lint → Typecheck → Test → Build
```

Deploy path:

```
GitHub → GitHub Actions (quality gates) → Vercel (preview / production)
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## Screenshots

Add these after you capture them (makes the repo feel real in under 10 seconds of scrolling):

1. Marketing landing / pricing
2. Login + register flows
3. Dashboard with analytics cards + chart
4. Billing / plan selection (Stripe test mode)
5. Team invite + role management
6. Dark mode toggle

---

## Pair with the backend

| Repo | Role |
|------|------|
| [nestjs-rbac-starter](https://github.com/Kennypapa/nestjs-rbac-starter) | Auth, JWT, RBAC API, Swagger, guards |
| **nextjs-saas-starter** (this repo) | SaaS UI, Auth.js, Stripe, teams, SEO, Vercel |

Together they show full-stack SaaS thinking: secure API + product-facing frontend.

---

## What’s next

Intentional follow-ons, not missing homework:

- Audit logging for admin actions
- Usage-based metering on top of Stripe
- Broader E2E suite (Playwright)
- Multi-region / edge caching notes
- Organization-level feature flags

---

## License

MIT

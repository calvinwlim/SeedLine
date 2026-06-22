# OpenMat

Tournament and competition management for grappling and combat sports — registration,
seeding, bracket generation, and matside scoring designed to keep working when the venue
Wi-Fi does not.

> `openmat` is a working codename. To rename, search-and-replace the `@openmat/*` package
> scope and the `openmat` references (image names, database name in `docker-compose.yml` and
> the `.env` files) across the repo.

## What's in here

This is a TypeScript monorepo (npm workspaces + Turborepo). The headline decision is that
**everything is TypeScript end-to-end**, so the bracket logic is a single shared package that
runs identically on the server (authoritative) and, later, on the offline scoring tablet
(optimistic), then reconciles.

```
openmat/
├── apps/
│   ├── api/                 NestJS + Drizzle + PostgreSQL backend
│   └── web/                 Next.js (App Router) web app
├── packages/
│   ├── bracket-engine/      Pure, tested bracket generation & result propagation
│   ├── shared-types/        Domain enums + DTO contracts shared by api and web
│   ├── config-typescript/   Shared tsconfig bases
│   └── config-eslint/       Shared ESLint config
├── docker-compose.yml       Postgres + Redis for local development
└── .github/workflows/ci.yml Lint, typecheck, test, build
```

## The bracket engine

`packages/bracket-engine` is the core of the product and the most complete part of this
foundation. It is pure (no I/O, no dependencies) and covered by tests.

- **Single elimination** — standard seeding (top seeds on opposite ends), automatic byes for
  non-power-of-two fields, winner propagation, and best-effort academy/teammate separation in
  round one.
- **Round robin** — every entrant faces every other once, including the common 3-competitor
  division, via the circle method, plus basic standings.
- **Double elimination** — intentionally a documented stub (`src/double-elimination.ts`). A
  wrong implementation is worse than an honest gap; the design notes are in the file.

```ts
import { generateBracket, applyResult } from '@openmat/bracket-engine';

let bracket = generateBracket('single_elimination', [
  { id: 'a', seed: 1 },
  { id: 'b', seed: 2 },
  { id: 'c', seed: 3 },
  { id: 'd', seed: 4 },
]);

bracket = applyResult(bracket, 'W-R1-M1', 'a'); // immutable: returns a new bracket
```

Run the engine's tests:

```bash
npm test --workspace @openmat/bracket-engine
```

## Prerequisites

- Node.js 20+ (`.nvmrc` pins 20)
- npm 10+ (ships with Node 20)
- Docker (for local Postgres and Redis)

## Quick start

```bash
# 1. Install
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Configure env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Build shared packages once (so the apps can resolve them)
npm run build

# 5. Push the schema to the database
npm run db:push

# 6. Run everything in watch mode
npm run dev
```

- API: http://localhost:4000/api (health at `/api/health`)
- Web: http://localhost:3000

`npm run dev` runs the apps and the shared packages' watch builds together via Turborepo.

## Scripts

Run from the repo root; Turborepo fans them out across the workspace.

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Run all apps and package watchers            |
| `npm run build`        | Build every package and app                  |
| `npm run lint`         | Lint the whole workspace                     |
| `npm run typecheck`    | Type-check the whole workspace               |
| `npm test`             | Run tests (the bracket engine has the suite) |
| `npm run format`       | Format with Prettier                         |
| `npm run db:generate`  | Generate a Drizzle migration from the schema |
| `npm run db:migrate`   | Apply migrations                             |
| `npm run db:push`      | Push the schema directly (good for dev)      |

## Database

The schema lives in `apps/api/src/database/schema` (split into `identity`, `events`,
`competition`, and `enums`). It models users, organizers, academies, athletes, events,
divisions, registrations, brackets, matches, mats, payments, and an append-only audit log.

The generated bracket structure is stored as JSON on `brackets.data` (typed as the engine's
`Bracket`), while the individually schedulable and scorable rows live in the `matches` table,
linked back to the engine via `engine_match_id`.

For schema changes, prefer generating migrations:

```bash
npm run db:generate   # writes SQL + metadata to apps/api/drizzle/
npm run db:migrate    # applies them
```

## What is real vs. scaffold

This is a foundation, and it is honest about its edges:

- **Real and tested:** the bracket engine (single elimination, round robin), the database
  schema, the shared config, and the build/lint/test/CI pipeline.
- **Wired but minimal:** the API (`/api/health` pings the database; `/api/events` reads from
  the events table) and the web app (a landing page plus an events page that fetches the API
  through TanStack Query).
- **Deliberately not done yet:** double elimination, authentication, payments (Stripe Connect),
  the offline scoring/sync layer, and real-time spectator updates. The structure leaves clear
  seams for each.

## Deployment notes

Both apps ship with a multi-stage `Dockerfile` (build from the repo root, e.g.
`docker build -f apps/api/Dockerfile -t openmat-api .`). The web app uses Next's `standalone`
output for a small runtime image.

A reasonable starting target is a container PaaS (Fly.io or Render) with managed Postgres
(Neon) and Redis, Cloudflare in front, and the usual transactional email / error tracking /
uptime services. None of that is encoded here — these are just the containers and the schema.

## License

Proprietary — see [LICENSE](./LICENSE). All rights reserved.

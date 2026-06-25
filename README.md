# SeedLine

Tournament and competition management for grappling and combat sports — registration,
seeding, bracket generation, and matside scoring designed to keep working when the venue
Wi-Fi does not.

> `seedline` is a working codename. To rename, search-and-replace the `@seedline/*` package
> scope and the `seedline` references (image names, database name in `docker-compose.yml` and
> the `.env` files) across the repo.

## What's in here

This is a TypeScript monorepo (npm workspaces + Turborepo). The headline decision is that
**everything is TypeScript end-to-end**, so the bracket logic is a single shared package that
runs identically on the server (authoritative) and, later, on the offline scoring tablet
(optimistic), then reconciles.

```
seedline/
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
- **Double elimination** — linked winners and losers brackets with a grand final and
  conditional bracket reset. Non-power-of-two fields are handled by static bye folding, so an
  odd entrant count still produces exactly the real matches it should (2N−2, plus the reset).
  The losers-bracket drop pattern is reversed each drop round to avoid immediate rematches.

```ts
import { generateBracket, applyResult } from '@seedline/bracket-engine';

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
npm test --workspace @seedline/bracket-engine
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

### Frontend on its own (no API, no database)

The web app ships with a built-in mock data layer, so you can develop and test the
entire frontend without running the API, Postgres, or Docker:

```bash
npm install
npm run build --workspace @seedline/types   # build the shared types once
npm run dev:web                             # web + its watchers only, on :3000
```

The data source is controlled by `NEXT_PUBLIC_DATA_SOURCE` (see `apps/web/.env.example`):

- `mock` (default) — runs entirely on fixtures in `apps/web/src/lib/mock`. Every page
  (events, event detail, academies, athlete profiles, account) renders real-looking data.
- `live` — calls the NestJS API for the endpoints it serves today (the public events list)
  and falls back to mock data for everything the backend hasn't implemented yet, so the UI
  keeps working as the API catches up.

Both modes implement the same `ApiClient` interface (`apps/web/src/lib/api-types.ts`), so
moving an endpoint from mock to live is a drop-in change rather than a rewrite.

The frontend covers, end to end on mock data:

- **Public directory** — events, academies, and athletes with search, filters, and interactive
  maps (Leaflet + OpenStreetMap, no API key required).
- **Event pages** — detail, divisions, venue map, a multi-step **registration flow** that writes
  back to your account, and per-division **bracket viewer** rendered with the real
  `@seedline/bracket-engine` (single elimination, double elimination, and round robin, with
  podium results).
- **Live schedule & results** — a per-mat running order with live/on-deck/done states, live
  scores, and a completion bar (`/events/[slug]/schedule`).
- **Matside scoring** — a mat-control staff view (`/events/[slug]/control`) and a full scoring
  console (`/events/[slug]/score/[matchId]`) with IBJJF points/advantages/penalties, a match
  clock, and submission/points finishes. Results are held in a stateful in-memory store and
  flow straight back to the live board.
- **Accounts & roles** — a client session (`/sign-in`) with switchable demo personas
  (athlete / organizer / staff); role-gated areas redirect or show a not-authorized notice.
- **Account area** — dashboard, registrations, profile, settings, reflecting the signed-in user.
- **Organizer side** — a dashboard, event creation, status lifecycle control, division
  management, and a registrations roster (`/organizer`), gated to organizers.

## Scripts

Run from the repo root; Turborepo fans them out across the workspace.

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Run all apps and package watchers            |
| `npm run dev:web`      | Run only the web app (mock data, no API)     |
| `npm run dev:api`      | Run only the API and its watchers            |
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

- **Real and tested:** the bracket engine (single elimination, double elimination, round
  robin), the database schema, the shared config, and the build/lint/test/CI pipeline.
- **Wired, served by the live API:** the public directory read surface — events (list +
  detail), divisions, academies, and athletes — backed by Drizzle queries over Postgres, with
  a seed script (`apps/api/src/database/seed.ts`). Flip the web app to it with
  `NEXT_PUBLIC_DATA_SOURCE=live`. See [docs/backend-setup.md](./docs/backend-setup.md).
- **Still served by mock data:** the live schedule, matside scoring, registration writes, and
  the account/organizer areas keep using the mock layer (the latter pending auth), so the whole
  app renders with no backend while those endpoints are built.
- **Deliberately not done yet:** authentication, payments (Stripe Connect), the offline
  scoring/sync layer, and real-time spectator updates. The structure leaves clear seams for each.

## Deployment notes

Both apps ship with a multi-stage `Dockerfile` (build from the repo root, e.g.
`docker build -f apps/api/Dockerfile -t seedline-api .`). The web app uses Next's `standalone`
output for a small runtime image.

A reasonable starting target is a container PaaS (Fly.io or Render) with managed Postgres
(Neon) and Redis, Cloudflare in front, and the usual transactional email / error tracking /
uptime services. None of that is encoded here — these are just the containers and the schema.

## License

Proprietary — see [LICENSE](./LICENSE). All rights reserved.

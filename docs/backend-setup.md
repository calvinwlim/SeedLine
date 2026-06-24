# Backend setup (Phase 4) — wiring the live API

This is the checklist for turning the framework into a running backend. The code
is in place; what's left is provisioning the external services and running the
migrate/seed steps. Until then the web app runs entirely on its mock data layer
(`NEXT_PUBLIC_DATA_SOURCE=mock`, the default), so nothing here blocks frontend work.

## What's wired in code (no infra needed to read)

- **Schema** (`apps/api/src/database/schema`) now carries the presentational
  fields the UI needs: organizer slug/logo, academy location/coach/links/coords,
  athlete belt/discipline/weight/bio + a denormalized record, event cover/schedule
  note, and a `medals` table for podium history.
- **Read API** (`apps/api/src/modules`):
  - `GET /api/events` (filters: `search`, `discipline`, `status`, `country`)
  - `GET /api/events/:slug` — full detail (divisions, organizer, aggregates)
  - `GET /api/events/:slug/divisions/:divisionId` — division + entrants
  - `GET /api/academies` · `GET /api/academies/:slug`
  - `GET /api/athletes` · `GET /api/athletes/:slug`
  - **Live ops:** `GET /api/events/:slug/schedule`, `GET /api/events/:slug/mat-controls`,
    `GET /api/events/:slug/matches/:matchId`, and the scoring mutations
    (`POST …/matches/:matchId/{score,start,reset,finish}`). Brackets and match rows are
    generated lazily on first schedule request; finishing a match advances the result through
    the engine and propagates winner (and loser, for double elim) to downstream matches.
- **Seed** (`apps/api/src/database/seed.ts`) — a representative dataset whose
  slugs mirror the mock fixtures, so `live` mode looks continuous with `mock`.
- **Web live client** (`apps/web/src/lib/api.ts`) — calls the above when
  `NEXT_PUBLIC_DATA_SOURCE=live`, and falls back to mock for everything not yet
  served (account, organizer, registration writes).

## External dependencies to provision

| Dependency      | Local dev                              | Production target (suggested)        | Used for                                  |
| --------------- | -------------------------------------- | ------------------------------------ | ----------------------------------------- |
| PostgreSQL 16   | `docker compose up -d postgres`        | Neon / RDS / Fly Postgres            | All persistent data                       |
| Redis 7         | `docker compose up -d redis`           | Upstash / managed Redis              | Cache & queues (later: live sync)         |
| Stripe (Connect)| test keys in `apps/api/.env`           | Stripe account + Connect             | Payments (Phase 6 — not wired yet)         |
| Web/API hosting | n/a                                    | Fly.io / Render + Vercel             | Deploy (Phase 8)                           |

Docker is the only hard local requirement. If you can't run Docker, point
`DATABASE_URL` at any reachable Postgres 16 (e.g. a free Neon instance).

## Bring the live backend up

```bash
# 1. Start Postgres (and Redis)
docker compose up -d

# 2. Configure env
cp apps/api/.env.example apps/api/.env     # DATABASE_URL matches docker-compose
cp apps/web/.env.example apps/web/.env

# 3. Build shared packages so the API/web can resolve them
npm run build

# 4. Create the tables, then seed representative data
npm run db:push                            # or db:generate + db:migrate
npm run db:seed --workspace @openmat/api

# 5. Run the API + web together
npm run dev
```

Then flip the web app to the live backend by setting in `apps/web/.env`:

```bash
NEXT_PUBLIC_DATA_SOURCE=live
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Restart `npm run dev:web`. The directory, event, division, academy, and athlete
pages now read from Postgres; the rest keep using mock until those endpoints land.

## Still on mock (the next backend slices)

These remain mock-served and are the next things to build into the API:

1. **Schedule & matside scoring** — generate brackets/matches on bracket creation,
   persist live scores, expose `GET /events/:slug/schedule`, mat controls, and the
   score-mutation endpoints. (The `brackets`/`matches`/`mats` tables already exist.)
2. **Registration writes** — `POST /registrations` (create athlete + entry), with
   capacity/duplicate checks. (Currently the registration flow writes to mock state.)
3. **Account & organizer** — these depend on **auth** (Phase 5); today they use a
   client-side demo session. Real auth gates `getAccount`, organizer event CRUD,
   and roster management.
4. **Derive records from results** — replace the denormalized athlete record /
   `medals` seed with values computed from completed `matches`.

## Notes

- The athlete `record` columns and `medals` rows are denormalized for now so
  profiles render before the scoring pipeline exists; item 4 above retires them.
- Enums in `schema/enums.ts` mirror `@openmat/types`; keep them in sync.

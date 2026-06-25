# Contributing

## Setup

See the Quick start in [README.md](./README.md). In short: `npm install`,
`docker compose up -d`, copy the `.env.example` files, `npm run build`, `npm run db:push`, `npm run dev`.

## Before opening a pull request

Everything CI runs, you can run locally from the root:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Conventions

- TypeScript everywhere; keep the strict compiler settings.
- The bracket engine stays pure — no I/O, no framework imports, and every behavior change
  comes with a test.
- Domain enums live in `@seedline/types` and are mirrored by the database enums in
  `apps/api/src/database/schema/enums.ts`. Change both together.
- Prefer generating Drizzle migrations (`npm run db:generate`) over editing the database by hand.
- Formatting is handled by Prettier (`npm run format`); don't hand-format.

## Branches & commits

- Branch off `main`.
- Keep commits focused. Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) are
  encouraged but not enforced.

# Contributing

## Setup

See the Quick start in [README.md](./README.md). In short: `pnpm install`,
`docker compose up -d`, copy the `.env.example` files, `pnpm build`, `pnpm db:push`, `pnpm dev`.

## Before opening a pull request

Everything CI runs, you can run locally from the root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Conventions

- TypeScript everywhere; keep the strict compiler settings.
- The bracket engine stays pure — no I/O, no framework imports, and every behavior change
  comes with a test.
- Domain enums live in `@openmat/types` and are mirrored by the database enums in
  `apps/api/src/database/schema/enums.ts`. Change both together.
- Prefer generating Drizzle migrations (`pnpm db:generate`) over editing the database by hand.
- Formatting is handled by Prettier (`pnpm format`); don't hand-format.

## Branches & commits

- Branch off `main`.
- Keep commits focused. Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) are
  encouraged but not enforced.

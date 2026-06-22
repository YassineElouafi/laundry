# Laundry

On-demand laundry service for the Moroccan market — pnpm monorepo.

## Layout

```
apps/
├─ api/          NestJS + TypeORM + PostgreSQL backend (REST, JWT auth)
└─ dashboard/    React 19 + Vite + shadcn/ui admin dashboard (FR/AR, RTL)
packages/
└─ shared/       Domain types shared by both: order-status enum + transition
                 graph, payment/price/slot enums, DTO interfaces, helpers
```

## Prerequisites

- Node ≥ 20, **pnpm** (via corepack: `corepack enable`)
- Docker (PostgreSQL, maildev)

## Setup

```bash
pnpm install                 # installs all workspaces
pnpm build:shared            # build @laundry/shared once (apps consume it)

# Backend (apps/api): start DB + migrate + seed, then run
cd apps/api
docker compose up -d postgres
pnpm migration:run
pnpm seed:run:relational
cd ../..

# Run both apps
pnpm dev:api                 # http://localhost:3001  (Swagger at /docs)
pnpm dev:dashboard           # http://localhost:5173
```

Admin login: `admin@example.com` / `secret`.

## Workspace scripts (root)

- `pnpm build` — build shared, then api, then dashboard
- `pnpm build:shared` — build only the shared package
- `pnpm dev:api` / `pnpm dev:dashboard` — run an app in watch mode
- `pnpm lint` — lint both apps

## Shared types

`@laundry/shared` is the single source of truth for the domain model. The API
re-exports its enums (e.g. `src/orders/order-status.enum.ts` just re-exports
`OrderStatusEnum` + `ORDER_TRANSITIONS` from the package), and the dashboard
re-exports everything via `src/lib/api/types.ts`. The dashboard resolves the
package to its TS **source** (Vite alias) for HMR; the API consumes the
compiled `dist`, so run `pnpm build:shared` after changing shared code.

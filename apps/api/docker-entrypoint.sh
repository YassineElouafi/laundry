#!/bin/sh
set -e

# Run from apps/api so the TypeORM data-source globs (src/database/migrations/**)
# and tsconfig paths resolve correctly.
cd "$(dirname "$0")"

# ts-node in transpile-only mode: migrations run against TypeScript source without
# blocking on type-checking. We invoke the TypeORM CLI directly (not the package's
# `migration:run` script) to bypass env-cmd, which hard-requires a .env file —
# in production all config comes from the real environment (Dokploy-injected).
export TS_NODE_TRANSPILE_ONLY=true

echo "▶ Running TypeORM migrations…"
node -r ts-node/register -r tsconfig-paths/register \
  ./node_modules/typeorm/cli.js \
  --dataSource=src/database/data-source.ts migration:run

# Optional one-off seed (roles, admin user, sample catalog). Idempotent, but off by
# default — set RUN_SEED=true on first boot only.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "▶ Seeding database…"
  node -r ts-node/register -r tsconfig-paths/register \
    ./src/database/seeds/relational/run-seed.ts
fi

echo "▶ Starting Laundry API on :${APP_PORT:-3001}…"
exec node dist/main.js

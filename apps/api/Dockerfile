# Laundry API — NestJS + TypeORM in a pnpm monorepo.
# IMPORTANT: build context must be the REPO ROOT (Dokploy "Docker Context Path" = "." / empty),
# because pnpm needs pnpm-lock.yaml + pnpm-workspace.yaml + every workspace package.json,
# and @laundry/api depends on the @laundry/shared workspace package.
FROM node:22-bookworm-slim

# ca-certificates: outbound TLS (DB SSL, SMTP). bcryptjs is pure-JS, so no build toolchain needed.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Pin pnpm to match the repo's "packageManager" field. We avoid corepack on purpose
# (its newer default pnpm may not match the lockfile).
RUN npm install -g pnpm@10.16.1
WORKDIR /repo

# Copy the whole monorepo. .dockerignore keeps out node_modules, dist, .env, etc.
COPY . .

# Install ONLY the api dependency subtree (trailing "..." pulls in @laundry/shared).
# Dev deps are kept on purpose: ts-node + the TypeORM CLI (migrations) and @nestjs/cli
# (build) live there.
RUN pnpm install --frozen-lockfile --filter @laundry/api...

# Build the shared package first (the API imports its compiled dist), then compile NestJS.
RUN pnpm --filter @laundry/shared build
RUN pnpm --filter @laundry/api build

RUN chmod +x apps/api/docker-entrypoint.sh

WORKDIR /repo/apps/api
ENV NODE_ENV=production \
    APP_PORT=3001
EXPOSE 3001
ENTRYPOINT ["sh", "/repo/apps/api/docker-entrypoint.sh"]

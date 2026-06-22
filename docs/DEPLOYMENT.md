# Laundry — Deployment

CI/CD: GitHub Actions builds Docker images, pushes them to **GHCR**, then calls the
**Dokploy** API to redeploy. Dokploy (Traefik + Docker Swarm on a VPS) pulls the new
images and serves them behind automatic Let's Encrypt TLS.

```
git push origin main
      │
      ▼
GitHub Actions — .github/workflows/deploy.yml
      ├─ build-push (ubuntu-latest)
      │    ├─ docker buildx build apps/api/Dockerfile        (context = repo root)
      │    │     → ghcr.io/<owner>/laundry-api:latest + :<sha>
      │    └─ docker buildx build apps/dashboard/Dockerfile  (context = repo root)
      │          build-arg VITE_API_URL from repo Variables
      │          → ghcr.io/<owner>/laundry-dashboard:latest + :<sha>
      └─ deploy (needs build-push)
           └─ POST /api/application.deploy × 2 → Dokploy redeploys both apps
```

Layer caching uses GitHub Actions cache (`type=gha`) scoped per service.

---

## Architecture

```
Internet ── HTTPS 443 ──▶ Traefik (Dokploy-managed, on VPS)
                              ├── dashboard container  :80   (nginx SPA)
                              └── api container        :3001 (NestJS)
                                            │
                                      Postgres :5432  (Dokploy-managed service)
```

---

## Images

| App | Image | Port | Build context | Notes |
|---|---|---|---|---|
| API | `ghcr.io/<owner>/laundry-api` | `3001` | repo root | NestJS + TypeORM (Node 22). Migrations run at start. |
| Dashboard | `ghcr.io/<owner>/laundry-dashboard` | `80` | repo root | Vite SPA on nginx 1.27-alpine. SPA fallback to `index.html`. |

Both Dockerfiles **must** build from the repo root — the pnpm workspace needs
`pnpm-lock.yaml`, `pnpm-workspace.yaml`, and the `@laundry/shared` package. In Dokploy set
the application's **Docker Context Path** to `.` (or empty) and the **Dockerfile Path** to
`apps/api/Dockerfile` / `apps/dashboard/Dockerfile`.

Every push to `main` tags `:latest` and `:<git-sha>`. Roll back by pointing the Dokploy
app at a previous `:<sha>` tag.

---

## API — environment variables (set in Dokploy → app → Environment)

The API reads all config from the process environment (no `.env` file in the image).

| Variable | Example / Notes |
|---|---|
| `NODE_ENV` | `production` |
| `APP_PORT` | `3001` |
| `API_PREFIX` | `api` |
| `APP_NAME` | `Laundry API` |
| `FRONTEND_DOMAIN` | `https://dashboard.example.com` (CORS) |
| `BACKEND_DOMAIN` | `https://api.example.com` |
| `DATABASE_TYPE` | `postgres` |
| `DATABASE_HOST` | Dokploy Postgres internal hostname |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` / `DATABASE_NAME` | from the Dokploy Postgres service |
| `DATABASE_SYNCHRONIZE` | `false` (migrations own the schema) |
| `DATABASE_SSL_ENABLED` | `true` if the managed DB requires TLS, else `false` |
| `AUTH_JWT_SECRET` | random ≥ 32 chars |
| `AUTH_JWT_TOKEN_EXPIRES_IN` | `15m` |
| `AUTH_REFRESH_SECRET` | random ≥ 32 chars |
| `AUTH_REFRESH_TOKEN_EXPIRES_IN` | `3650d` |
| `AUTH_FORGOT_SECRET` / `AUTH_CONFIRM_EMAIL_SECRET` | random ≥ 32 chars |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASSWORD` | production SMTP |
| `MAIL_DEFAULT_EMAIL` / `MAIL_DEFAULT_NAME` | sender identity |
| `RUN_SEED` | `true` on the **first** boot only (seeds roles + admin + sample catalog), then remove |

> The full list of keys lives in `apps/api/env-example-relational`.

**Migrations** run automatically on container start (`docker-entrypoint.sh` → TypeORM
`migration:run` via ts-node, then `node dist/main.js`). Health check: `GET /api`.

---

## Dashboard — build-time variable (GitHub repo → Settings → Variables → Actions)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.example.com/api/v1` |

Vite inlines `VITE_API_URL` into the JS bundle at build time — changing it needs a new
build + deploy, not a runtime env change.

---

## GitHub Secrets (repo → Settings → Secrets and variables → Actions → Secrets)

| Secret | Description |
|---|---|
| `DOKPLOY_URL` | Dokploy dashboard URL, e.g. `https://dokploy.example.com` |
| `DOKPLOY_API_KEY` | Dokploy → profile → API/CLI |
| `DOKPLOY_API_APP_ID` | API application ID (run `./infra/dokploy-deploy.sh ids`) |
| `DOKPLOY_DASHBOARD_APP_ID` | Dashboard application ID |

`GITHUB_TOKEN` (auto-provided) pushes to GHCR. For Dokploy to **pull** from GHCR, add a
GitHub PAT with `read:packages` in Dokploy → Settings → Registry.

---

## One-time Dokploy setup

1. Create a **PostgreSQL** service; note its internal host/credentials.
2. Create the **API** application:
   - Provider: GitHub Container Registry, image `ghcr.io/<owner>/laundry-api:latest`
     (or build from source with Dockerfile Path `apps/api/Dockerfile`, Context `.`).
   - Port `3001`; domain `api.example.com`; add the env vars above; set `RUN_SEED=true`
     for the first deploy.
3. Create the **dashboard** application:
   - Image `ghcr.io/<owner>/laundry-dashboard:latest` (Dockerfile Path
     `apps/dashboard/Dockerfile`, Context `.`); port `80`; domain `dashboard.example.com`.
4. Grab the two application IDs (`./infra/dokploy-deploy.sh ids`) and add them, plus the
   Dokploy URL/API key, as GitHub Secrets.
5. Set repo Variable `VITE_API_URL`.
6. Point DNS A-records (api + dashboard) at the VPS. With Cloudflare, use **DNS only**
   (grey cloud) so Traefik's Let's Encrypt HTTP challenge works.

After that, every push to `main` ships automatically. To trigger a redeploy by hand:

```bash
cp infra/.env.dokploy.example infra/.env.dokploy   # fill in values
./infra/dokploy-deploy.sh all        # or: api | dashboard | ids
```

---

## Rollback

In Dokploy → app → Provider, change the image tag from `:latest` to a previous
`:<git-sha>`, save, redeploy. SHA-tagged images are kept in GHCR.

#!/usr/bin/env bash
# Provision the laundry stack in Dokploy via its API (idempotent — safe to re-run).
#
#   1. ensures the project + production environment exist
#   2. ensures a PostgreSQL service exists (creates + deploys it if missing)
#   3. creates the `laundry-api` and `laundry-dashboard` applications
#   4. (if GHCR creds set) points each at its GHCR image (Docker provider)
#   5. pushes the API runtime env — DATABASE_* injected from the Postgres service,
#      AUTH_* secrets generated, MAIL_* left as placeholders
#   6. (if DOMAIN_* set) attaches domains with Let's Encrypt TLS
#   7. prints the two application IDs for the GitHub Action secrets
#
# Inputs come from infra/.env.dokploy. Required: DOKPLOY_URL, DOKPLOY_API_KEY.
# Optional: GHCR_OWNER (default yassineelouafi), GHCR_USERNAME, GHCR_PAT,
#           DOMAIN_API, DOMAIN_DASHBOARD, DOKPLOY_PROJECT_NAME (default laundry),
#           PG_SERVICE_NAME (default laundry-db), PG_DB_NAME/PG_DB_USER (default laundry).
set -euo pipefail
cd "$(dirname "$0")"

set -a; . ./.env.dokploy; set +a
: "${DOKPLOY_URL:?set DOKPLOY_URL}"
: "${DOKPLOY_API_KEY:?set DOKPLOY_API_KEY}"

PROJECT_NAME="${DOKPLOY_PROJECT_NAME:-laundry}"
GHCR_OWNER="${GHCR_OWNER:-yassineelouafi}"
API_IMAGE="ghcr.io/${GHCR_OWNER}/laundry-api:latest"
DASH_IMAGE="ghcr.io/${GHCR_OWNER}/laundry-dashboard:latest"
PG_SERVICE_NAME="${PG_SERVICE_NAME:-laundry-db}"
PG_DB_NAME="${PG_DB_NAME:-laundry}"
PG_DB_USER="${PG_DB_USER:-laundry}"

# --- tiny tRPC-over-REST helpers ----------------------------------------
api() { # api <METHOD> <path> [json-body]
  local method="$1" path="$2" body="${3:-}"
  curl -sf -X "$method" "$DOKPLOY_URL/api/$path" \
    -H "x-api-key: $DOKPLOY_API_KEY" \
    -H 'Content-Type: application/json' \
    ${body:+-d "$body"}
}
pyget() { python3 -c "import sys,json;print(eval(sys.argv[1],{'d':json.load(sys.stdin)}) or '')" "$1"; }
json_str() { python3 -c "import json,sys;print(json.dumps(sys.argv[1]))" "$1"; }

# --- 1. project + production environment ---------------------------------
PROJECTS_JSON="$(api GET project.all)"
PROJECT_ID="$(printf '%s' "$PROJECTS_JSON" | pyget "next((p['projectId'] for p in d if p.get('name')==$(json_str "$PROJECT_NAME")), '')")"
if [ -z "$PROJECT_ID" ]; then
  echo "▶ Creating project '$PROJECT_NAME'…"
  PROJECT_ID="$(api POST project.create "{\"name\": $(json_str "$PROJECT_NAME")}" | pyget "d['projectId']")"
fi
echo "  project: $PROJECT_NAME ($PROJECT_ID)"

ENV_ID="$(api GET "project.one?projectId=$PROJECT_ID" | pyget "next((e['environmentId'] for e in d.get('environments',[]) if e.get('name')=='production'), (d.get('environments') or [{}])[0].get('environmentId',''))")"
: "${ENV_ID:?could not resolve a production environmentId}"
echo "  environment: production ($ENV_ID)"

# --- 2. PostgreSQL service ----------------------------------------------
# Read an existing service's connection details (host=appName, db, user, password).
read_pg() {
  api GET "project.one?projectId=$PROJECT_ID" | python3 -c "import sys,json
d=json.load(sys.stdin)
for e in d.get('environments',[]):
  for p in e.get('postgres',[]):
    if p.get('name')==$(json_str "$PG_SERVICE_NAME"):
      print('\t'.join([p.get('postgresId') or '', p.get('appName') or '', p.get('databaseName') or '', p.get('databaseUser') or '', p.get('databasePassword') or '']))
      sys.exit()"
}

PG_ROW="$(read_pg)"
if [ -z "$PG_ROW" ]; then
  echo "▶ Creating PostgreSQL service '$PG_SERVICE_NAME'…"
  PG_GEN_PASS="$(openssl rand -hex 24)"
  PG_ID="$(api POST postgres.create "$(python3 - "$PG_SERVICE_NAME" "$PG_DB_NAME" "$PG_DB_USER" "$PG_GEN_PASS" "$ENV_ID" <<'PY'
import json,sys
name,db,user,pw,env=sys.argv[1:6]
print(json.dumps({"name":name,"databaseName":db,"databaseUser":user,"databasePassword":pw,"environmentId":env}))
PY
)" | pyget "d['postgresId']")"
  echo "  created ($PG_ID); deploying container…"
  api POST postgres.deploy "{\"postgresId\": $(json_str "$PG_ID")}" > /dev/null
  PG_ROW="$(read_pg)"
fi

IFS=$'\t' read -r PG_ID PG_HOST PG_DB PG_USER PG_PASS <<EOF
$PG_ROW
EOF
# On a just-created service the API may not echo the password back; use the one we set.
[ -z "$PG_PASS" ] && PG_PASS="${PG_GEN_PASS:-}"
: "${PG_HOST:?could not resolve Postgres appName/host}"
echo "  postgres: $PG_SERVICE_NAME  host=$PG_HOST db=$PG_DB user=$PG_USER"

# --- helper: create app if missing, echo its applicationId ---------------
get_or_create_app() {
  local name="$1" existing
  existing="$(api GET "project.one?projectId=$PROJECT_ID" | pyget "next((a['applicationId'] for e in d.get('environments',[]) for a in e.get('applications',[]) if a.get('name')==$(json_str "$name")), '')")"
  if [ -n "$existing" ]; then echo "$existing"; return; fi
  api POST application.create "{\"name\": $(json_str "$name"), \"environmentId\": $(json_str "$ENV_ID")}" | pyget "d['applicationId']"
}

echo "▶ Ensuring applications…"
API_APP_ID="$(get_or_create_app laundry-api)";        echo "  laundry-api:       $API_APP_ID"
DASH_APP_ID="$(get_or_create_app laundry-dashboard)"; echo "  laundry-dashboard: $DASH_APP_ID"

# --- 3. GHCR Docker provider --------------------------------------------
set_docker_provider() {
  api POST application.saveDockerProvider "$(python3 - "$1" "$2" "$GHCR_USERNAME" "$GHCR_PAT" <<'PY'
import json,sys
app,image,user,pat=sys.argv[1:5]
print(json.dumps({"applicationId":app,"dockerImage":image,"username":user,"password":pat,"registryUrl":"ghcr.io"}))
PY
)" > /dev/null
}
if [ -n "${GHCR_PAT:-}" ] && [ -n "${GHCR_USERNAME:-}" ]; then
  echo "▶ Setting GHCR Docker provider…"
  set_docker_provider "$API_APP_ID"  "$API_IMAGE";  echo "  -> $API_IMAGE"
  set_docker_provider "$DASH_APP_ID" "$DASH_IMAGE"; echo "  -> $DASH_IMAGE"
else
  echo "⚠ GHCR_USERNAME / GHCR_PAT not set — skipping Docker provider (add to .env.dokploy and re-run)."
fi

# --- 4. API runtime env (DATABASE_* injected from the Postgres service) ---
ENV_FILE="api.env.dokploy"
if [ ! -f "$ENV_FILE" ]; then
  echo "▶ Writing $ENV_FILE template (AUTH secrets generated; DATABASE_* auto-injected)…"
  rnd() { openssl rand -hex 32; }
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
APP_PORT=3001
API_PREFIX=api
APP_NAME=Laundry API
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang
FRONTEND_DOMAIN=${DOMAIN_DASHBOARD:+https://$DOMAIN_DASHBOARD}
BACKEND_DOMAIN=${DOMAIN_API:+https://$DOMAIN_API}
DATABASE_TYPE=postgres
DATABASE_SYNCHRONIZE=false
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
FILE_DRIVER=local
AUTH_JWT_SECRET=$(rnd)
AUTH_JWT_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_SECRET=$(rnd)
AUTH_REFRESH_TOKEN_EXPIRES_IN=3650d
AUTH_FORGOT_SECRET=$(rnd)
AUTH_FORGOT_TOKEN_EXPIRES_IN=30m
AUTH_CONFIRM_EMAIL_SECRET=$(rnd)
AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN=1d
MAIL_HOST=REPLACE_ME
MAIL_PORT=587
MAIL_USER=REPLACE_ME
MAIL_PASSWORD=REPLACE_ME
MAIL_DEFAULT_EMAIL=no-reply@example.com
MAIL_DEFAULT_NAME=Laundry
MAIL_IGNORE_TLS=false
MAIL_SECURE=true
MAIL_REQUIRE_TLS=true
RUN_SEED=true
EOF
fi

echo "▶ Pushing API runtime env (with live Postgres connection)…"
api POST application.saveEnvironment "$(python3 - "$API_APP_ID" "$ENV_FILE" "$PG_HOST" "$PG_DB" "$PG_USER" "$PG_PASS" <<'PY'
import json,sys
app,path,host,db,user,pw=sys.argv[1:7]
# Start from the file, dropping any DATABASE_ connection lines (always derived
# from the live Postgres service), then append the injected connection.
keep=[l for l in open(path).read().splitlines()
      if not l.split('=',1)[0] in ('DATABASE_HOST','DATABASE_PORT','DATABASE_USERNAME','DATABASE_PASSWORD','DATABASE_NAME')]
keep += [f"DATABASE_HOST={host}", "DATABASE_PORT=5432",
         f"DATABASE_USERNAME={user}", f"DATABASE_PASSWORD={pw}", f"DATABASE_NAME={db}"]
env="\n".join(keep)+"\n"
print(json.dumps({"applicationId":app,"env":env,"buildArgs":"","buildSecrets":"","createEnvFile":False}))
PY
)" > /dev/null
echo "  -> env saved. (Flip RUN_SEED to false after the first successful boot.)"
grep -q REPLACE_ME "$ENV_FILE" && echo "  note: MAIL_* still placeholders in $ENV_FILE — edit + re-run to enable email."

# --- 5. domains (optional) ----------------------------------------------
add_domain() {
  api POST domain.create "$(python3 - "$1" "$2" "$3" <<'PY'
import json,sys
app,host,port=sys.argv[1],sys.argv[2],int(sys.argv[3])
print(json.dumps({"applicationId":app,"host":host,"port":port,"https":True,"certificateType":"letsencrypt","path":"/","domainType":"application"}))
PY
)" > /dev/null
}
[ -n "${DOMAIN_API:-}" ]       && { echo "▶ Domain $DOMAIN_API → api:3001";          add_domain "$API_APP_ID"  "$DOMAIN_API" 3001; }
[ -n "${DOMAIN_DASHBOARD:-}" ] && { echo "▶ Domain $DOMAIN_DASHBOARD → dashboard:80"; add_domain "$DASH_APP_ID" "$DOMAIN_DASHBOARD" 80; }

# --- 6. report -----------------------------------------------------------
cat <<EOF

✅ Done. Add these to GitHub → Settings → Secrets and variables → Actions → Secrets:

   DOKPLOY_API_APP_ID=$API_APP_ID
   DOKPLOY_DASHBOARD_APP_ID=$DASH_APP_ID

(Copy them into infra/.env.dokploy too, for infra/dokploy-deploy.sh.)
The first real deploy happens once CI pushes the images to GHCR (push to main),
or trigger manually with: ./infra/dokploy-deploy.sh all
EOF

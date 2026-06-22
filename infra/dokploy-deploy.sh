#!/usr/bin/env bash
# Manually trigger a Dokploy redeploy (the GitHub Action does this automatically on
# push to main; this is for ad-hoc/local triggering and for discovering app IDs).
set -euo pipefail

ENV_FILE="$(dirname "$0")/.env.dokploy"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

: "${DOKPLOY_URL:?set DOKPLOY_URL}"
: "${DOKPLOY_API_KEY:?set DOKPLOY_API_KEY}"

api() {
  local method="$1" path="$2" body="${3:-}"
  curl -sf -X "$method" "$DOKPLOY_URL/api/$path" \
    -H "x-api-key: $DOKPLOY_API_KEY" \
    -H 'Content-Type: application/json' \
    ${body:+-d "$body"}
}

deploy_app() {
  local name="$1" app_id="$2"
  echo "Deploying $name ($app_id)..."
  api POST application.deploy "{\"applicationId\": \"$app_id\"}" > /dev/null
  echo "  -> queued. Watch logs in Dokploy or poll application.one."
}

case "${1:-all}" in
  ids)
    # List projects/applications so you can copy the application IDs.
    api GET project.all | python3 -m json.tool
    ;;
  api)
    deploy_app api "${DOKPLOY_API_APP_ID:?set DOKPLOY_API_APP_ID}"
    ;;
  dashboard)
    deploy_app dashboard "${DOKPLOY_DASHBOARD_APP_ID:?set DOKPLOY_DASHBOARD_APP_ID}"
    ;;
  all)
    deploy_app api "${DOKPLOY_API_APP_ID:?set DOKPLOY_API_APP_ID}"
    [ -n "${DOKPLOY_DASHBOARD_APP_ID:-}" ] && deploy_app dashboard "$DOKPLOY_DASHBOARD_APP_ID"
    ;;
  *)
    echo "usage: $0 [all|api|dashboard|ids]" >&2
    exit 1
    ;;
esac

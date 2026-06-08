#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "No VERCEL_TOKEN found. Starting interactive Vercel login..."
  npx vercel@latest login
else
  export VERCEL_TOKEN
fi

echo "Deploying to Vercel (production)..."
npx vercel@latest --prod --yes

cat <<'EOF'

Set these runtime environment variables in the Vercel dashboard if they are not already configured:
  OPENAI_API_KEY
  AUTH_SECRET
  AUTH_GITHUB_ID
  AUTH_GITHUB_SECRET
  AUTH_URL
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN

Repository publishing credentials are only for local publishing scripts.
Never configure local publishing credentials as Vercel runtime variables.

Update the GitHub OAuth callback URL to:
  https://YOUR-APP.vercel.app/api/auth/callback/github
EOF

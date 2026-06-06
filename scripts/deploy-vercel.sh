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
  echo "No VERCEL_TOKEN found — starting interactive Vercel login..."
  npx vercel@latest login
else
  export VERCEL_TOKEN
fi

echo "→ Deploying to Vercel (production)..."
npx vercel@latest --prod --yes

echo ""
echo "→ Set these env vars in the Vercel dashboard if not already configured:"
echo "   OPENAI_API_KEY, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_URL, GITHUB_TOKEN"
echo ""
echo "→ Update GitHub OAuth callback URL to:"
echo "   https://YOUR-APP.vercel.app/api/auth/callback/github"

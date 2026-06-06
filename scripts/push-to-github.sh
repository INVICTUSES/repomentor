#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-repomentor}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN not set. Add it to .env.local or export it."
  exit 1
fi

echo "→ Fetching GitHub user..."
USER_JSON=$(curl -sf \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user)
GITHUB_USER=$(echo "$USER_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")

echo "→ GitHub user: ${GITHUB_USER}"

if git remote get-url origin &>/dev/null; then
  echo "→ Remote 'origin' already configured"
else
  REMOTE="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
  git remote add origin "$REMOTE"
  echo "→ Added remote origin"
fi

echo "→ Creating repo ${GITHUB_USER}/${REPO_NAME} (if needed)..."
HTTP_CODE=$(curl -s -o /tmp/gh-create-repo.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"AI-powered GitHub project mentor for beginners\",\"private\":false,\"auto_init\":false}")

if [[ "$HTTP_CODE" == "201" ]]; then
  echo "→ Repository created"
elif [[ "$HTTP_CODE" == "422" ]]; then
  echo "→ Repository already exists"
else
  echo "→ Create repo response (${HTTP_CODE}):"
  cat /tmp/gh-create-repo.json
  exit 1
fi

echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✓ Done! https://github.com/${GITHUB_USER}/${REPO_NAME}"

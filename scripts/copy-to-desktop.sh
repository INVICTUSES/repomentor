#!/usr/bin/env bash
# Copies RepoMentor to Windows Desktop (run from WSL)
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="/mnt/c/Users/SMART TECH/OneDrive/Desktop/repo master project"

mkdir -p "$DEST"
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  "$SOURCE/" "$DEST/"

echo "Done! Project copied to: $DEST"

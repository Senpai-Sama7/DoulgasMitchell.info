#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "═══ Deploy Script ═══"

# ── Type check ──
echo "[1/6] Running type check..."
bun run typecheck

# ── Lint ──
echo "[2/6] Running linter..."
bun run lint

# ── Tests ──
echo "[3/6] Running tests..."
bun run test

# ── Git commit & push ──
echo "[4/6] Committing and pushing to GitHub..."
git add -A
COMMIT_MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MSG"
fi
git push origin main

# ── Vercel deploy ──
echo "[5/6] Deploying to Vercel..."
vercel --prod

echo "[6/6] Deploy complete!"
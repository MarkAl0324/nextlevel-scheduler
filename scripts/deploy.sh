#!/bin/bash
# ============================================================
# DEPLOY TO PRODUCTION
# Usage: bash deploy.sh
# Run from inside any project folder.
#
# What it does:
#   1. Confirms you are inside a git repo
#   2. Pushes latest commits to GitHub
#   3. Calls Vercel API to promote the latest deployment to production
#   4. Returns the live URL
# ============================================================

set -e

# --- Load secrets ---
ENV_FILE="/c/Users/My PC/.claude/projects/Website Developer Agent/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env file not found."
  exit 1
fi

VERCEL_TOKEN=$(grep 'VERCEL_TOKEN=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')
GITHUB_TOKEN=$(grep 'GITHUB_TOKEN=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')

# --- Get project name from git remote ---
GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$GIT_REMOTE" ]; then
  echo "ERROR: Not inside a git repository with a remote."
  exit 1
fi

PROJECT_NAME=$(basename "$GIT_REMOTE" .git)

echo ""
echo "==> Deploying $PROJECT_NAME to production..."
echo ""

# --- Step 1: Push latest to GitHub ---
echo "[1/3] Pushing to GitHub..."
git push --quiet
echo "    Done."

# --- Step 2: Get the latest Vercel deployment ---
echo "[2/3] Finding latest deployment..."
DEPLOYMENTS=$(curl -s \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_NAME&limit=1&target=preview")

DEPLOYMENT_ID=$(echo "$DEPLOYMENTS" | grep -o '"uid":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOYMENT_URL=$(echo "$DEPLOYMENTS" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEPLOYMENT_ID" ]; then
  echo "WARNING: No recent deployment found. Vercel may still be building."
  echo "Check: https://vercel.com/dashboard"
  exit 1
fi
echo "    Found deployment: $DEPLOYMENT_ID"

# --- Step 3: Promote to production ---
echo "[3/3] Promoting to production..."
curl -s -X PATCH \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v12/deployments/$DEPLOYMENT_ID/promote" \
  --data-raw '{"target":"production"}' > /dev/null

LIVE_URL="https://$PROJECT_NAME.vercel.app"

echo ""
echo "============================================================"
echo "  LIVE: $LIVE_URL"
echo "============================================================"
echo ""

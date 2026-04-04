#!/bin/bash
# ============================================================
# NEW PROJECT LAUNCHER
# Usage: bash new-project.sh <project-name> "Project description"
#
# What it does:
#   1. Creates a new GitHub repo from the template
#   2. Clones it locally into ~/projects/
#   3. Creates the Vercel project and links it
#   4. Returns your local path and preview URL
# ============================================================

set -e

# --- Load secrets ---
ENV_FILE="/c/Users/My PC/.claude/projects/Website Developer Agent/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env file not found at $ENV_FILE"
  exit 1
fi

GITHUB_TOKEN=$(grep 'GITHUB_TOKEN=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')
GITHUB_USERNAME=$(grep 'GITHUB_USERNAME=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')
VERCEL_TOKEN=$(grep 'VERCEL_TOKEN=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')
TEMPLATE_REPO=$(grep 'TEMPLATE_REPO_NAME=' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' \r')

# --- Arguments ---
PROJECT_NAME="${1}"
DESCRIPTION="${2:-"A project built with the pipeline template"}"

if [ -z "$PROJECT_NAME" ]; then
  echo "ERROR: Provide a project name."
  echo "Usage: bash new-project.sh <project-name> \"Description\""
  exit 1
fi

# Slug-ify the name (lowercase, hyphens)
SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
LOCAL_PATH="/c/Users/My PC/.claude/projects/Website Developer Agent/$SLUG"

echo ""
echo "==> Creating project: $SLUG"
echo ""

# --- Step 1: Create GitHub repo from template ---
echo "[1/4] Creating GitHub repo from template..."
REPO_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_USERNAME/$TEMPLATE_REPO/generate" \
  --data-raw "{\"owner\":\"$GITHUB_USERNAME\",\"name\":\"$SLUG\",\"description\":\"$DESCRIPTION\",\"private\":false,\"include_all_branches\":false}")

REPO_URL=$(echo "$REPO_RESPONSE" | grep -o '"html_url":"[^"]*"' | head -1 | cut -d'"' -f4)
CLONE_URL=$(echo "$REPO_RESPONSE" | grep -o '"clone_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CLONE_URL" ]; then
  echo "ERROR: Failed to create GitHub repo. Response:"
  echo "$REPO_RESPONSE" | grep '"message"'
  exit 1
fi
echo "    GitHub repo: $REPO_URL"

# Wait for GitHub to finish generating
sleep 3

# --- Step 2: Clone locally ---
echo "[2/4] Cloning repo locally..."
CLONE_URL_AUTH=$(echo "$CLONE_URL" | sed "s|https://|https://$GITHUB_TOKEN@|")
git clone --quiet "$CLONE_URL_AUTH" "$LOCAL_PATH"
echo "    Local path: $LOCAL_PATH"

# --- Step 3: Create Vercel project ---
echo "[3/4] Creating Vercel project..."
VERCEL_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v10/projects" \
  --data-raw "{\"name\":\"$SLUG\",\"framework\":\"nextjs\",\"gitRepository\":{\"type\":\"github\",\"repo\":\"$GITHUB_USERNAME/$SLUG\"}}")

VERCEL_ID=$(echo "$VERCEL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$VERCEL_ID" ]; then
  echo "WARNING: Vercel project creation may have failed. Check Vercel dashboard."
  echo "$VERCEL_RESPONSE" | grep '"error"' || true
else
  echo "    Vercel project created: $SLUG"
fi

# --- Step 4: Trigger initial deploy ---
echo "[4/4] Triggering initial deployment..."
DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  --data-raw "{\"name\":\"$SLUG\",\"gitSource\":{\"type\":\"github\",\"repoId\":\"$GITHUB_USERNAME/$SLUG\",\"ref\":\"main\"}}")

PREVIEW_URL="https://$SLUG.vercel.app"

echo ""
echo "============================================================"
echo "  Project ready!"
echo "  Local:   $LOCAL_PATH"
echo "  GitHub:  $REPO_URL"
echo "  Preview: $PREVIEW_URL (available in ~2 minutes)"
echo "============================================================"
echo ""
echo "Next: Open $LOCAL_PATH in VS Code and start building."

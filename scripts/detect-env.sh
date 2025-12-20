#!/usr/bin/env bash
# Detects whether running in GitHub Codespaces or local development.
# Usage:
#   scripts/detect-env.sh           # prints "codespaces" or "local"
#   WORK_ENV=$(scripts/detect-env.sh) && echo "$WORK_ENV"
# Optional override: create a .workenv file in repo root containing either
#   codespaces
#   local
# This file is intended to be gitignored.

set -euo pipefail

REPO_ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
OVERRIDE_FILE="$REPO_ROOT_DIR/.workenv"

# 1) Override via .workenv
if [[ -f "$OVERRIDE_FILE" ]]; then
  value=$(tr -d ' \t\r\n' < "$OVERRIDE_FILE")
  if [[ "$value" == "codespaces" || "$value" == "local" ]]; then
    echo "$value"
    exit 0
  fi
fi

# 2) Detect Codespaces via environment variables commonly present
if [[ "${CODESPACES:-}" == "true" ]]; then
  echo "codespaces"
  exit 0
fi
if [[ -n "${CODESPACE_NAME:-}" || -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  echo "codespaces"
  exit 0
fi

# 3) Heuristic: path under /workspaces indicates Codespaces
PWD_PATH="${PWD:-}"
if [[ "$PWD_PATH" == /workspaces/* ]]; then
  echo "codespaces"
  exit 0
fi

# Default to local
echo "local"

#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Resetting admin password...${NC}\n"

# Check if running in Docker or local
if docker ps --format '{{.Names}}' | grep -q "altstore-mongodb"; then
    echo "Running in Docker environment"
    docker exec altstore-server node /app/scripts/reset-admin.js
else
    echo "Running in local environment"
    # Ensure we're in the right directory
    cd "$(dirname "$0")/.."
    node scripts/reset-admin.js
fi

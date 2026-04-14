#!/bin/bash
set -euo pipefail

PROJECT=pr-$PR_NUMBER
COMPOSE_FILE=/opt/vha-preview/docker-compose-preview-deploy.yml

docker compose -p "$PROJECT" -f $COMPOSE_FILE down -v --remove-orphans 2>/dev/null || true
echo "Preview environment for PR ${PR_NUMBER} torn down"

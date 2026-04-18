#!/bin/bash
set -euo pipefail

export PORT=$((8000 + PR_NUMBER))
export PROJECT=pr-$PR_NUMBER
export IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_NUMBER-$SHA
export MIGRATOR_IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_NUMBER-$SHA-migrator
export EVENTS_IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_NUMBER-$SHA-events

COMPOSE_FILE=/opt/vha-preview/docker-compose-preview-deploy.yml

# Login to ECR
aws ecr get-login-password --region af-south-1 | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Pull images before taking down the old environment to minimise downtime
docker pull "$IMAGE"
docker pull "$MIGRATOR_IMAGE"
docker pull "$EVENTS_IMAGE"

# Tear down any existing deployment for this PR (fresh DB on each push)
docker compose -p "$PROJECT" -f $COMPOSE_FILE down -v --remove-orphans 2>/dev/null || true
docker compose -p "$PROJECT" -f $COMPOSE_FILE up -d --wait --wait-timeout 600
docker compose -p "$PROJECT" -f $COMPOSE_FILE ps

echo "Preview deployed at http://$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4):$PORT"

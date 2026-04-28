#! /usr/bin/env bash
set -euo pipefail

ensure_you_have() {
  if ! command -v "$1" &> /dev/null
  then
    echo "Please install ${2-$1}"
    exit 1
  fi
}

echo "Checking you have the right tools installed..."
ensure_you_have "git"
ensure_you_have "deno"
ensure_you_have "npm"
ensure_you_have "node"
ensure_you_have "docker"

[[ -f db/dumps/snomed ]] || {
  echo "Did not detect a file db/dumps/snomed"
  echo "Please run:"
  echo "  git lfs pull"
  exit 1
}

if ! nc -z localhost 5432; then
  echo "Postgres is not up"
  echo "Please run:"
  echo "  docker compose up"
  exit 1
fi

deno task switch:docker

echo "Now let's migrate your local database..."
deno task db:docker reset

echo "Migrations complete! You can now run the server with:"
echo "  deno task start"

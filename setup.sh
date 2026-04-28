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

echo "Now we'll install the project dependencies..."

deno task switch:docker

echo "Now let's migrate your local database..."
deno task db:docker reset

echo "Migrations complete! You can now run the server with 'deno task start'"

#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

if ! diff .env .env.docker >/dev/null; then
  deno task switch:docker
fi

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:docker "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi

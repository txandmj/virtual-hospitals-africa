#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

if ! diff .env .env.local >/dev/null; then
  exit 0
fi

deno task switch:local

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:local "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi

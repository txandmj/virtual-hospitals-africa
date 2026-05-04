#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

n=$(awk 'END{print NR}' .env.local)
diff <(head -n "$n" .env | awk '{sub(/[[:space:]]+$/,""); print}') <(awk '{sub(/[[:space:]]+$/,""); print}' .env.local) >/dev/null || {
  deno task switch:local
}

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:local "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi

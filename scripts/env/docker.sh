#! /usr/bin/env bash
set -euo pipefail

cmd="$1"
shift

n=$(awk 'END{print NR}' .env.docker)
diff <(head -n "$n" .env | awk '{sub(/[[:space:]]+$/,""); print}') <(awk '{sub(/[[:space:]]+$/,""); print}' .env.docker) >/dev/null || {
  deno task switch:docker
}

if [[ "$cmd" == db:* ]]; then
  cmd="${cmd#db:}"
  deno task db:docker "$cmd" "$@"
else
  deno task "$cmd" "$@"
fi

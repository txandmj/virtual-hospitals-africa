#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source .env
START_TIME=$(date +%Y-%m-%d_%H-%M-%S)
HTTP_SERVER_PORT="${HTTP_SERVER_PORT-8001}"
HTTPS_PROXY_SERVER_PORT="${HTTPS_PROXY_SERVER_PORT-8000}"
EVENTS_PROCESSOR_PID=
PROXY_PID=
SERVER_PID=

ensure_no_process_on_port() {
  local port=$1
  if lsof -i ":$port" >/dev/null 2>&1; then
    echo "Error: Port $port is already in use"
    exit 1
  fi
}

clean_up() {
  [ ! -z "$EVENTS_PROCESSOR_PID" ] && kill "$EVENTS_PROCESSOR_PID" || true
  [ ! -z "$PROXY_PID" ] && kill "$PROXY_PID" || true
  [ ! -z "$SERVER_PID" ] && kill "$SERVER_PID" || true
  ./scripts/general-bash/kill_process_on_port.sh "$HTTP_SERVER_PORT" || true
  ./scripts/general-bash/kill_process_on_port.sh "$HTTPS_PROXY_SERVER_PORT" || true
}

ensure_no_process_on_port "$HTTP_SERVER_PORT"
ensure_no_process_on_port "$HTTPS_PROXY_SERVER_PORT"

logs_dir="./logs/$START_TIME"
mkdir -p "$logs_dir"

events_processor_output="$logs_dir/events.log"
http_server_output="$logs_dir/server.log"
https_proxy_server_output="$logs_dir/proxy.log"
echo "Logs for this run available at $logs_dir"

deno task events:processor 2>&1 | tee "$events_processor_output" &
EVENTS_PROCESSOR_PID="$!"

HTTP_SERVER_PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task proxy 2>&1 | tee "$https_proxy_server_output" &
PROXY_PID="$!"

trap 'clean_up' EXIT

PORT=$HTTP_SERVER_PORT HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT deno task vite 2>&1 | tee "$http_server_output" &
SERVER_PID="$!"

wait $EVENTS_PROCESSOR_PID $PROXY_PID $SERVER_PID

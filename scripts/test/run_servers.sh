#! /usr/bin/env bash
set -eo pipefail

# shellcheck source=.env disable=SC1091
source .env
HTTP_SERVER_PORT=${HTTP_SERVER_PORT:-8004}
HTTPS_PROXY_SERVER_PORT=${HTTPS_PROXY_SERVER_PORT:-8005}

fail() {
  >&2 echo "$@"
  exit 1
}

# On non-CI builds ensure the .env matches either .env.local or .env.docker
if [[ "${CI:-}" == "true" ]]; then
  :
elif [ -f .env.local ] && [ -f .env.docker ]; then
  cmp --silent .env .env.local || cmp --silent .env .env.docker || fail $'.env differs from .env.local and .env.docker\nrun deno task switch:local before running tests'
elif [ -f .env.local ]; then 
  cmp --silent .env .env.local || fail $'.env differs from .env.local\nrun deno task switch:local before running tests'
elif [ -f .env.docker ]; then 
  cmp --silent .env .env.docker || fail $'.env differs from .env.docker\nrun deno task switch:docker before running tests'
fi

events_processor_pid=""
https_proxy_server_pid=""
http_server_pid=""

# On CI, write logs to a known directory for artifact upload
# Otherwise, use temp files
mkdir -p ./logs
mkdir -p ./logs/slow_queries
if [[ "${CI:-}" == "true" ]]; then
  logs_dir="./logs"
else
  logs_dir="/tmp"
fi
test_events_processor_output="$logs_dir/events.log"
test_http_server_output="$logs_dir/server.log"
test_https_proxy_server_output="$logs_dir/proxy.log"
: >"$test_events_processor_output"
: >"$test_http_server_output"
: >"$test_https_proxy_server_output"

task=vite

while [[ "$#" -gt 0 && "$1" =~ "--" ]]; do
  if [[ "$1" == "--use-build" ]]; then
    task=web
  elif [[ "$1" == "--verbose" ]]; then
    set -x
  else
    fail "Unknown option: $1"
  fi
  shift
done

ensure_test_servers_not_already_running() {
  if lsof -i "tcp:$HTTP_SERVER_PORT"; then
    fail "There's a process on port $HTTP_SERVER_PORT"
  fi

  if lsof -i "tcp:$HTTPS_PROXY_SERVER_PORT"; then
    fail "There's a process on port $HTTPS_PROXY_SERVER_PORT"
  fi
}

print_server_log_info() {
  echo "Proxy output available at $test_https_proxy_server_output"
  echo "Server output available at $test_http_server_output"
  echo "Events output available at $test_events_processor_output"
}

# shellcheck disable=SC2329
cleanup() {
  if [ -n "$http_server_pid" ]; then
    kill "$http_server_pid" || true
  fi
  if [ -n "$https_proxy_server_pid" ]; then
    kill "$https_proxy_server_pid" || true
  fi
  if [ -n "$events_processor_pid" ]; then
    kill "$events_processor_pid" || true
  fi
  if [[ "${CI:-}" == "true" ]]; then
    # Logs are saved to ./logs/ and uploaded as artifacts
    echo "Events processor, server, and proxy logs saved to ./logs/ (will be uploaded as artifacts)"
  else
    print_server_log_info
  fi
}

start_events_processor() {
  IS_TEST=true \
  PORT=$HTTP_SERVER_PORT \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  exec deno task events:processor \
  >> "$test_events_processor_output" 2>&1
}

start_http_server() {
  IS_TEST=true \
  PORT=$HTTP_SERVER_PORT \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  FAKE_GOOGLE_AUTH=false \
  GOOGLE_CLIENT_ID=FAKE_GOOGLE_CLIENT_ID \
  exec deno task $task \
  >> "$test_http_server_output" 2>&1
}

start_https_proxy_server() {
  VERBOSE=1 \
  HTTPS_PROXY_SERVER_PORT=$HTTPS_PROXY_SERVER_PORT \
  HTTP_SERVER_PORT=$HTTP_SERVER_PORT \
  exec deno task proxy \
  >> "$test_https_proxy_server_output" 2>&1
}

ensure_test_servers_not_already_running

trap cleanup EXIT INT TERM HUP

start_events_processor &
events_processor_pid="$!"

start_https_proxy_server &
https_proxy_server_pid="$!"

print_server_log_info

start_http_server &
http_server_pid="$!"

# Wait for any process to exit - if one dies, we want to fail fast
wait -n $events_processor_pid $https_proxy_server_pid $http_server_pid 
exit 1
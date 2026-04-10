#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source .env

psql "$DATABASE_URL" -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid()
    AND datname = current_database();
"

#!/usr/bin/env bash
set -euo pipefail

# Rebases all open PRs on origin/main. If a rebase has conflicts it is
# aborted and the conflicting files are recorded. Successful rebases are
# force-pushed (with-lease) back to their remote branch.
#
# Usage:
#   rebase-all.sh --branch=foo --branch=bar
#   rebase-all.sh --author=octocat
#
# Requires: gh, git. Must be run inside the repo.

usage() {
  cat <<EOF
Usage:
  $0 --branch=<branch> [--branch=<branch> ...]
  $0 --author=<github-username>
EOF
  exit 1
}

branches=()
author=""

for arg in "$@"; do
  case "$arg" in
    --branch=*)
      branches+=("${arg#--branch=}")
      ;;
    --author=*)
      author="${arg#--author=}"
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage
      ;;
  esac
done

if [ ${#branches[@]} -eq 0 ] && [ -z "$author" ]; then
  usage
fi

if [ ${#branches[@]} -gt 0 ] && [ -n "$author" ]; then
  echo "Pass either --branch= flags or a single --author=, not both." >&2
  exit 1
fi

command -v gh >/dev/null 2>&1 || { echo "gh CLI is required" >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required" >&2; exit 1; }

# Refuse to run with a dirty working tree — we'll be checking out branches.
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash before running." >&2
  exit 1
fi

original_ref="$(git symbolic-ref --quiet --short HEAD || git rev-parse HEAD)"

echo "Fetching origin..."
git fetch origin --prune

# Resolve the list of branches to rebase.
if [ -n "$author" ]; then
  echo "Looking up open PRs by author '$author'..."
  mapfile -t branches < <(
    gh pr list --state open --author "$author" --limit 200 \
      --json headRefName,isCrossRepository,headRepositoryOwner \
      --jq '.[] | select(.isCrossRepository == false) | .headRefName'
  )
fi

if [ ${#branches[@]} -eq 0 ]; then
  echo "No branches to rebase." >&2
  exit 0
fi

rebased_ok=()
rebased_failed=()      # "branch:file1,file2,..."
push_failed=()         # "branch:reason"
skipped=()             # "branch:reason"

restore_original() {
  git rebase --abort >/dev/null 2>&1 || true
  git checkout --quiet "$original_ref" || true
}
trap restore_original EXIT

for branch in "${branches[@]}"; do
  echo
  echo "=== $branch ==="

  if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    echo "  remote branch origin/$branch not found, skipping"
    skipped+=("$branch:no remote branch")
    continue
  fi

  # Check out a fresh local copy tracking the remote.
  git checkout --quiet -B "$branch" "origin/$branch"

  if git rebase origin/main; then
    echo "  rebase succeeded"
    if git push --force-with-lease origin "$branch"; then
      rebased_ok+=("$branch")
    else
      echo "  push failed"
      push_failed+=("$branch:push --force-with-lease failed")
    fi
  else
    # Collect conflicting files before aborting.
    conflicts="$(git diff --name-only --diff-filter=U | paste -sd ',' -)"
    if [ -z "$conflicts" ]; then
      conflicts="(unknown — rebase failed without listed conflicts)"
    fi
    echo "  conflicts: $conflicts"
    git rebase --abort >/dev/null 2>&1 || true
    rebased_failed+=("$branch:$conflicts")
  fi
done

echo
echo "================ Summary ================"
echo "Rebased and pushed (${#rebased_ok[@]}):"
for b in "${rebased_ok[@]}"; do
  echo "  - $b"
done

echo
echo "Conflicts — aborted (${#rebased_failed[@]}):"
for entry in "${rebased_failed[@]}"; do
  branch="${entry%%:*}"
  files="${entry#*:}"
  echo "  - $branch"
  IFS=',' read -ra fs <<< "$files"
  for f in "${fs[@]}"; do
    [ -n "$f" ] && echo "      $f"
  done
done

if [ ${#push_failed[@]} -gt 0 ]; then
  echo
  echo "Rebased but push failed (${#push_failed[@]}):"
  for entry in "${push_failed[@]}"; do
    echo "  - ${entry%%:*} (${entry#*:})"
  done
fi

if [ ${#skipped[@]} -gt 0 ]; then
  echo
  echo "Skipped (${#skipped[@]}):"
  for entry in "${skipped[@]}"; do
    echo "  - ${entry%%:*} (${entry#*:})"
  done
fi

# Non-zero exit if anything didn't go cleanly, so this composes in CI/scripts.
if [ ${#rebased_failed[@]} -gt 0 ] || [ ${#push_failed[@]} -gt 0 ]; then
  exit 1
fi

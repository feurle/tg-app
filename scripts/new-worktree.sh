#!/usr/bin/env bash
# Creates a git worktree for one issue next to the main checkout.
# See docs/local-development.md#parallel-worktrees.
set -euo pipefail

if [[ $# -ne 3 || ! $1 =~ ^[0-9]+$ ]]; then
    echo "Usage: $0 <issue> <type> <slug>" >&2
    echo "Example: $0 137 chore actions-node24" >&2
    exit 1
fi

issue=$1
branch="$2/$1-$3"

# The main checkout, also when the script runs inside another worktree.
main=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
dir="$(dirname "$main")/$(basename "$main")-$issue"

git -C "$main" fetch --quiet origin trunk
# --no-track: otherwise the branch tracks origin/trunk and a bare `git push` targets trunk.
git -C "$main" worktree add --no-track -b "$branch" "$dir" origin/trunk

if [[ -f "$main/.env" ]]; then
    cp "$main/.env" "$dir/.env"
fi

(cd "$dir/frontend" && npm ci --no-audit --no-fund --loglevel=error)

cat <<EOF

Worktree: $dir
Branch:   $branch
Ports:    backend $((20000 + issue)), frontend $((30000 + issue))

  cd $dir && opencode
  SERVER_PORT=$((20000 + issue)) VITE_PORT=$((30000 + issue)) ./gradlew devAll
  git push -u origin $branch
EOF

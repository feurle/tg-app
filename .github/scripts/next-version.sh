#!/usr/bin/env bash
# Prints "version=<semver>" and "release=<true|false>" for <rev> (default HEAD).
# Usage: next-version.sh [changelog] [rev]
set -euo pipefail

changelog="${1:-CHANGELOG.md}"
rev="${2:-HEAD}"

latest_tag="$(git tag --list 'v*' --sort=-v:refname | head -n 1)"

if [ -z "$latest_tag" ]; then
  version="1.0.0"
else
  IFS=. read -r major minor patch <<< "${latest_tag#v}"

  # A release can collect several merges, so the highest bump since the last tag wins.
  bump=patch
  for sha in $(git rev-list --invert-grep --grep='^chore(release): v' "${latest_tag}..${rev}"); do
    subject="$(git log -1 --format=%s "$sha")"
    body="$(git log -1 --format=%b "$sha")"
    if [[ "$subject" =~ ^[a-z]+(\([^\)]*\))?!: ]] || grep -q '^BREAKING CHANGE:' <<< "$body"; then
      bump=major
    elif [[ "$subject" =~ ^feat ]] && [ "$bump" = patch ]; then
      bump=minor
    fi
  done

  case "$bump" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac
  version="${major}.${minor}.${patch}"
fi

# A release needs a bullet under [Unreleased] or a fragment in changelog.d/.
release=false
fragments="$(dirname "$changelog")/changelog.d"
if [ -d "$fragments" ] && [ -n "$(find "$fragments" -name '*.md' ! -name README.md -print -quit)" ]; then
  release=true
elif awk '/^## \[Unreleased\]/{in_section=1; next} /^## \[/{in_section=0} in_section && /^- /{found=1} END{exit !found}' "$changelog"; then
  release=true
fi

echo "version=${version}"
echo "release=${release}"

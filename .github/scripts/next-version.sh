#!/usr/bin/env bash
# Prints "version=<semver>" and "release=<true|false>" for the current HEAD.
set -euo pipefail

changelog="${1:-CHANGELOG.md}"

latest_tag="$(git tag --list 'v*' --sort=-v:refname | head -n 1)"

if [ -z "$latest_tag" ]; then
  version="1.0.0"
else
  IFS=. read -r major minor patch <<< "${latest_tag#v}"
  subject="$(git log -1 --format=%s HEAD)"
  body="$(git log -1 --format=%b HEAD)"

  if [[ "$subject" =~ ^[a-z]+(\([^\)]*\))?!: ]] || grep -q '^BREAKING CHANGE:' <<< "$body"; then
    major=$((major + 1)); minor=0; patch=0
  elif [[ "$subject" =~ ^feat ]]; then
    minor=$((minor + 1)); patch=0
  else
    patch=$((patch + 1))
  fi
  version="${major}.${minor}.${patch}"
fi

release=false
if awk '/^## \[Unreleased\]/{in_section=1; next} /^## \[/{in_section=0} in_section && /^- /{found=1} END{exit !found}' "$changelog"; then
  release=true
fi

echo "version=${version}"
echo "release=${release}"

#!/usr/bin/env bash
# Prints the newest commit on <ref> (default HEAD) that starts a Build & Deploy run on trunk.
# Docs-only merges start no run, so they never get a build, a release or a PROD deploy of their own.
# Keep the paths in sync with on.push.paths in .github/workflows/deploy.yml.
set -euo pipefail

git log -1 --format=%H --invert-grep --grep='^chore(release): v' "${1:-HEAD}" -- \
  src frontend build.gradle settings.gradle gradle gradlew gradlew.bat \
  changelog.d ':(exclude)changelog.d/README.md' .github/workflows/deploy.yml

# Contributing

## Changelog

Every feature or fix PR adds a bullet under `## [Unreleased]` in `CHANGELOG.md`. The merge then
produces a release (see [deployment.md](deployment.md#release-flow)).

## Commit subjects

The squash commit subject sets the next version:

- `feat` → minor
- `!` or `BREAKING CHANGE` → major
- anything else → patch

## Before committing

- Run `./gradlew spotlessApply` (Google Java Format). It reformats the whole codebase, so check
  `git status` and `git diff` and revert any changes you did not make.
- Do not write scratch files (snapshots, dumps) into the repo. Use a temp directory outside the repo (e.g. from `mktemp -d`).

## Keep the docs current

Structural changes (new module, new frontend feature folder, changed build or deploy process,
new seed data, etc.) must update the matching docs in the same change:

- `AGENTS.md` (root) for anything every task needs
- the relevant file in `docs/`
- `frontend/README.md` and `README.md` where they are affected

Stale docs are worse than no docs.

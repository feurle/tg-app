# Contributing

## Pull request flow

1. Work in a branch (one worktree per issue, see
   [local-development.md](local-development.md#parallel-worktrees)). A push runs nothing. The
   PR runs `Test & Build` only.
2. Squash-merge the PR into `trunk`. This deploys to TEST and cuts the release. It does not
   reach PROD.
3. Check the result on TEST, then approve the run for `production`
   (see [deployment.md](deployment.md#promotion-to-production)).

Never push to `trunk` directly; the ruleset rejects it.

## Changelog

Every feature or fix PR adds a fragment `changelog.d/<branch-slug>.md` instead of editing
`CHANGELOG.md`, so parallel PRs do not conflict. Format: [changelog.d/README.md](../changelog.d/README.md).
The merge then produces a release (see [deployment.md](deployment.md#release-flow)).

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

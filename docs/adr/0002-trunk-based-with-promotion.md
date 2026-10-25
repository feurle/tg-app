---
status: accepted
---

# Trunk-based development: trunk deploys to TEST, PROD needs approval

Until now every push to a `feature/**`, `fix/**`, … branch deployed to TEST, and every merge into `trunk` deployed straight to PROD. With several features developed in parallel in git worktrees, the branch deploys overwrote each other on TEST, each push cost a full build and deploy, and a merge could reach PROD without anyone having seen the integrated result on TEST.

We decided that `trunk` is the integration branch. Features reach it one by one as squash-merged PRs. Branches only run CI (`Test & Build`) on the PR. Every merge into `trunk` builds one image (`sha-<sha>`), deploys it to TEST and cuts the release. PROD runs the same image after a manual approval of the GitHub environment `production`. See [branching-model.puml](../branching-model.puml) and [deployment-pipeline.puml](../deployment-pipeline.puml).

Rejected alternatives:

- **A `develop` or `staging` branch.** Features would merge there, and a periodic `develop` → `trunk` PR would release. This needs back-merges, a second place for the version rules (the squash commit subject sets the version) and a bundle merge that hides which feature broke. With two stages (TEST and PROD) the second branch adds a stage without adding a place to deploy it.
- **A throwaway integration branch rebuilt from selected feature branches.** Flexible, but it needs upkeep, and TEST would not show what later reaches `trunk`.

## Consequences

- A merge into `trunk` no longer means "live". Only the approval does. Approve the newest run; an older waiting run is skipped when approved.
- Every `trunk` merge with a changelog entry gets a version and tag, including builds that never reach PROD. PROD can jump from 1.3.0 to 1.3.2.
- A risky feature can still be shown on TEST before the merge by starting `deploy.yml` on its branch by hand. The next `trunk` merge overwrites it.
- Hotfixes go through `trunk` (fix forward). If an untested feature is in the way, revert it on `trunk`. Rollback deploys an earlier version with `rollback.yml`.
- Parallel PRs would all edit `## [Unreleased]` and conflict, so changelog entries are fragments in `changelog.d/`, merged into `CHANGELOG.md` by the release job.
- `trunk` is protected by a ruleset (PR and a green `Test & Build` required, no "branch must be up to date"). The release job pushes with a deploy key that is on the bypass list.

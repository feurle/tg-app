# Deployment

## CI/CD

GitHub Actions workflow: `.github/workflows/deploy.yml`. Branching model and rationale:
[adr/0002-trunk-based-with-promotion.md](adr/0002-trunk-based-with-promotion.md). Diagrams:
[branching-model.puml](branching-model.puml), [deployment-pipeline.puml](deployment-pipeline.puml).

| Trigger | What runs |
|---|---|
| PR against `trunk` | `Test & Build` only: frontend lint and tests, `./gradlew test bootJar sonar`. No image, no deploy. |
| Merge (push) into `trunk` | `Test & Build` → image → TEST → release; then `deploy-prod` waits for approval. Only if the merge touches `src/`, `frontend/`, the Gradle files, a changelog fragment in `changelog.d/` or `deploy.yml`; a docs-only merge runs nothing. |
| `workflow_dispatch` on a branch | `Test & Build` → image → TEST. |
| `workflow_dispatch` on `trunk` | Like a merge, but without the release. |

Steps after `Test & Build`:

1. `./gradlew bootBuildImage` pushes `feurle/tg-app:sha-<sha>` to Docker Hub, once per build, and
   `feurle/tg-app:x.y.z` when the build is a release. The Paketo builder is pinned in
   `build.gradle` (`builder-noble-java-tiny:0.0.200`) because its `latest` tag was republished
   arm64-only on 2026-10-23, which breaks the amd64 runner (`exec format error`). Bump the version
   deliberately, and check that the tag is multi-arch.
2. `deploy-test` points `:snapshot` at that image (`docker buildx imagetools create`, no rebuild)
   and deploys `src/main/docker/test-compose.yml`.
3. `release` (trunk only) cuts the changelog and tags the version, see [Release flow](#release-flow).
4. `deploy-prod` (trunk only) runs in the GitHub environment `production` and waits for approval.
   It then points `:latest` at the same `sha-<sha>` image and deploys
   `src/main/docker/prod-compose.yml`. Nothing is rebuilt between TEST and PROD.

`:snapshot` (TEST) and `:latest` (PROD) are moving pointers. The compose files do not change.
Deploys use SSH and the Docker Compose files in `src/main/docker/`.

### Gradle cache

`Test & Build` and `Build & Push Image` both use `gradle/actions/setup-gradle@v6` with
`cache-provider: basic` (open source; the `enhanced` provider is proprietary and needs acceptance of
the Gradle Terms of Use). There is no manual `actions/cache` for Gradle.

- Only runs on `trunk` write the cache. PRs and `workflow_dispatch` on other branches restore it
  read-only (action default, derived from the repository's default branch).
- The key is a hash of `**/*.gradle*`, `gradle-wrapper.properties`, `gradle/*.versions.toml` and a few
  other build files. A change to any of them starts with an empty cache and writes one new entry on
  `trunk`. The basic provider has no restore keys and no automatic cleanup; old entries expire after
  7 days without access.
- The npm and Sonar caches are separate and unchanged.

Inspect the caches with `gh api repos/{owner}/{repo}/actions/caches`.

### Compose files on the server

`/appbase/tg-app/` holds three files that Docker Compose loads as one project (`-f services.yml
-f prod-compose.yml -f test-compose.yml`). Loading all three keeps `--remove-orphans` from treating
the other environment's container as an orphan. Each workflow copies only its own file and names
only its own service in `up -d`:

| Workflow | Copies | Starts or updates |
|---|---|---|
| `deploy-test` (`deploy.yml`) | `test-compose.yml` | `tg-app-test` |
| `deploy-prod` (`deploy.yml`, after approval) and `rollback.yml` | `prod-compose.yml` | `tg-app-prod` |
| none (by hand, see below) | `services.yml` | `tg-database`, `tg-admin` |

So a TEST deploy never changes `prod-compose.yml` or the PROD container, and a PROD deploy or
rollback never changes `test-compose.yml` or the TEST container. Before `docker compose`, every
workflow checks that all three files exist on the server and fails if one is missing.

#### Shared services (`services.yml`)

`services.yml` defines `tg-database` and `tg-admin`, which both environments use. App deploys do not
copy it, because a change can recreate the database container. To change it, merge the change to
`trunk`, check out `trunk` and update the server by hand:

```bash
scp src/main/docker/services.yml <user>@<host>:/appbase/tg-app/
ssh <user>@<host> 'docker compose -f /appbase/tg-app/services.yml \
  -f /appbase/tg-app/prod-compose.yml -f /appbase/tg-app/test-compose.yml \
  up -d --remove-orphans tg-database tg-admin'
```

All three files are loaded so that `--remove-orphans` keeps the app containers, and only the
shared services are named, so `tg-app-test` and `tg-app-prod` are not recreated. Check the diff of
`services.yml` first: a new image tag or a changed `command` restarts the database, and both
environments are briefly down.

#### First installation

On a new server the workflows cannot create the files they do not own. Before the first deploy,
copy all of them once and create the `.env` (template: `src/main/docker/.env.example`):

```bash
ssh <user>@<host> mkdir -p /appbase/tg-app
scp -r src/main/docker/services.yml src/main/docker/prod-compose.yml \
    src/main/docker/test-compose.yml src/main/docker/init \
    <user>@<host>:/appbase/tg-app/
```

`init/` is mounted into the database container (`./init` in `services.yml`) and only runs when the
database volume is empty. After that, the TEST and PROD deploys keep their own files current;
`services.yml` is updated by hand as described above. Changes to `init/` are not synced; copy them by hand.

### Promotion to production

`deploy-prod` waits for the required reviewer. Check the build on TEST, then approve:

- in the GitHub UI: Actions → the `Build & Deploy` run → *Review deployments*, or
- `gh run list --workflow deploy.yml --branch trunk`, then open the run with `gh run view --web`.

Approve the **newest** run. The job first checks that its commit is the newest `trunk` commit that
is not a release commit; if not, it logs a warning and skips the deploy, so an older waiting run
can never replace a newer build on PROD. Reject runs you do not want to release.

### Deploying a branch to TEST

To see a risky feature on TEST before it is merged, start the workflow on its branch:

```bash
gh workflow run deploy.yml --ref fix/113-office-hours
```

TEST then runs that branch (`BRANCH_NAME` shows it) until the next `trunk` merge or the next manual
run overwrites it. Do not use this for routine work. Merge to `trunk` instead, so TEST shows what
PROD will get. Starting the workflow on `trunk` rebuilds it and also queues an approval for PROD.

### Rollback

Deploy an earlier released version to PROD (the tag exists as `feurle/tg-app:x.y.z`):

```bash
gh workflow run rollback.yml -f version=1.2.4
```

`.github/workflows/rollback.yml` waits for the `production` approval, points `:latest` at that
version and deploys with `prod-compose.yml` only; TEST is left alone. The next approved `trunk` build replaces it again. Production data is
re-seeded on every deploy, so a rollback does not restore database content. Hotfixes are fix
forward through `trunk`; if an untested feature is in the way, revert it on `trunk`.

### GitHub setup

These settings live outside the repository; recreate them when the repository is moved:

- Environment `production`: required reviewer `feurle`, deployment branches limited to `trunk`.
- Ruleset on `trunk`: pull request required, status check `Test & Build` required, force-push and
  deletion blocked, *no* "branch must be up to date" (parallel PRs would need constant rebases).
  Bypass list: repository admins and deploy keys.
- Secret `RELEASE_DEPLOY_KEY`: the private half of a write-enabled deploy key. The `release` job
  pushes the release commit and tag with it, because the ruleset blocks `GITHUB_TOKEN` pushes.
- Secrets used by the workflows: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SONAR_TOKEN`,
  `SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER`, `VIRTUAL_HOST_TEST`, `VIRTUAL_HOST_PROD`.

Both environments sit behind an Nginx reverse proxy with Let's Encrypt TLS
([proxy-architecture.puml](proxy-architecture.puml)).

All outgoing mail goes to the primary `vet_info` address. To keep staging from writing to the
practice (or to referring vets), set `MAIL_TO=<own address>` in `/appbase/tg-app/.env` on the host:
every mail is then redirected there with the real recipient in the subject. Leave it unset in
production. The compose files pass it through (`MAIL_TO=${MAIL_TO:-}`).

### Checking real mail delivery (go-live)

Local runs only prove that the app can talk to an SMTP server (see
[local-development.md](local-development.md#sending-real-mail-locally)). Delivery from the real
sender needs a check on TEST, because only there the sender domain `tier-gesund.at` applies:

1. On the host, set `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `MAIL_FROM` (an address on
   `tier-gesund.at`) in `/appbase/tg-app/.env`. `SMTP_PORT` is not passed through by the compose
   files and stays at its default 587 (STARTTLS).
2. On TEST also set `MAIL_TO=<own address>`, so nothing reaches the practice or outside vets.
3. Submit the contact form, an appointment request and a referral (the referral also sends a
   confirmation to the referring vet) and complete the questionnaire. These are all four mail
   types.
4. In the received mail, check the headers: `spf=pass` and `dkim=pass` for `tier-gesund.at`
   (in Gmail: "Show original"), and that the mail landed in the inbox, not in spam.

PROD uses the same mail settings as TEST (same SMTP server, credentials and sender), so it is not
tested separately. On 2026-10-25 the contact message, appointment request, referral (with
confirmation) and questionnaire were delivered successfully on TEST.

If SPF or DKIM fail, fix the DNS records of `tier-gesund.at` at the mail provider, not in the app.

Mail texts are German only, on purpose: all mails except the referral confirmation go to the
practice. Only that confirmation reaches an outsider (the referring vet); translating it is a
possible later change.

Production data is re-seeded from the CSV files on every deploy. See
[database.md](database.md).

## Single container

`./gradlew build` and `bootBuildImage` also build the frontend (`npmInstall` → `buildFrontend`
→ `syncFrontend`) and copy `frontend/dist/` into `src/main/resources/static`. The one image
serves both frontend and backend. There is no separate frontend image. See
[adr/0001-single-container-deployment.md](adr/0001-single-container-deployment.md).

## Release flow

The `release` job in `deploy.yml` runs after every successful TEST deploy from a `trunk` push, so
every merge with a changelog entry is a release, whether or not it is promoted to PROD:

- It only releases if `changelog.d/` has at least one fragment or `## [Unreleased]` in
  `CHANGELOG.md` has at least one bullet.
- The next version is computed by `.github/scripts/next-version.sh` from the squash commit
  subject (see [contributing.md](contributing.md)).
- `cut-changelog.py` merges the fragments into `[Unreleased]`, moves it into
  `## [x.y.z] - date` and deletes the fragments. The bot commits `chore(release): vx.y.z` to
  `trunk` (with the `RELEASE_DEPLOY_KEY` deploy key), pushes the tag and creates a GitHub Release.
- It skips itself when `trunk` has moved on since the deployed commit; the later run releases.
- The version is baked into the app as `APP_VERSION` (`build.gradle`, actuator `/info`) and
  pushed as Docker tag `feurle/tg-app:x.y.z`. Builds of other branches get `x.y.z-SNAPSHOT`.

## Actuator

- `/actuator/health` is public.
- Other actuator endpoints require `ROLE_ADMIN` via HTTP Basic, so that `tg-admin` can query them.
- `test` and `prod` expose only `health,info,metrics,loggers,modulith`. `loggers` stays so that
  log levels can be changed from tg-admin. `heapdump`, `env`, `beans`, `threaddump` and `logfile`
  are dev-only (a heap dump leaks sessions and secrets), so tg-admin shows no environment, dumps
  or log file for these instances. All of them require `ROLE_ADMIN` via HTTP Basic.

## tg-admin

`tg-admin/` is a separate Spring Boot Admin monitoring server with its own `build.gradle` and
`settings.gradle`. It is not part of the root Gradle build and pushes its own image
`feurle/tg-admin`. It has no GitHub Actions workflow and is deployed manually.

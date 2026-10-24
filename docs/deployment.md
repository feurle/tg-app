# Deployment

## CI/CD

GitHub Actions workflow: `.github/workflows/deploy.yml`.

1. `./gradlew test bootJar sonar`: tests and SonarQube analysis.
2. `./gradlew bootBuildImage`: pushes the Docker image `feurle/tg-app` to Docker Hub. The Paketo
   builder is pinned in `build.gradle` (`builder-noble-java-tiny:0.0.200`) because its `latest` tag
   was republished arm64-only on 2026-10-23, which breaks the amd64 runner (`exec format error`).
   Bump the version deliberately, and check that the tag is multi-arch.
   - `trunk` → tag `latest` → production (`src/main/docker/prod-compose.yml`).
   - `feature/**`, `fix/**`, `hotfix/**`, `chore/**`, `refactor/**` → tag `snapshot` → staging
     (`src/main/docker/test-compose.yml`).
3. Deployed over SSH with the Docker Compose files in `src/main/docker/`.

Both environments sit behind an Nginx reverse proxy with Let's Encrypt TLS
([proxy-architecture.puml](proxy-architecture.puml)).

All outgoing mail goes to the primary `vet_info` address. To keep staging from writing to the
practice (or to referring vets), set `MAIL_TO=<own address>` in `/appbase/tg-app/.env` on the host:
every mail is then redirected there with the real recipient in the subject. Leave it unset in
production. The compose files pass it through (`MAIL_TO=${MAIL_TO:-}`).

Production data is re-seeded from the CSV files on every deploy. See
[database.md](database.md).

## Single container

`./gradlew build` and `bootBuildImage` also build the frontend (`npmInstall` → `buildFrontend`
→ `syncFrontend`) and copy `frontend/dist/` into `src/main/resources/static`. The one image
serves both frontend and backend. There is no separate frontend image. See
[adr/0001-single-container-deployment.md](adr/0001-single-container-deployment.md).

## Release flow

`.github/workflows/release.yml` runs after a successful production deploy from `trunk`:

- It only releases if `## [Unreleased]` in `CHANGELOG.md` has at least one bullet.
- The next version is computed by `.github/scripts/next-version.sh` from the squash commit
  subject (see [contributing.md](contributing.md)).
- `cut-changelog.py` moves `[Unreleased]` into `## [x.y.z] - date`. The bot commits
  `chore(release): vx.y.z` to `trunk`, pushes the tag and creates a GitHub Release.
- The version is baked into the app as `APP_VERSION` (`build.gradle`, actuator `/info`) and
  pushed as Docker tag `feurle/tg-app:x.y.z`. Non-release builds get `x.y.z-SNAPSHOT`.

## Actuator

- `/actuator/health` is public.
- Other actuator endpoints require `ROLE_ADMIN` via HTTP Basic, so that `tg-admin` can query them.
- Open before go-live: `test` and `prod` expose `heapdump`, `env`, `beans`, `threaddump` and
  `loggers`. A heap dump leaks sessions and secrets. Trim to `health,info,metrics,modulith`.

## tg-admin

`tg-admin/` is a separate Spring Boot Admin monitoring server with its own `build.gradle` and
`settings.gradle`. It is not part of the root Gradle build and pushes its own image
`feurle/tg-admin`. It has no GitHub Actions workflow and is deployed manually.

# AGENTS.md

Spring Boot backend (Java 21, Gradle wrapper, Spring Modulith) for a veterinary practice website and CMS, with a React 19 + TypeScript frontend in `frontend/`. The default branch is `trunk`.

## Commands

```bash
./gradlew devAll            # backend :8080 (dev profile, H2) + frontend :5173 in one terminal
./gradlew spotlessApply     # format code (Google Java Format), run before committing
```

`./gradlew build` runs the tests and also builds the frontend into the backend's static resources.

## Rules for every task

- Modules talk to each other only through Spring events or exposed interfaces, never through another module's internals.
- All frontend backend calls go through `frontend/src/lib/apiClient.ts`.
- Write endpoints under `/api/webcontent` require `ROLE_ADMIN`.
- Until go-live, Liquibase changesets are edited in place; after go-live, every change needs a new changeset. See [docs/database.md](docs/database.md).
- Structural changes update the docs in the same change. See [docs/contributing.md](docs/contributing.md).

## Docs

| Read this when… | File |
|---|---|
| changing backend modules, layers or cross-module code | [docs/architecture.md](docs/architecture.md) |
| touching the database, Liquibase, seed data or test credentials | [docs/database.md](docs/database.md) |
| working on articles, pages, images or `ArticleType` | [docs/webcontent.md](docs/webcontent.md) |
| working on the frontend (API client, auth, routing, i18n) | [docs/frontend.md](docs/frontend.md) |
| setting up or running the app locally | [docs/local-development.md](docs/local-development.md) |
| changing the CI/CD, Docker image, releases or `tg-admin` | [docs/deployment.md](docs/deployment.md) |
| opening a PR (changelog, commit subjects, formatting) | [docs/contributing.md](docs/contributing.md) |
| changing UI, styling or design tokens | [docs/ui-design.md](docs/ui-design.md) |
| verifying a change at runtime (backend + browser) | [docs/verification.md](docs/verification.md) |
| understanding a past architecture decision | [docs/adr/](docs/adr/) |

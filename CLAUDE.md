# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (this repo — Spring Boot)
```bash
./gradlew bootRun          # Run with dev profile (H2 in-memory DB, hot reload)
./gradlew test             # Run all tests
./gradlew test --tests "com.feurle.tg.SomeTest"  # Run a single test class
./gradlew build            # Full build including tests
./gradlew spotlessApply    # Format code (Google Java Format — run before committing)
./gradlew jacocoTestReport # Generate coverage report
./gradlew bootBuildImage   # Build Docker image via Cloud Native Buildpacks
```

### Local Development
The frontend lives in a sibling repo (`../tg-web`). For full-stack development:
- Terminal 1: `./gradlew bootRun` → backend on `http://localhost:8080`
- Terminal 2: `npm run dev` (in `../tg-web`) → frontend on `http://localhost:5173`

Vite proxies `/api/*` to the backend, so no CORS issues in dev.

## Architecture

This is a **Spring Modulith** (modular monolith) backend. Module boundaries are enforced by the framework — avoid cross-module direct dependencies (use Spring events or exposed interfaces instead).

### Three domain modules under `com.feurle.tg`:

**`webcontent`** — Article, Image, Tag management
- Articles have multilingual content (DE, EN, SV, RU), states (`CREATED`, `PUBLISHED`, `CLOSED`), and a `PageType`
- Images are linked to articles

**`user`** — Authentication and user management
- Spring Security form-based, session-based auth (no JWT)
- `AppUserDetailsService` integrates with Spring Security
- Roles: `ROLE_ADMIN`, `ROLE_USER`

**`customer`** — Customer data

**`common`** — `GlobalExceptionHandler` (shared error handling)

### Layer pattern within each module:
```
domain/         → JPA entities + repository interfaces
application/    → Service classes (business logic)
infrastructure/ → REST controllers, JPA repository impls, DTOs, mappers
```

### Database
- **Dev profile:** H2 in-memory, H2 console at `http://localhost:8080/h2-console`
- **Stage/Prod:** MySQL 9.2 (Liquibase drops & re-migrates on deploy)
- Migrations in `src/main/resources/db/changelog/` (Liquibase YAML)
- Fake data is loaded by Liquibase in dev: ~50 articles in 4 languages, ~50 customers

### Profiles
- `dev` — default for local, H2, hot reload
- `stage` / `prod` — MySQL, deployed via Docker Compose + SSH in GitHub Actions

### Test credentials (loaded by Liquibase in dev)
| Username | Password | Roles |
|----------|----------|-------|
| `admin`  | `admin`  | ROLE_ADMIN, ROLE_USER |
| `user`   | `user`   | ROLE_USER |

## Deployment

CI/CD runs on GitHub Actions (`.github/workflows/deploy.yml`):
1. `./gradlew test bootJar sonar` — tests + SonarQube
2. `./gradlew bootBuildImage` — push Docker image to Docker Hub (`feurle/tg-app`)
   - `trunk` branch → tag `latest` → deployed to production
   - feature branches → tag `snapshot` → deployed to staging
3. SSH deploy using `prod-compose.yml` or `test-compose.yml` in `src/main/docker/`

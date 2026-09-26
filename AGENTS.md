# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

**Keep this file current:** whenever a change is structural (new module, new frontend feature folder, changed build/deploy process, new seed data, etc.), update `AGENTS.md`, (and `frontend/README.md` and `README.md` where relevant) in the same change/PR. Stale docs here are worse than no docs.

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
The frontend lives in [`frontend/`](frontend/) (see the "Frontend" section below for its architecture). For full-stack development:
- Terminal 1: `./gradlew bootRun` → backend on `http://localhost:8080`
- Terminal 2: `cd frontend && npm run dev` → frontend on `http://localhost:5173`

Vite proxies `/api/*` to the backend, so no CORS issues in dev.

Alternatively, `./gradlew devAll` starts both backend and frontend dev server
in parallel in one terminal (`Ctrl+C` stops both).

### Frontend
```bash
cd frontend
npm run dev      # Start dev server (Vite, port 5173)
npm run build    # Type-check + production build (tsc -b && vite build)
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test runner is configured yet.

React 19 + TypeScript + Vite, under `frontend/`. Talks to this backend exclusively through `frontend/src/lib/apiClient.ts` (cookie-session fetch wrapper). See the "Frontend" section below for its project structure, routing, auth, and i18n conventions.

## Architecture

This is a **Spring Modulith** (modular monolith) backend. Module boundaries are enforced by the framework — avoid cross-module direct dependencies (use Spring events or exposed interfaces instead).

### Domain modules under `com.feurle.tg`:

**`webcontent`** — Article, Image, Tag management
- Articles have multilingual content (DE, EN, SV, RU), states (`CREATED`, `PUBLISHED`, `CLOSED`), and a `PageType`
- Images are linked to articles

**`user`** — Authentication and user management
- Spring Security form-based, session-based auth (no JWT)
- `AppUserDetailsService` integrates with Spring Security
- Roles: `ROLE_ADMIN`, `ROLE_USER`

**`customer`** — Customer data

**`contact`** — Public "send message" / "request appointment" forms (`ContactController`, `ContactMessageService`)

**`questionnaire`** — Pet owner questionnaire submissions (`Questionnaire`, `PetDetails`, `OwnerDetails`); publishes a `QuestionnaireSubmittedEvent`

**`vetinfo`** — Vet office info and opening hours (`VetInfo`, `OfficeHour`); exposes `PrimaryContactEmailLookup` for other modules

**`notification`** — Outbound email (`MailService`), reacts to `QuestionnaireSubmittedEvent` via `QuestionnaireNotificationListener`

**`common`** — `GlobalExceptionHandler` (shared error handling)

### Layer pattern within each module:
```
domain/         → JPA entities + repository interfaces
application/    → Service classes (business logic)
infrastructure/ → REST controllers, JPA repository impls, DTOs, mappers
```
Not every module has all three layers: `common` and `notification` have no `domain/`, `contact` has no `domain/`, and `notification` has no `infrastructure/` (no persistence, no REST surface).

### Database
- **Dev profile:** H2 in-memory, H2 console at `http://localhost:8080/h2-console`
- **Prod/Test:** MySQL 9.2 (Liquibase drops & re-migrates on deploy)
- Migrations in `src/main/resources/db/changelog/` (Liquibase YAML)
- Fake data is loaded by Liquibase in dev: ~15 articles (German only, other locales are supported by the model but not seeded), plus tags, images, pages, and users. No customer seed data exists yet.

### Profiles
- `dev` — default for local, H2, hot reload
- `prod` / `test` — MySQL, deployed via Docker Compose + SSH in GitHub Actions

### Test credentials (loaded by Liquibase in dev)
| Username | Password | Roles |
|----------|----------|-------|
| `admin`  | `admin`  | ROLE_ADMIN, ROLE_USER |
| `user`   | `user`   | ROLE_USER |

## Frontend

**Stack:** React 19, TypeScript, Vite, React Router v7, react-i18next

**Project structure (under `frontend/`):**
```
src/
├── api/                # Generated OpenAPI types (npm run generate:api, from ../api-contract/openapi.json)
├── assets/             # Static assets
├── components/         # Shared, reusable components used across features
├── features/           # Feature domains (auth, contact, customers, questionnaire, users, webcontent)
├── i18n/               # Internationalization (4 locales: de, en, sv, ru)
├── layout/             # Page layouts (PublicLayout, AppLayout)
├── lib/                # Utilities (apiClient.ts)
├── pages/
│   ├── public/         # Unauthenticated pages (rendered by PublicLayout)
│   └── protected/      # Authenticated pages (rendered by AppLayout via ProtectedRoute)
├── router/             # Routing configuration and route constants
└── styles/             # Shared styles
```

**API:** All backend calls go through [frontend/src/lib/apiClient.ts](frontend/src/lib/apiClient.ts) — a thin fetch wrapper that sends `credentials: 'include'` (cookie-based sessions). In dev, Vite proxies `/api/*` to `http://localhost:8080`. In prod, set the `VITE_API_URL` environment variable to the backend base URL (e.g., `https://api.example.com`).

**Auth:** [frontend/src/features/auth/authStore.ts](frontend/src/features/auth/authStore.ts) is a plain module-level singleton (not React context). It calls `GET /api/auth/me` on startup to restore the session. Use the `useAuth()` hook in components to read auth state.

**Routing:** Two layout tracks in [frontend/src/router/index.tsx](frontend/src/router/index.tsx):
- `PublicLayout` — wraps public pages (`/`, `/news`) for unauthenticated users
- `ProtectedRoute` — checks auth before rendering, then passes to `AppLayout` for authenticated pages (`/customers`, `/users`, `/webcontent/*`)

Route path constants live in [frontend/src/router/routes.ts](frontend/src/router/routes.ts).

**Feature structure:** Each domain lives under `frontend/src/features/<feature>/`:
- `api.ts` — API calls using `apiClient`
- `types.ts` — TypeScript types
- `components/` — feature-specific components (tables, modals, etc.)

Current features: `auth`, `contact`, `customers`, `questionnaire`, `users`, `webcontent` (articles + images).

**i18n:** Four locales (de, en, sv, ru) in [frontend/src/i18n/locales/](frontend/src/i18n/locales/). Default language is German (`de`), persisted to `localStorage` as `lang`. The backend uses enum values (`GERMAN`, `ENGLISH`, `SWEDISH`, `RUSSIAN`) — [frontend/src/features/webcontent/language.ts](frontend/src/features/webcontent/language.ts) maps between locale codes and backend enums.

## Deployment

CI/CD runs on GitHub Actions (`.github/workflows/deploy.yml`):
1. `./gradlew test bootJar sonar` — tests + SonarQube
2. `./gradlew bootBuildImage` — push Docker image to Docker Hub (`feurle/tg-app`)
   - `trunk` branch → tag `latest` → deployed to production
   - feature branches (`feature/**`, `fix/**`, `hotfix/**`, `chore/**`, `refactor/**`) → tag `snapshot` → deployed to staging
3. SSH deploy using `prod-compose.yml` or `test-compose.yml` in `src/main/docker/`
4. `.github/workflows/release.yml` runs after a successful prod deploy (backend or frontend) on `trunk`:
   - Only if `## [Unreleased]` in `CHANGELOG.md` has at least one bullet — otherwise nothing is released
   - Next version via `.github/scripts/next-version.sh` from the squash-commit subject: `feat` → minor, `!`/`BREAKING CHANGE` → major, anything else → patch (first release is `1.0.0`)
   - `cut-changelog.py` moves `[Unreleased]` into `## [x.y.z] - date`, the bot commits `chore(release): vx.y.z` to `trunk`, pushes tag `vx.y.z` and creates a GitHub Release
   - The same version is baked into the app via `APP_VERSION` (`build.gradle`, actuator `/info`) and pushed as Docker tag `feurle/tg-app:x.y.z`; non-release builds get `x.y.z-SNAPSHOT`

Because of this, every feature/fix PR must add its changelog bullet under `[Unreleased]` — that is what turns the merge into a release.

**Single-container build:** `./gradlew build` / `bootBuildImage` also builds the frontend (`npmInstall` → `buildFrontend` → `syncFrontend` Gradle tasks) and copies `frontend/dist/` into `src/main/resources/static`, so the one `feurle/tg-app` image serves both frontend and backend. There is no separate frontend Docker image anymore (see `docs/adr/0001-single-container-deployment.md`).

**`tg-admin/`** is a separate, independently built Spring Boot Admin monitoring server (its own `build.gradle`/`settings.gradle`, not part of the root Gradle build) that pushes its own `feurle/tg-admin` image. It has no corresponding GitHub Actions workflow — its build/deploy is currently manual.

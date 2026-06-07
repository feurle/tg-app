# TG App

Spring Boot backend for a veterinary content management site. Serves articles, images, pages, and customer data via a REST API consumed by the sibling frontend repo (`tg-web`).

**Stack:** Spring Boot 4.0.3 · Java 21 · Spring Modulith · Spring Security · Liquibase · H2 (dev) · MySQL 9 (test/prod)

---

## Local Development

The frontend lives in `../tg-web`. Run both together for full-stack development:

```bash
# Terminal 1 — backend on http://localhost:8080
./gradlew bootRun

# Terminal 2 — frontend on http://localhost:5173 (proxies /api to backend)
cd ../tg-web && npm run dev
```

Open **http://localhost:5173** in your browser.

- H2 console (dev only): http://localhost:8080/h2-console
- Spring Boot DevTools reloads the backend on Java file changes

---

## Commands

```bash
./gradlew bootRun              # Run with dev profile (H2, hot reload)
./gradlew test                 # Run all tests
./gradlew build                # Full build including tests
./gradlew spotlessApply        # Format code (run before committing)
./gradlew jacocoTestReport     # Generate coverage report
./gradlew bootBuildImage       # Build Docker image via Cloud Native Buildpacks
```

---

## Authentication

Form-based login with stateful sessions. Two accounts are seeded in every environment:

| Username | Password | Roles |
|----------|----------|-------|
| `admin` | `admin` | ROLE_ADMIN, ROLE_USER |
| `user` | `user` | ROLE_USER |

---

## Database & Seeding

All profiles use `drop-first: true` — the database is wiped and re-seeded on every start.

Seeding is split into three Liquibase layers:

| Context | Data | Active in |
|---------|------|-----------|
| *(none)* | Schema, users, authorities, images, tags, pages | all profiles |
| `seed` | Articles (DE), sections, article–image links | dev, test, prod, JUnit |
| `test` | Reserved for future JUnit-only fixtures | JUnit tests only |

Data files live under `src/main/resources/db/data/`.

---

## Profiles

| Profile | DB | Liquibase contexts | Used by |
|---------|----|--------------------|---------|
| `dev` | H2 in-memory | `seed` | local development |
| `test` | MySQL (`tg-database-test`) | `seed` | staging server |
| `prod` | MySQL (`tg-database`) | `seed` | production server |

---

## Deployment

CI/CD via GitHub Actions (`.github/workflows/deploy.yml`):

1. `./gradlew test bootJar sonar` — tests + SonarQube analysis
2. `./gradlew bootBuildImage` — Docker image pushed to Docker Hub (`feurle/tg-app`)
   - `trunk` → tag `latest` → deployed to production via `prod-compose.yml`
   - `feature/**` → tag `snapshot` → deployed to staging via `test-compose.yml`
3. Deployed over SSH using Docker Compose files in `src/main/docker/`

Both environments sit behind an Nginx reverse proxy with Let's Encrypt TLS.

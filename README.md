# TG App

Website and CMS for a veterinary practice: a Spring Boot backend serving articles, images, pages, customer data, contact and appointment requests, questionnaires and vet office info, with a React frontend in [`frontend/`](frontend/). Both ship as one Docker image.

**Stack:** Spring Boot 4.1.1 · Java 21 · Spring Modulith · Spring Security · Liquibase · H2 (dev) · MySQL 9 (test/prod) · React 19 + Vite

## Quick start

```bash
./gradlew devAll   # backend on :8080, frontend on :5173, Ctrl+C stops both
```

Open http://localhost:5173 and log in with `admin` / `admin`. Details: [docs/local-development.md](docs/local-development.md).

## Commands

```bash
./gradlew bootRun              # backend only (dev profile, H2, hot reload)
./gradlew test                 # all tests
./gradlew build                # full build incl. tests and frontend
./gradlew spotlessApply        # format code (run before committing)
./gradlew jacocoTestReport     # coverage report
./gradlew bootBuildImage       # Docker image via Cloud Native Buildpacks
```

Frontend commands: [frontend/README.md](frontend/README.md).

## Docs

Architecture, database, deployment and conventions are in [`docs/`](docs/). The index is [`AGENTS.md`](AGENTS.md).

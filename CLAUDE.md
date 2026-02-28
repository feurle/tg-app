# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
./gradlew build          # compile, test, package
./gradlew bootRun        # run the application
./gradlew test           # run all tests
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest"  # single test class
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest.upload_savesImageAndReturnsIt"  # single method
./gradlew clean          # clean build outputs
```

H2 Console (dev only): `http://localhost:8080/h2-console` — JDBC URL `jdbc:h2:mem:testdb`, user `sa`, no password.

## Architecture

**Spring Boot 4.0.3 · Java 21 · Spring Modulith 2.0.3**

Modules live as sub-packages of `com.feurle.tg`. Currently there is one module: `webcontent`. Each module follows **Onion Architecture** with three fixed layers:

```
{module}/
├── domain/             ← Entities + Port interfaces (no Spring, except JPA annotations)
├── application/        ← Use-case services; depend only on domain; return domain objects, never DTOs
└── infrastructure/
    ├── persistence/    ← JpaXxxRepository: extends JpaRepository<E,ID> + implements domain port
    └── rest/
        ├── dto/        ← Request/Response records
        └── *Controller ← Maps HTTP ↔ application services; owns all DTO mapping
```

**Dependency rule**: `infrastructure → application → domain`. Nothing in `domain` or `application` may import from `infrastructure`.

**Repository pattern**: Domain port interfaces (e.g. `ArticleRepository`) are plain Java interfaces in `domain/`. Spring Data implementations (`JpaArticleRepository`) live in `infrastructure/persistence/` and extend both `JpaRepository<E,ID>` and the domain interface — Spring Data generates all query implementations automatically.

**Spring Modulith**: `ApplicationModules.verify()` enforces module boundaries at test time (`WebContentModuleTests`). Do not create cross-module dependencies via direct package imports; use Spring events instead.

## Database

Schema is managed by **Liquibase** (`ddl-auto: none`). The master changelog is at `src/main/resources/db/changelog/db.changelog-master.yaml` and includes per-module changeset files under `db/changelog/{module}/`.

When adding a new entity or column: add a new numbered changeset file (e.g. `002-add-column.yaml`) and reference it from the master file. Never modify existing changesets.

The Spring Modulith `event_publication` table is not yet in the Liquibase schema — this produces a harmless `WARN` on shutdown during tests.

## Adding a New Module

1. Create package `com.feurle.tg.{module}` with the `domain/`, `application/`, `infrastructure/` sub-structure.
2. Add a Liquibase changeset file under `db/changelog/{module}/` and include it in the master changelog.
3. Spring Modulith auto-detects the module; run `WebContentModuleTests` to verify boundaries.

## Key Conventions

- **Services** receive and return domain objects. DTOs never leak into `application/` or `domain/`.
- **Controllers** extract framework-specific types (e.g. `MultipartFile`) before calling services.
- **Enums** stored as strings in DB (`@Enumerated(EnumType.STRING)`).
- Multipart upload limit: 10 MB (`spring.servlet.multipart.max-file-size`).
- Use Lombok (`@Data`, `@NoArgsConstructor`, `@RequiredArgsConstructor`) on entities and services.
- Use records for DTOs.
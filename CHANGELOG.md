# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.0.2] - 2026-09-25

### Fixed

- CI: Test- und Prod-Deploy haben sich gegenseitig den App-Container entfernt (`docker compose ... --remove-orphans` sah den jeweils anderen Container als verwaist an, sobald dessen Compose-Datei nicht mitgeladen war).

## [1.0.1] - 2026-09-25

### Added

- `./gradlew devAll` startet Backend (`bootRun`) und Frontend-Dev-Server (`npm run dev`) parallel in einem Terminal.

### Changed

- Frontend und Backend laufen jetzt in einem Container: Spring Boot baut und liefert das React-Frontend selbst aus (`docs/adr/0001-single-container-deployment.md`).
- Abhängigkeiten aktualisiert: Gradle 9.8.0, Spring Boot 4.1.1, Spring Modulith 2.1.1, Spring Boot Admin Client 4.1.3, Spotless 8.10.2, SonarQube-Plugin 7.5.0.8588; Frontend auf Vite 8, ESLint 10, i18next 26/react-i18next 17, React 19.3, react-router-dom 7.18 sowie weitere kleinere Bumps (TypeScript bleibt auf 5.x, da `typescript-eslint` TypeScript 7 noch nicht unterstützt).

### Removed

- Separates `tg-web`-Image, dessen Dockerfile/nginx-Config und den zweiten Deploy-Workflow (`frontend-deploy.yml`).

### Fixed

- CI: `docker compose up` bezieht jetzt auch `services.yml` (`tg-database`, `tg-admin`) mit ein, damit `--remove-orphans` diese Container nicht mehr fälschlich löscht und dadurch der Health Check mit 502 fehlschlägt.

### Security

- Sicherheits-Header (HSTS, `X-Content-Type-Options`, `Referrer-Policy`), die zuvor von `tg-web`s nginx gesetzt wurden, kommen jetzt von Spring Security.

## [1.0.0] - 2026-09-21

### Changed

- CI: Deployment kann jetzt zusätzlich manuell über "Run workflow" in GitHub Actions angestoßen werden (workflow_dispatch).
- CI: Automatisches Deployment auf TEST greift jetzt auch für `fix/**`, `hotfix/**`, `chore/**` und `refactor/**` Branches, nicht mehr nur für `feature/**`.
- CI: Nach jedem erfolgreichen Prod-Deploy wird automatisch ein SemVer-Tag gesetzt, das Changelog in eine datierte Version überführt und ein GitHub Release erstellt. Die App-Version (Actuator `/info`, Docker-Image-Tag) folgt derselben Nummer.

[Unreleased]: https://github.com/feurle/tg-app/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/feurle/tg-app/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/feurle/tg-app/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/feurle/tg-app/releases/tag/v1.0.0

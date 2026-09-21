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

## [1.0.0] - 2026-09-21

### Changed

- CI: Deployment kann jetzt zusätzlich manuell über "Run workflow" in GitHub Actions angestoßen werden (workflow_dispatch).
- CI: Automatisches Deployment auf TEST greift jetzt auch für `fix/**`, `hotfix/**`, `chore/**` und `refactor/**` Branches, nicht mehr nur für `feature/**`.
- CI: Nach jedem erfolgreichen Prod-Deploy wird automatisch ein SemVer-Tag gesetzt, das Changelog in eine datierte Version überführt und ein GitHub Release erstellt. Die App-Version (Actuator `/info`, Docker-Image-Tag) folgt derselben Nummer.

[Unreleased]: https://github.com/feurle/tg-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/feurle/tg-app/releases/tag/v1.0.0

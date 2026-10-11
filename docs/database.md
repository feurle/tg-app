# Database

## Profiles

| Profile | Database | Used by |
|---------|----------|---------|
| `dev` | H2 in-memory (H2 console at `http://localhost:8080/h2-console`) | local development |
| `test` | MySQL 9.2 | staging |
| `prod` | MySQL 9.2 | production |

## Liquibase

- Changelogs live per module in `src/main/resources/db/changelog/`, usually as
  `001-init-schema` and `002-load-initial-data`. The master file is `db.changelog-master.yaml`.
- Seed data is CSV under `src/main/resources/db/data/` (images in `db/data/blob/`).
- Contexts:

| Context | Data | Active in |
|---------|------|-----------|
| *(none)* | schema, users, authorities, images, tags, pages | all profiles |
| `seed` | articles (DE only), sections incl. optional image, article-image links | dev, test, prod, JUnit |
| `test` | reserved for future JUnit-only fixtures | JUnit only |

- There is no customer seed data yet.
- Other locales (EN, SV, RU) are supported by the model but not seeded.

## Pre-launch rules (until go-live)

The site is not live yet, but production is deployed from `trunk`. Until go-live:

- All profiles use `drop-first`: the database is wiped and re-seeded on every start.
- Production is re-seeded from the CSV files on every deploy. Manual changes made in
  production are lost on the next deploy, so content changes go through the CSV files.
- Edit the existing changesets (`001-init-schema`, `002-load-initial-data`) in place.
  Do not add new changesets.

**After go-live:** `drop-first` is switched off. From then on, every schema or data
change needs its own new changeset, and existing changesets must not be edited.

## Test credentials

Seeded in every environment:

| Username | Password | Roles |
|----------|----------|-------|
| `admin` | `admin` | ROLE_ADMIN, ROLE_USER |
| `user` | `user` | ROLE_USER |

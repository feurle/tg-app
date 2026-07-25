# tg-app — Technical Debt Audit

Date: 2026-07-05 · Scope: Spring Modulith backend (98 main classes, 20 test classes)

Priority = (Impact + Risk) × (6 − Effort), each scored 1–5.

## Prioritized findings

| # | Item | Category | Impact | Risk | Effort | Priority |
|---|------|----------|--------|------|--------|----------|
| 1 | **Prod DB wiped on every deploy** — `application.yaml` prod profile sets `liquibase.drop-first: true` with `contexts: seed`. Every production deploy drops the schema and reloads fake seed data, including the `admin/admin` and `user/user` credentials from `db/data/user.csv`. | Infrastructure | 5 | 5 | 1 | **50** |
| 2 | **Sensitive actuator endpoints exposed in prod/test** — `heapdump`, `env`, `beans`, `loggers`, `threaddump` are web-exposed. Heap dumps leak session tokens and the SMTP/admin passwords from `.env`. | Infrastructure | 3 | 5 | 1 | **40** |
| 3 | **H2 + H2 console on the prod classpath** — `spring-boot-h2console` and `h2` are unconditional dependencies. Attack surface and jar bloat in prod. Move to `developmentOnly`/dev profile. | Dependency | 2 | 3 | 1 | **25** |
| 4 | **Prod/test connect as MySQL `root`** — no least-privilege DB user; one SQL injection or leaked credential means full server compromise. | Infrastructure | 2 | 4 | 2 | **24** |
| 5 | **No `ArticleServiceTest`** — `ArticleService` (142 lines, core domain: multilingual articles, state machine CREATED→PUBLISHED→CLOSED) has no unit test. Image/Tag/User/Customer/Contact services all have them. | Test | 3 | 3 | 2 | **24** |
| 6 | **`WebContentController` is a god controller** — 247 lines, ~2× the next largest; handles articles, images, and tags in one class while the module already separates those concerns elsewhere. | Code | 2 | 2 | 3 | **12** |
| 7 | **Stale TODO** — `ArticleType.java:5` "refactor this to articleType"; naming drift between enum and usage. | Code | 1 | 1 | 1 | **10** |
| 8 | **Migration-ordering fix documented only in TODO.md** — the page_id/skip-column workaround (002 vs 003 ordering) lives as pasted session notes, not in `docs/`. Tribal knowledge. | Documentation | 2 | 2 | 1 | **20** |

## Phased remediation plan

**Phase 1 — this week (config-only, no code changes)**
- Remove `drop-first: true` and `contexts: seed` from prod and test profiles (#1). Verify Liquibase runs incrementally against a MySQL snapshot before the next deploy.
- Trim actuator exposure in prod/test to `health,info,metrics,modulith` (#2).
- Move H2/H2-console to dev-only scope (#3).

**Phase 2 — next sprint (alongside feature work)**
- Create a least-privilege MySQL user for prod/test; drop root (#4).
- Add `ArticleServiceTest` covering state transitions and the 4-language content paths (#5). Check JaCoCo report for other gaps while at it.
- Move the migration-ordering explanation from TODO.md into `docs/` (#8).

**Phase 3 — opportunistic**
- Split `WebContentController` into Article/Image/Tag controllers when next touching the module (#6); Spring Modulith boundaries make this low-risk.
- Resolve or delete the `ArticleType` TODO (#7).

## Business justification (top 3)
1. **#1 is a data-loss time bomb**: once real customer/questionnaire data exists in prod, the very next deploy destroys it — and restores well-known admin credentials. Fix is one YAML edit.
2. **#2/#3/#4 compound**: exposed heapdump + root DB access + H2 console turn any single foothold into full compromise. All are config-level fixes.
3. **#5 protects the core domain**: articles are the product; the publish state machine is untested, so regressions ship silently.

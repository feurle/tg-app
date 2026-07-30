# CTA as an editable content block

**Date:** 2026-07-30
**Status:** Approved design, ready for implementation planning
**Repos:** `tg-app` (backend), `tg-web` (frontend)

## Problem

The call-to-action section is hardcoded in the frontend in six places:

| File | Line |
|---|---|
| `tg-web/src/features/webcontent/components/PublicPage.tsx` | 59–64 |
| `tg-web/src/pages/public/AboutPage.tsx` | 89 |
| `tg-web/src/pages/public/NewsPage.tsx` | 63 |
| `tg-web/src/pages/public/ForVetsPage.tsx` | 85 |
| `tg-web/src/pages/public/ForPetOwnersPage.tsx` | 87, 94 |

Its text comes from i18n JSON files, not the database. An editor cannot add, remove, reword, or reposition a CTA without a code change and a deploy.

A second problem enables the first: `PublicPage`, `AboutPage`, `ForVetsPage` and `ForPetOwnersPage` each contain a near-identical copy of the same fetch-and-dispatch loop — same `getPublishedByPage` call, same `HERO`/`COL2`/`COL3`/`COL4`/`TEXT` switch. There is no single place to register a block type, so any new block must be added five times.

## Goal

A CTA becomes a content block an editor adds to any page through the existing maintenance interface — positioned, translated, published and unpublished like any other block. After this work, a CTA appears on a page only because someone put it there.

Success: the five public pages look identical to today, but every CTA on them is a database row.

## Decisions

| Question | Decision |
|---|---|
| Shared or per-page content | Per-page blocks, with a copy action for reuse |
| Editing form | Headline + text + up to two optional buttons |
| Placement | Freely positioned in the page's content flow via existing sort order |
| Refactor scope | Extract one shared block renderer; leave text-block variants alone |
| Template flag | Not built — the copy action covers it |
| Frontend test framework | Not introduced as part of this work |

## Data model

A new `ArticleType` value, `CTA`. **No database schema change.**

This follows the existing idiom: `Col3Component` already stores its repeated parts as `sections`, where `section.title` is the card heading and `section.content` the body. A CTA's buttons use the same shape.

| CTA element | Stored as |
|---|---|
| Headline | `article.title` — optional, rendered only when non-empty |
| Text / tagline | `article.content` |
| Button 1 | first `section`: `title` = label, `content` = target |
| Button 2 | second `section`: same |
| Position on page | `article.order` |
| Page | `article.page` |
| Language | `article.language` |
| Draft vs. live | `article.state` |

`CreateArticleRequest.title` has no `@NotBlank`, so a headline-less CTA is already valid.

### Button targets

Plain strings; the kind is inferred from the value:

| Value | Meaning | Rendered as |
|---|---|---|
| `contact:appointment`, `contact:message` | Existing contact actions | Button with current `ContactButton` behaviour |
| `/…` | Internal route | React Router `<Link>` |
| `http://…`, `https://…` | External link | `<a rel="noopener noreferrer">` |

The renderer uses at most the first two sections and ignores extras.

**Known trade-off:** "section = button" is a convention, not a schema constraint. The CTA-aware admin form (below) keeps editors from having to know it, but nothing at the database level enforces it.

## Rendering (`tg-web`)

### New: `PageBlocks`

`tg-web/src/features/webcontent/components/PageBlocks.tsx` owns what the pages currently duplicate: the `getPublishedByPage` fetch, language resolution, loading skeleton, and block dispatch.

```tsx
<PageBlocks pageSlug="about" textBlock={AboutTextBlock} />
```

Single registry:

| `articleType` | Component |
|---|---|
| `HERO` | `HeroComponent` |
| `COL2` / `COL3` / `COL4` | `Col2Component` / `Col3Component` / `Col4Component` |
| `TEXT` | the page's `textBlock` prop |
| `CTA` | `CtaComponent` |
| anything else | not rendered |

The `textBlock` prop lets `AboutPage` keep `AboutTextBlock` while other pages use `TextBlock`, keeping this refactor out of the text-block styling question. Pages keep their own hero headers and wrappers; only the content loop moves.

**Side effect, intended:** a single registry means every page supports every block type. `PublicPage` (home) currently ignores `COL2` while `AboutPage` renders it; afterwards home renders `COL2` too. No existing content changes appearance, because no home-page article has type `COL2` today — but an editor could now add one.

`NewsPage` has the fetch but no dispatch — it moves to `PageBlocks` for its CTA, with its news-row rendering untouched.

### New: `CtaComponent`

Renders the existing markup — `div.cta-section`, `p.cta-tagline`, `div.hero-actions` — from article data instead of i18n keys. No CSS changes; `tg-web/src/styles/global.css:828` already styles it.

- Headline renders as `h2.cta-title` only when `article.title` is non-empty, reproducing today's headline-less contact CTA.
- First button gets `btn-primary`, second `btn-secondary`, matching the current contact CTA.
- Content passes through `DOMPurify.sanitize`, as every other block does.

### Removals

The hardcoded blocks at the six locations listed under Problem. The `questionnaire-cta` CSS variant stays available but nothing hardcodes it.

## Maintenance UI (`tg-web`)

Adding a CTA uses the existing `ArticlesPage`: **New article → type `CTA` → headline and text → add up to two buttons → publish.** No new screen. Three changes:

1. **Register the type** — add `CTA` to the `ArticleType` union in `tg-web/src/features/webcontent/types.ts:2`, to the dropdown source behind `ArticleFormModal.tsx:126`, and add an `article.pageType.CTA` label to all four locale files.

2. **CTA-aware `SectionFormModal`** — when the parent article's type is `CTA`, the two generic fields relabel to **Button label** and **Button target**. The target field becomes a kind selector (*Contact action* / *Internal page* / *External URL*) plus a value input: *Contact action* offers the two known actions, *Internal page* offers known app routes, *External URL* is free text validated to start with `http`. It writes the same `section.content` string defined above. The generic editor is unchanged for `COL3`/`COL4`/`TEXT`; the relabelling keys off article type only.

3. **Cap and label the button list** — on a `CTA` article, `ArticlesPage` shows sections as "Buttons" and hides *Add* once two exist.

## Reuse: copy action (`tg-app` + `tg-web`)

Reuse is a copy, not a shared entity.

**Endpoint:** `POST /api/webcontent/articles/{id}/copy`, body `{ pageIds: [...], languages: [...] }`. Deep-copies the article and its sections onto each page × language combination, appended at the end of each target's order, always in state `CREATED` so nothing goes live unreviewed. Admin-only. Returns `201` with the list of created articles as `ArticleResponse`. Copying onto the source article's own page and language is allowed and produces a draft duplicate. It is generic — it works for `HERO` or `COL3` as well as `CTA` — which is why it belongs on the article resource rather than in CTA-specific code.

**Admin:** a *Copy to pages…* action on any article row opens a dialog with a page checklist (plus *select all*) and a language checklist defaulting to the source article's language.

**No template flag.** It would require a schema change, an admin-list filter, and a rule for what happens to copies when the template changes, while buying nothing the copy action does not — copies are independent either way. A genuine "edit once, updates everywhere" CTA is a shared-content model and deserves its own design.

## Migration (`tg-app`)

New Liquibase changeset `src/main/resources/db/changelog/webcontent/003-load-cta-articles.yaml` — **data only, no schema**.

Verified inventory of what is hardcoded today:

| Page | CTA | Headline | Text | Buttons |
|---|---|---|---|---|
| `home` | contact | — | `home.contact.sub` | appointment + message |
| `about` | contact | — | — | appointment + message |
| `news` | contact | — | — | appointment + message |
| `for-vets` | contact | — | — | appointment + message |
| `for-pet-owners` | questionnaire | `questionnaire.cta.title` | `questionnaire.cta.text` | `questionnaire.cta.button` → `/questionnaire` |
| `for-pet-owners` | contact | — | — | appointment + message |

Six CTAs × four languages = **24 articles**, seeded `PUBLISHED`, ordered last on their page to match current position. On `for-pet-owners` the questionnaire CTA precedes the contact CTA. Button labels come from `contact.appointment` / `contact.message`, which exist in all four languages, with targets `contact:appointment` and `contact:message`.

**Swedish and Russian gap:** `home.contact.sub` has no `sv` or `ru` translation. Those seed rows get an empty text field, which renders exactly as today — the tagline is already missing there — but becomes a visible empty field in maintenance. Translations are not invented as part of this work.

**Deploy order.** The seed must land and run before the frontend drops its hardcoded CTAs, or there is a window with no CTA on any page. Backend and frontend deploy separately, so: backend seed first, verified in staging, then the frontend change.

**i18n keys stay.** `home.contact.sub` and `questionnaire.cta.*` become unread by public pages; `contact.*` is still used elsewhere. Removing dead keys is separate cleanup.

## Security

Button targets are editor-supplied strings that reach an `href`. A `javascript:` target would be an XSS vector, and `DOMPurify` does not help because these are not rendered as HTML.

Targets are validated **on save** (backend, in the section service, when the parent article is `CTA`) and re-checked **on render**. Allowed: `contact:appointment`, `contact:message`, values starting with `/`, and `http://` or `https://` URLs. Everything else is rejected.

## Testing

**Backend** — follows the existing split, unit tests beside services and `*IT` for REST:

- `ArticleCopyServiceTest` — sections deep-copied not shared; copies in state `CREATED`; order appends per target; one source fans out across multiple pages × languages.
- `WebContentControllerIT` — copy endpoint success; unknown page id → 404; empty `pageIds` → 400; admin-only authorization.
- Target validation — rejects `javascript:` and other disallowed schemes on save.
- Seed assertion — every page slug has a published `CTA` article in each of the four languages, so a broken migration fails the build rather than emptying the live site.
- `WebContentModuleTests` (Spring Modulith boundaries) stays green; this design adds nothing cross-module.

**Frontend** — no test runner exists (`package.json` has only `dev`, `build`, `lint`, `preview`). Verification is `npm run build` (`tsc -b`), `npm run lint`, and runtime checking via the project's `verify` skill: start both services, confirm each of the five pages renders its CTA, contact buttons behave as before, and the questionnaire link navigates. Before/after screenshots per page are the regression check, since the goal is that **nothing visibly changes** while the content source moves from code to database.

Introducing a frontend test framework is out of scope — a real gap, but its own decision with its own conventions, and bundling it here would double the size of the change.

## Out of scope

- Shared "edit once, updates everywhere" CTAs
- Consolidating `AboutTextBlock` / `TextBlock` / `ArticleBlock`
- Removing now-dead i18n keys
- Swedish and Russian translations for the home tagline
- Adopting a frontend test framework

# tg-app Frontend

React 19 + TypeScript + Vite + React Router v7 + react-i18next. Talks to the Spring Boot backend only through `src/lib/apiClient.ts` (cookie sessions). Conventions for routing, auth and i18n: see [`../docs/frontend.md`](../docs/frontend.md).

## Commands

```bash
npm run dev           # Vite dev server on :5173, proxies /api to :8080
npm run build         # tsc -b && vite build
npm run lint          # ESLint
npm run generate:api  # OpenAPI types into src/api (gitignored)
```

No test runner is configured. `./gradlew build` builds this app and copies `dist/` into the Spring Boot static resources.

## Structure

```
src/
├── components/   shared components (RichTextEditor, ConfirmDialog, PageSkeleton, ...)
├── features/     auth, contact, customers, questionnaire, users, webcontent
├── i18n/         locales de (default), en, sv, ru
├── layout/       PublicLayout (Navbar, Footer), AppLayout (Sidebar)
├── pages/        public/ and protected/ route components
├── router/       routes.ts (path constants) and index.tsx
└── styles/       variables.css (design tokens), global.css
```

## Routes

| Public | Content |
|---|---|
| `/` | CMS page `home` plus contact block |
| `/treatments`, `/for-vets`, `/about`, `/news` | CMS pages `treatments`, `for-vets`, `about`, `news` |
| `/privacy`, `/impress` | CMS pages `privacy`, `imprint` |
| `/questionnaire`, `/appointment`, `/message`, `/contact` | Questionnaire, appointment request and message forms, contact data |

Admin (login required): `/customers`, `/users`, `/questionnaires`, `/contact-info`, `/webcontent/images`, `/webcontent/tags`, `/webcontent/page/:slug` (articles of any CMS page) and `/webcontent/page/:slug/preview?lang=de` (page preview incl. drafts). Writing CMS content needs `ROLE_ADMIN`.

## CMS article types

`features/webcontent/components/PageBlocks.tsx` renders one component per `ArticleType`. The types are defined in `features/webcontent/blockTypes.ts` (mirrors the backend enum `ArticleType.java`). See [`../docs/webcontent.md`](../docs/webcontent.md).

## Design

Tokens (colour, type scale, spacing, radius) live in `src/styles/variables.css`; direction and rules are in [`../docs/ui-design.md`](../docs/ui-design.md). Figtree is self-hosted via `@fontsource-variable/figtree`.

# Webcontent (articles and CMS pages)

- Articles have multilingual content (DE, EN, SV, RU) and a state: `CREATED`, `PUBLISHED`
  or `CLOSED`.
- An article's `ArticleType` selects the frontend component. The backend enum is
  `webcontent/domain/enumeration/ArticleType.java`, and the frontend mirror is
  `frontend/src/features/webcontent/blockTypes.ts`. Keep both in sync. The list of types is
  not maintained in the docs.
- Frontend rendering: `features/webcontent/components/PageBlocks.tsx` has one component per
  type. An article with a null or unhandled type renders nothing, without an error. If a
  page looks empty, check the article's type first.
- Images are linked to articles. Sections of a `METHODS` article can carry one optional image
  (`section.image_id`).

## Access

- Write endpoints under `/api/webcontent` require `ROLE_ADMIN` (`@PreAuthorize`).
- Public reads: `/published` endpoints, `GET /api/webcontent/pages/{slug}` and image downloads.
  The page list (`/pages`) is not public.
- Admin preview of a page: `/webcontent/page/:slug/preview`.

## Frontend page content

- CMS pages are rendered with `features/webcontent/components/PageContent`, which handles the
  loading state and the German fallback hint. Data comes from the hook
  `usePublishedArticles(slug)`.
- If a page has no articles in the visitor's language, the German articles are shown.

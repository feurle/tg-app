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

## Images

- Stored as `LONGBLOB` in the `image` table and served by `GET /api/webcontent/images/{id}/download`
  with the stored MIME type.
- The download is cached for a year (`Cache-Control: public, max-age=31536000, immutable`). This
  is safe because the bytes behind an id never change: `PUT /images/{id}` only updates the title.
  A different photo is a new upload with a new id.
- `ImageService` accepts only `image/jpeg`, `image/png` and `image/webp`. SVG and anything else
  is rejected with `400`, because the file would be served from our own origin.
- The admin upload (`ImagesPage`) passes the file through `features/webcontent/prepareImageUpload.ts`
  first: images larger than 1600 px on the longest edge are scaled down, photos are saved as JPEG
  (quality 0.82), PNGs with transparency stay PNG. The original is kept if the result would not be
  smaller. The backend limit of 10 MB (`spring.servlet.multipart`) still applies.
- Public components: the hero images (`HeroComponent`, `HeroPortraitComponent`) load with
  `fetchPriority="high"`. Images further down use `loading="lazy"`. `Col2Component` loads
  eagerly because it is the first image on `/about`.

## Call to action (`CTA`)

- A `CTA` article is a block with an optional headline (`title`), an optional text (`content`)
  and up to two buttons. Each button is a section: `section.title` is the label and
  `section.content` the target. With a headline the CTA gets the accent look
  (`questionnaire-cta`), without one it is the plain contact CTA.
- Allowed targets: `contact:appointment`, `contact:message`, `contact:referral` (the referral form
  `/referral`), an internal path starting with `/`
  (not `//`), or an `http(s)://` URL. `SectionService` rejects anything else on save and
  `features/webcontent/ctaTarget.ts` re-checks on render, because the value ends up in an `href`.
- Pages do not hard-code a CTA. Home, news, about, treatments, for-vets and contact each have a
  seeded CTA article. `NewsPage` filters CTAs out of the news list and renders them as blocks.
  The seeded buttons are „Termin anfragen“ and „Nachricht schreiben“; on for-vets the first one
  is „Patienten überweisen“ (`contact:referral`).

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

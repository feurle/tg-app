# Frontend conventions

Commands, folder structure and the route table are in [`frontend/README.md`](../frontend/README.md).
This file covers the conventions behind them.

## API access

- All backend calls go through `frontend/src/lib/apiClient.ts`, a thin fetch wrapper that sends
  `credentials: 'include'` (cookie sessions).
- Dev: the Vite dev server proxies `/api/*` to `http://localhost:8080` (`SERVER_PORT` overrides the port).
- Prod: the frontend is served by the backend from the same container and calls relative
  `/api`. Do not set `VITE_API_URL` for any environment.
- Frontend and API share one origin in both setups, so no CORS configuration is needed.

## Auth

- `frontend/src/features/auth/authStore.ts` is a plain module-level singleton, not a React
  context. It calls `GET /api/auth/me` on startup to restore the session.
- Read auth state in components with the `useAuth()` hook. It reads the store with
  `useSyncExternalStore`; do not switch back to `useState` plus a subscription in `useEffect`,
  which misses a change that happens between render and effect (#151).
- Login is `POST /api/auth/login` with JSON. Form login is disabled.
- `ProtectedRoute` renders nothing while `/api/auth/me` is pending and redirects to `/` when the
  user is not logged in. A protected page that stays blank therefore means the auth state never
  arrived, not a missing cookie.

## Routing

- Two layout tracks in `frontend/src/router/index.tsx`: `PublicLayout` for public pages and
  `ProtectedRoute` (checks auth, then renders `AppLayout`) for admin pages.
- The admin track is code-split: `AppLayout` and every admin page use the route's `lazy` property,
  so the public bundle does not contain them or the Tiptap editor (#151). Import admin pages only
  from the router, never from public code, or they end up in the public bundle again. On a direct
  visit or reload of an admin URL the root route shows `PageSkeleton` (`hydrateFallbackElement`)
  until the chunk is loaded.
- Both tracks sit under a pathless root route (`RootLayout`) that renders `<ScrollRestoration />`:
  new navigations start at the top, Back/Forward restores the position. Search-param changes that
  should keep the position pass `preventScrollReset`.
- `usePublishedArticles` keeps the last result per page and language in a module-level cache and
  refetches on every mount. A page you come back to is therefore full height on the first render,
  which `ScrollRestoration` needs: restoring against the short loading skeleton clamps the position.
- Route path constants live in `frontend/src/router/routes.ts`.
- `/for-pet-owners` redirects to `/treatments`.

## Public forms

- Questionnaire, appointment (`/appointment`), message (`/message`) and referral (`/referral`) are
  pages, not modals. Buttons in the nav and contact area are plain links; the call to action on
  content pages is a `CTA` article (see [webcontent.md](webcontent.md)).
- `/for-vets` is an information page without a form: title, subtitle and a fixed button
  „Patienten überweisen“ to `/referral`, then the CMS page `for-vets`.
- On `/appointment` and `/referral` the mobile CTA bar shows only the call button. On `/for-vets` it shows „Patienten überweisen“ (→ `/referral`) instead of „Termin anfragen“.
- All four share `components/form/`: `FormPage` (title, intro, frame), `FormSection` (fieldset
  card), `TextField`, `TextAreaField`, `ChoiceGroup`, `YesNo` and `FormSuccess` (confirmation card
  that takes focus). Styling is the `.form-*` classes in `global.css`.
- Spam trap: every form includes `HoneypotField`.
- Rate limit: the backend allows 5 submissions per address in 10 minutes and answers `429` with
  `Retry-After`. `ApiError.retryAfterSeconds` carries the header, `retryAfterMinutes()` in
  `components/form/rateLimit.ts` turns it into the wait time, and the forms show `form.rateLimited`
  (or `form.rateLimitedWithPhone`) instead of the generic error.

## Feature folders

Each domain lives in `frontend/src/features/<feature>/`, with `api.ts`, `types.ts` and
`components/`.

Known deviation: `features/webcontent/api.ts` builds the image download URL and the multipart
upload with its own `BASE_URL` (from `VITE_API_URL`, empty by default) instead of `apiClient.ts`.
New code should use `apiClient.ts`.

## Tests

Vitest with jsdom and React Testing Library, run with `npm test`. Put logic without UI in plain
`*.test.ts` files next to the module (`officeHours.ts`, `apiClient.ts`); use Testing Library only for
components. Pass a fixed `Date` to time-dependent logic instead of faking the clock where possible.
CI runs the tests after the lint step. Runtime checks in the browser still follow
[verification.md](verification.md).

## Supported browsers

- The build target is set in `frontend/vite.config.ts` (`BUILD_TARGET`): Chrome/Edge/Firefox 90,
  Safari and iOS 15. Vite's default would start at Safari/iOS 16.4, and older iPads often stay on
  iOS 15.
- The target only covers syntax. Newer browser APIs are not polyfilled, so check
  [caniuse](https://caniuse.com) against Safari 15 before using one on public pages.
- Do not use regex lookbehind (`(?<=…)`, `(?<!…)`). It cannot be transpiled, and Safari before
  16.4 fails on it. The `no-regex-lookbehind` plugin in `vite.config.ts` fails the build when any
  chunk contains one, including chunks from dependencies (#148).

## Design

Design tokens are in `frontend/src/styles/variables.css`. Direction and rules are in
[ui-design.md](ui-design.md).

## i18n

- Four locales in `frontend/src/i18n/locales/`: `de` (default), `en`, `sv`, `ru`.
- The default language is German. The choice is persisted in `localStorage` under `lang`.
- The backend uses enum values (`GERMAN`, `ENGLISH`, `SWEDISH`, `RUSSIAN`).
  `frontend/src/features/webcontent/language.ts` maps between locale codes and these enums.

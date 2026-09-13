# Navbar Logo Claim + Nav Link Sizing

## Goal
Add a small tagline ("claim") under the logo lockup in the navbar, and rebalance
navbar text sizes now that the bar is taller.

## Changes

### 1. Markup — `src/layout/Navbar.tsx`
Wrap the existing logo image + app name in a new `.nav-logo-main` row, and add a
`.nav-logo-claim` line below it, both still inside the existing `.nav-logo`
`NavLink` anchor:

```jsx
<NavLink to={ROUTES.HOME} className="nav-logo">
  <span className="nav-logo-main">
    <img src={logoImg} alt="Tier Gesund" className="nav-logo-img" width="44" height="44" />
    {t('app.name')}
  </span>
  <span className="nav-logo-claim">{t('app.claim')}</span>
</NavLink>
```

### 2. i18n — `src/i18n/locales/{de,en,sv,ru}.json`
Add `app.claim` to all four locale files, same German text in every locale
(the claim is treated as a fixed brand mark, not translated):

```json
"app": {
  "name": "...",
  "claim": "Ganzheitlich-integrative Tiermedizin"
}
```

### 3. CSS — `src/styles/global.css`

- `.navbar`: height `72px` → `90px` (room for the 70px logo image plus the
  claim line below it, without shrinking the logo).
- `.nav-logo`: change from a single flex row to a column:
  `flex-direction: column; align-items: flex-start; gap: 2px;`
- `.nav-logo-main` (new class): takes over the row styles previously on
  `.nav-logo` — `display: flex; align-items: center; gap: 10px;`
- `.nav-logo-claim` (new class):
  ```css
  .nav-logo-claim {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 400;
      font-style: normal;
      color: #7A6E62;
      letter-spacing: 0.3px;
      white-space: nowrap;
  }
  ```
- `.nav-link`: font-size `14px` → `20px`.
- `.nav-login-link`: font-size `14px` → `20px`.

No separate mobile override is needed for the claim — since the logo image
size is unchanged, raising the base `.navbar` height applies uniformly across
breakpoints, so the claim stays visible on mobile as well as desktop.

### 4. Mobile-nav breakpoint fix (found during verification)
The larger 20px `.nav-link` text made the nav-links row wide enough that, in
the roughly 769–1200px range, the logo column got squeezed and "Tier.
Gesund." wrapped onto two lines. Fix: raise the breakpoint that switches to
the mobile hamburger nav from `max-width: 768px` to `max-width: 1240px` (split
out of the shared media query that previously also held unrelated footer
rules, which stay at `768px`).

## Verification
Run the dev server and check both desktop and mobile widths (particularly
≤768px and ≤480px):
- Two-line logo lockup renders correctly (image + name on top, claim below).
- Larger (20px) nav-link text does not overflow or wrap awkwardly in the
  `1fr auto 1fr` navbar grid.
- Nothing clips or wraps unexpectedly at narrow widths.

## Out of scope
- Translating the claim text into EN/SV/RU (using German everywhere for now).
- Any changes to the mobile overlay menu (`.mobile-overlay-links`) — those are
  unaffected by this change.

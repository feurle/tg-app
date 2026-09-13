# Navbar "Requests" Dropdown

## Goal
Replace the two standalone top-level nav items "For Pet Owners" and "For Vets"
with a single "Anfragen" (Requests) dropdown item, placed after "About" in the
nav order. Existing pages/routes for pet owners and vets are unchanged — only
their entry point in the nav changes.

## Nav order
Before: Home, For Pet Owners, For Vets, News, About, [Administration]
After:  Home, News, About, **Anfragen** (dropdown), [Administration]

## Desktop — `src/layout/Navbar.tsx`
Remove the two standalone `NavLink`s for `ROUTES.FOR_PET_OWNERS` /
`ROUTES.FOR_VETS` from `.nav-links`. Add a dropdown between "About" and the
conditional "Administration" link, modeled on the existing language-switcher
dropdown in `src/layout/Footer.tsx` (click-to-toggle, `useRef` + `mousedown`
listener to close on outside click):

```jsx
const location = useLocation();
const [showRequests, setShowRequests] = useState(false);
const requestsRef = useRef<HTMLDivElement>(null);
const isRequestsActive = [ROUTES.FOR_PET_OWNERS, ROUTES.FOR_VETS].includes(location.pathname);

useEffect(() => {
  if (!showRequests) return;
  function handleClickOutside(e: MouseEvent) {
    if (requestsRef.current && !requestsRef.current.contains(e.target as Node)) {
      setShowRequests(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showRequests]);
```

```jsx
<div className="nav-dropdown" ref={requestsRef}>
  <button
    className={`nav-dropdown-trigger${isRequestsActive ? ' active' : ''}`}
    onClick={() => setShowRequests(v => !v)}
    aria-expanded={showRequests}
  >
    {t('nav.requests')}
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
      style={{ transform: showRequests ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
      <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
  {showRequests && (
    <div className="nav-dropdown-menu">
      <NavLink className="nav-dropdown-item" to={ROUTES.FOR_PET_OWNERS} onClick={() => setShowRequests(false)}>
        {t('nav.forPetOwners')}
      </NavLink>
      <NavLink className="nav-dropdown-item" to={ROUTES.FOR_VETS} onClick={() => setShowRequests(false)}>
        {t('nav.forVets')}
      </NavLink>
    </div>
  )}
</div>
```

`Navbar.tsx` needs `useLocation` and `useRef` added to its imports.

## Mobile overlay — same file
Replace the two flat `mobile-overlay-link`s with an accordion group:

```jsx
const [mobileRequestsOpen, setMobileRequestsOpen] = useState(false);
```

```jsx
<div className="mobile-overlay-group">
  <button
    className="mobile-overlay-group-trigger"
    onClick={() => setMobileRequestsOpen(v => !v)}
    aria-expanded={mobileRequestsOpen}
  >
    {t('nav.requests')}
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
      style={{ transform: mobileRequestsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
      <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
  {mobileRequestsOpen && (
    <div className="mobile-overlay-subitems">
      <NavLink className="mobile-overlay-sublink" to={ROUTES.FOR_PET_OWNERS} onClick={() => setMenuOpen(false)}>
        {t('nav.forPetOwners')}
      </NavLink>
      <NavLink className="mobile-overlay-sublink" to={ROUTES.FOR_VETS} onClick={() => setMenuOpen(false)}>
        {t('nav.forVets')}
      </NavLink>
    </div>
  )}
</div>
```

## i18n — `src/i18n/locales/{de,en,sv,ru}.json`
Add `nav.requests`:
- `de`: "Anfragen"
- `en`: "Requests"
- `sv`: "Förfrågningar"
- `ru`: "Заявки"

## CSS — `src/styles/global.css`
Modeled on the existing `.footer-lang-*` rules (lines ~552-616), adapted to
open downward instead of upward:

```css
.nav-dropdown {
    position: relative;
}

.nav-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 20px;
    font-weight: 400;
    font-family: inherit;
    color: #7A6E62;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease;
}

.nav-dropdown-trigger:hover {
    color: #2C2620;
}

.nav-dropdown-trigger.active {
    color: #2C2620;
    font-weight: 500;
}

.nav-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    min-width: 180px;
    z-index: 50;
    overflow: hidden;
}

.nav-dropdown-item {
    display: block;
    width: 100%;
    padding: 10px 16px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #7A6E62;
    text-decoration: none;
    transition: background 0.12s, color 0.12s;
}

.nav-dropdown-item:hover {
    background: var(--bg);
    color: #2C2620;
}

.nav-dropdown-item.active {
    color: #5B7C5D;
    font-weight: 500;
}
```

Mobile accordion (indented sub-items under `.mobile-overlay-links`):

`.mobile-overlay-link` today is `font-family: 'Lora', Georgia, serif; font-size: 34px; font-weight: 400; color: #8A7E74; padding: 10px 32px; letter-spacing: -0.3px;` with `:hover`/`.active` both switching to `color: #F0EBE3` (`.active` also adds `font-style: italic`). The group trigger reuses these values (as a `<button>` instead of a link); the sub-links reuse them too, just narrower and indented:

```css
.mobile-overlay-group-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Lora', Georgia, serif;
    font-size: 34px;
    font-weight: 400;
    color: #8A7E74;
    padding: 10px 32px;
    letter-spacing: -0.3px;
    transition: color 0.2s ease;
}

.mobile-overlay-group-trigger:hover {
    color: #F0EBE3;
}

.mobile-overlay-subitems {
    display: flex;
    flex-direction: column;
}

.mobile-overlay-sublink {
    font-family: 'Lora', Georgia, serif;
    font-size: 24px;
    font-weight: 400;
    color: #8A7E74;
    text-decoration: none;
    padding: 6px 32px 6px 48px;
    letter-spacing: -0.3px;
    transition: color 0.2s ease;
}

.mobile-overlay-sublink:hover {
    color: #F0EBE3;
}

.mobile-overlay-sublink.active {
    color: #F0EBE3;
    font-style: italic;
}
```

## Verification
- Desktop: click "Anfragen" opens the dropdown with both sub-links; clicking
  outside or selecting a sub-link closes it; visiting `/for-pet-owners` or
  `/for-vets` directly shows the trigger in its active state.
- Mobile: tapping "Anfragen" expands/collapses the two sub-links inline;
  selecting one closes the whole overlay.
- Re-check the navbar across widths (390px, 1024px, 1280px, 1717px) per the
  process established in the previous navbar-claim change — removing two
  top-level items should only reduce nav width, but confirm no regressions
  and that the 1240px mobile-nav breakpoint (set previously) is still
  appropriate; it may now be possible to lower it, but that's optional
  polish, not required for correctness.

## Out of scope
- Any change to the `/for-pet-owners` or `/for-vets` pages themselves.
- A dedicated "Requests" landing page — the trigger is dropdown-only, per
  user decision.

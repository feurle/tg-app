# Plan: Design System Migration (tg-layout-preview → App)

## Context

A design prototype (`tg-layout-preview.jsx`) was created with a complete, production-ready design system using DM Sans/DM Mono fonts, CSS custom properties, and a clean warm-white aesthetic. The running app currently uses 100% inline styles and Vite boilerplate CSS. This plan migrates that design into the app without adding any libraries.

## Goal

Migrate the CSS design tokens, component classes, layout structure, and component styling from the preview into the real application, covering: public pages (Home, News), auth (LoginModal), admin shell (Navbar, Sidebar, AppLayout), and all admin pages (Customers, Users, Articles, Images).

---

## Design Tokens (`:root`)

```css
--bg: #FAFAF8;          /* warm white page background */
--surface: #FFFFFF;     /* cards, navbar, sidebar */
--border: #E8E6E1;      /* subtle borders */
--border-strong: #D4D0C8;
--text-primary: #1A1916;
--text-secondary: #6B6860;
--text-muted: #9C9A94;
--accent: #16A34A;      /* emerald green — brand color */
--accent-light: #DCFCE7;
--accent-hover: #15803D;
--danger: #DC2626;
--danger-light: #FEE2E2;
--warning: #D97706;
--warning-light: #FEF3C7;
```

Fonts: **DM Sans** (main, weights 300/400/500/600) + **DM Mono** (accents, code, dates)

---

## Phase 1 — CSS Infrastructure

### 1.1 Add Google Fonts to `index.html`
Add `<link>` preconnect + stylesheet tags for DM Sans + DM Mono (not JS-injected).

### 1.2 Create `src/styles/variables.css`
New file — only `:root { }` custom property declarations.

### 1.3 Create `src/styles/global.css`
New file — all component-level CSS classes extracted from the preview:
buttons, navbar, footer, hero, section, article cards, app-shell, sidebar,
main content, table, badges, row actions, stats, pagination, forms/login, modal utilities.

**New utility classes (not in preview, added for app):**
```css
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 40px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
```

### 1.4 Replace `src/index.css`
```css
@import './styles/variables.css';
@import './styles/global.css';
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
a { text-decoration: none; color: inherit; }
```
**Critical:** removes `body { display: flex; place-items: center }` (Vite boilerplate that breaks layouts).

### 1.5 Remove `App.css` import from `src/App.tsx`

---

## Phase 2 — Layout Restructuring

### 2.1 `src/layout/Navbar.tsx`
- Replace all inline styles with CSS classes (`.navbar`, `.nav-logo`, `.nav-links`, `.nav-right`, `.lang-btn`)
- Use NavLink `className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}`
- **Move admin nav links out** → they go to the new Sidebar
- Public links (Home, News) remain in Navbar

### 2.2 `src/layout/Footer.tsx`
Apply `.footer`, `.footer-brand`, `.footer-copy`, `.footer-links`, `.footer-link`.

### 2.3 Create `src/layout/Sidebar.tsx` *(new)*
- Sections: "Verwaltung" (Kunden, Benutzer) + "Webcontent" (Artikel, Bilder)
- NavLink active state via `className` function → `.sidebar-item.active`
- Footer shows user avatar (initials from username) + name/role via `useAuth()`
- Use `useTranslation()` for all labels

### 2.4 `src/layout/AppLayout.tsx`
```tsx
<div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
  <LanguageSync />
  <Navbar />
  <div className="app-shell">   {/* flex row, height: calc(100vh - 60px) */}
    <Sidebar />
    <main className="main-content"><Outlet /></main>
  </div>
</div>
```
Remove `<Footer />` — admin area has no footer per design.

### 2.5 `src/layout/PublicLayout.tsx`
Remove `padding: '1rem'` from `<main>` — pages manage own spacing.

---

## Phase 3 — Public Pages

| File | Changes |
|------|---------|
| `src/pages/public/HomePage.tsx` | Add `.hero` section above articles; wrap in `.section` > `.article-grid` |
| `src/pages/public/NewsPage.tsx` | Compact hero + `.section` > `.article-grid` |
| `src/features/webcontent/components/ArticleCard.tsx` | Replace inline styles with `.article-card`, `.article-card-tag`, `.article-card-title`, `.article-card-excerpt`, `.article-card-date` |

---

## Phase 4 — Admin/Protected Components

| File | Changes |
|------|---------|
| `src/pages/protected/CustomersPage.tsx` | `.page-header` > `.page-title` + `.page-subtitle` + `.btn-accent`; wrap table in `.table-container` |
| `src/features/customers/components/CustomerTable.tsx` | Remove const-style objects; rely on global `table`/`th`/`td`; `.row-actions` + `.icon-btn` |
| `src/features/customers/components/CustomerFormModal.tsx` | `.modal-overlay` + `.modal-card`; `.form-group` > `.form-label` + `.form-input` |
| `src/features/auth/components/LoginModal.tsx` | `.modal-overlay` + `.login-card` (380px, not `.modal-card`) |
| `src/components/ConfirmDialog.tsx` | `.modal-overlay` (zIndex: 200) + `.modal-card` + `.btn-danger` |
| `src/pages/protected/UsersPage.tsx` + UserTable | Same pattern as Customers |
| `src/pages/protected/ArticlesOldPage.tsx` + components | Same pattern |
| `src/pages/protected/ImagesPage.tsx` | `.page-header` + `.page-title` |

---

## Phase 5 — Finishing Touches

### 5.1 Add i18n keys to `src/i18n/locales/*.json` (all 4 locales)
New keys: `home.tagline`, `home.title.*`, `home.subtitle`, `home.cta.*`, `home.articles.*`, `news.subtitle`, `auth.loginSub`, `auth.accessNote`, `customer.subtitle`, `nav.sidebar.*`

### 5.2 Update `index.html`
`<title>Tier Gesund</title>`

---

## Key Pitfalls

| Risk | Mitigation |
|------|-----------|
| `body { display:flex; place-items:center }` in `index.css` | Must be removed first — breaks entire layout |
| NavLink active state | Use `className={({ isActive }) => ...}` function form |
| Sidebar height coupling | `.app-shell` is `calc(100vh - 60px)` — hardcoded to `.navbar` 60px height |
| ConfirmDialog z-index | Needs `style={{ zIndex: 200 }}` to appear above LoginModal |
| ArticleCard date field | Verify `ArticleResponse` type has a date before using `.article-card-date` |

---

## Files to Create (new)
- `src/styles/variables.css`
- `src/styles/global.css`
- `src/layout/Sidebar.tsx`

## Critical Files to Modify
- `index.html` — fonts + title
- `src/index.css` — replace entirely
- `src/layout/Navbar.tsx`, `Footer.tsx`, `AppLayout.tsx`, `PublicLayout.tsx`
- `src/features/auth/components/LoginModal.tsx`
- `src/features/customers/components/CustomerTable.tsx`, `CustomerFormModal.tsx`
- `src/features/webcontent/components/ArticleCard.tsx`
- `src/pages/public/HomePage.tsx`, `NewsPage.tsx`
- `src/pages/protected/CustomersPage.tsx`, `UsersPage.tsx`, `ArticlesOldPage.tsx`, `ImagesPage.tsx`
- `src/components/ConfirmDialog.tsx`
- `src/i18n/locales/de.json`, `en.json`, `sv.json`, `ru.json`

---

## Verification

1. `npm run dev` after Phase 1 → DM Sans font, warm white background, no centering bug
2. After Phase 2 → sidebar visible in admin, footer visible on public pages
3. After Phase 3 → `/` and `/news` render hero + article card grid
4. After Phase 4 → all admin modals and tables use design system
5. `npm run build` → TypeScript compile with no type errors
6. Manual test: login modal, customer CRUD, navigation between all routes
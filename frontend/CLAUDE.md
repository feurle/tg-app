# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, port 5173)
npm run build    # Type-check + production build (tsc -b && vite build)
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test runner is configured yet.

The Java backend lives in a sibling repo (`../tg-web`).

## Architecture

**Stack:** React 19, TypeScript, Vite, React Router v7, react-i18next

**Project structure:**
```
src/
├── components/        # Shared, reusable components used across features
├── features/          # Feature domains (auth, customers, users, webcontent)
├── i18n/              # Internationalization (4 locales: de, en, sv, ru)
├── layout/            # Page layouts (PublicLayout, AppLayout)
├── lib/               # Utilities (apiClient.ts)
├── pages/
│   ├── public/        # Unauthenticated pages (rendered by PublicLayout)
│   └── protected/     # Authenticated pages (rendered by AppLayout via ProtectedRoute)
└── router/            # Routing configuration and route constants
```

**API:** All backend calls go through [src/lib/apiClient.ts](src/lib/apiClient.ts) — a thin fetch wrapper that sends `credentials: 'include'` (cookie-based sessions). In dev, Vite proxies `/api/*` to `http://localhost:8080`. In prod, set the `VITE_API_URL` environment variable to the backend base URL (e.g., `https://api.example.com`).

**Auth:** [src/features/auth/authStore.ts](src/features/auth/authStore.ts) is a plain module-level singleton (not React context). It calls `GET /api/auth/me` on startup to restore the session. Use the `useAuth()` hook in components to read auth state.

**Routing:** Two layout tracks in [src/router/index.tsx](src/router/index.tsx):
- `PublicLayout` — wraps public pages (`/`, `/news`) for unauthenticated users
- `ProtectedRoute` — checks auth before rendering, then passes to `AppLayout` for authenticated pages (`/customers`, `/users`, `/webcontent/*`)

Route path constants live in [src/router/routes.ts](src/router/routes.ts).

**Feature structure:** Each domain lives under `src/features/<feature>/`:
- `api.ts` — API calls using `apiClient`
- `types.ts` — TypeScript types
- `components/` — feature-specific components (tables, modals, etc.)

Current features: `auth`, `customers`, `users`, `webcontent` (articles + images).

**i18n:** Four locales (de, en, sv, ru) in [src/i18n/locales/](src/i18n/locales/). Default language is German (`de`), persisted to `localStorage` as `lang`. The backend uses enum values (`GERMAN`, `ENGLISH`, `SWEDISH`, `RUSSIAN`) — [src/features/webcontent/language.ts](src/features/webcontent/language.ts) maps between locale codes and backend enums.

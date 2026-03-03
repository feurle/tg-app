# TG App

A full-stack Spring Boot + React application for content management with support for articles, images, customer management, and user authentication/authorization.

**Stack:**
- Backend: Spring Boot 4.0.3 · Java 21 · Spring Modulith · Spring Security · H2 Database · Liquibase
- Frontend: React 19 · TypeScript · Vite · Tailwind CSS v4 · i18next (4 languages)

---

## Local Development

### Terminal 1: Backend (Spring Boot)
```bash
./gradlew bootRun
```
- Backend starts on `http://localhost:8080` (default with dev profile)
- Includes **Hot Reload** via Spring Boot DevTools (automatic reload on Java changes)
- H2 Database Console: `http://localhost:8080/h2-console` (development only)

### Terminal 2: Frontend (Vite Dev Server)
```bash
npm run dev
```
- Dev server on `http://localhost:5173`
- **Hot Module Reload (HMR)** enabled
- Proxies `/api` to `http://localhost:8080`

Then open **http://localhost:5173** in your browser.

---

## Build & Deployment

```bash
# Compiles frontend → src/main/resources/static/
# Then builds Spring Boot jar (includes frontend assets)
./gradlew build
```

The resulting jar contains both backend + frontend and can be run standalone.

---

## Quick Commands

### Backend
```bash
./gradlew bootRun          # Run application
./gradlew build            # Build + test everything
./gradlew test             # Run all tests
./gradlew clean            # Clean build outputs
```

### Frontend
```bash
npm run dev                # Development server (HMR enabled)
npm run build              # Build for production
npm run lint               # Lint code
npx tsc -b                 # Type check
npm run preview            # Preview production build locally
```

---

## Documentation

For detailed architecture, API endpoints, testing guides, and more, see **[CLAUDE.md](./CLAUDE.md)**.

---

## Hot Reload Features

| Component | Technology | Behavior |
|-----------|-----------|----------|
| **Java Backend** | Spring Boot DevTools | Auto-reload on `.java` file changes (most code) |
| **Frontend** | Vite HMR | Instant reload for `.tsx`, `.css`, `.ts` changes |
| **TypeScript** | Type checking | Run `npx tsc -b` for full type check |

---

## Authentication & Test Data

### Login Credentials

The application comes with pre-loaded test data:

| Username | Password | Role | Use Case |
|----------|----------|------|----------|
| `admin` | `admin` | ROLE_ADMIN, ROLE_USER | Full admin access (users, articles, customers) |
| `user` | `user` | ROLE_USER | Limited access (view articles, images) |

**To login:**
1. Click the login button in the navbar
2. Enter credentials
3. On success, your username appears in the navbar

### Endpoints & Access

- **Public endpoints**: Article reading, image download, authentication
- **Protected endpoints**: Everything else (requires login)
- **Admin-only endpoints**: User management, all CRUD operations
- **Authentication**: Form-based login with stateful sessions
- **Roles**: Manage via admin panel (`/api/user`)

### Test Data

The H2 database is pre-populated with sample data:

- **Users**: 2 test accounts (admin, user) with different role permissions
- **Customers**: ~50 fake customers (CSV-loaded via Liquibase, `db/fake-data/customer.csv`)
- **Articles**: ~50+ articles in 4 languages (DE, EN, SV, RU) with multiple states (CREATED, PUBLISHED, CLOSED)
- **Images**: Sample images loaded through the article relationships
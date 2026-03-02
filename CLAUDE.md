# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TG App** is a full-stack Spring Boot + React application for content management with support for articles, images, customer management, and user authentication/authorization.

- **Backend**: Spring Boot 4.0.3 · Java 21 · Spring Modulith 2.0.3 · Spring Security · H2 Database · Liquibase
- **Frontend**: React 19 · TypeScript · Vite · Tailwind CSS v4 · i18next (4 languages: DE, EN, SV, RU)
- **Build**: Gradle (backend) + npm (frontend) integrated via gradle node plugin
- **Project Structure**: Unified monorepo with frontend in `src/main/webapp/`, backend in `src/main/java/`

---

## Backend Development

### Quick Commands

```bash
# Build and run tests (compiles frontend and backend)
./gradlew build

# Run application (backend server + frontend dev assets)
./gradlew bootRun

# Run all backend tests
./gradlew test

# Run specific test class
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest"

# Run specific test method
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest.upload_savesImageAndReturnsIt"

# Verify module boundaries (Spring Modulith)
./gradlew test --tests "*ModuleTests"

# Clean build outputs
./gradlew clean

# Run H2 Database Console (development only)
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb
# Username: sa
# Password: (empty)
```

### Backend Architecture: Onion Architecture with Spring Modulith

The backend is organized into **modules** using Spring Modulith. Each module follows **Onion Architecture** with three fixed layers:

```
{module}/
├── domain/             ← Entities + Port interfaces (no Spring, except JPA annotations)
├── application/        ← Use-case services; return domain objects, never DTOs
└── infrastructure/
    ├── persistence/    ← JpaXxxRepository: extends JpaRepository<E,ID> + implements domain port
    ├── config/         ← Bean configurations and auditing setup
    └── rest/
        ├── dto/        ← Request/Response records
        └── *Controller ← Maps HTTP ↔ application services; owns all DTO mapping
```

**Dependency Rule**: `infrastructure → application → domain`. Nothing in `domain` or `application` may import from `infrastructure`.

### Backend Modules

#### `webcontent` Module
Manages articles and images with support for multiple content pages.

**Key Entities:**
- `Article`: title, content, state (CREATED/PUBLISHED/CLOSED), page (HOME/NEWS/TEASER), publishedDate, timestamps, M:N relationship with Images
- `Image`: binary image data, fileName, mimeType, createdAt

**Key Services:**
- `ArticleService`: CRUD + filtering by page/state
- `ImageService`: Upload, download, delete

**API Endpoints:**
- `GET /api/webcontent/articles` - All articles
- `GET /api/webcontent/articles/{id}` - Single article
- `GET /api/webcontent/articles/page/{pageType}` - Articles for page
- `GET /api/webcontent/articles/page/{pageType}/published` - Published articles for page
- `POST /api/webcontent/articles` - Create article
- `PUT /api/webcontent/articles/{id}` - Update article
- `DELETE /api/webcontent/articles/{id}` - Delete article
- `POST /api/webcontent/images` - Upload image (multipart)
- `GET /api/webcontent/images/{imageId}/download` - Download image binary
- `DELETE /api/webcontent/images/{imageId}` - Delete image

#### `customer` Module
Basic CRUD operations for customer management.

**Entity:**
- `Customer`: firstName, lastName, email, phone, address, city, state, zip, country, timestamps

**API Endpoints:**
- `GET /api/customer` - All customers
- `GET /api/customer/{id}` - Single customer
- `GET /api/customer/email/{email}` - By email
- `POST /api/customer` - Create customer
- `PUT /api/customer/{id}` - Update customer
- `DELETE /api/customer/{id}` - Delete customer

#### `user` Module
User management with Spring Security integration, authentication, and role-based authorization.

**Entities:**
- `User`: username, password (hashed), firstName, lastName, email, active status, timestamps
- `Authority`: authority name (e.g., ROLE_ADMIN, ROLE_USER)
- `User` M:N relationship with `Authority`

**Key Services:**
- `UserDetailsServiceImpl`: Spring Security integration; loads users and maps authorities
- `UserService`: CRUD + password encoding

**API Endpoints:**
- `GET /api/auth/me` - Current authenticated user + authorities (401 if anonymous)
- `POST /api/auth/login` - Form login (username/password, urlencoded)
- `POST /api/auth/logout` - Logout (invalidates session, returns 200 + {})
- `GET /api/user` - All users (admin only)
- `GET /api/user/{id}` - Single user (admin only)
- `POST /api/user` - Create user (admin only)
- `PUT /api/user/{id}` - Update user (admin only)
- `DELETE /api/user/{id}` - Delete user (admin only)

### Spring Security Configuration

Located in `src/main/java/com/feurle/tg/user/infrastructure/config/SecurityConfig.java`:

**Public Endpoints:**
- All authentication endpoints: `/api/auth/**`
- Article discovery: `GET /api/webcontent/articles/page/**` (published articles only)
- Image download: `GET /api/webcontent/images/**`
- H2 console: `/h2-console/**` (dev only)

**Protected Endpoints:**
- All other requests require authentication (except the above)
- User and customer management require admin role

**Authentication Method:**
- Form-based login (stateful sessions)
- Disabled: CSRF, HTTP Basic, default form login handler (custom JSON API)

### Database & Schema Management

**Liquibase** manages schema (`ddl-auto: none`). Master changelog is at `src/main/resources/db/changelog/db.changelog-master.yaml`.

**Changelog Structure:**
```
db/changelog/
├── 00-create-event-publication-table.yaml    ← Spring Modulith internal
├── user/                                     ← User module changesets
├── customer/                                 ← Customer module changesets
├── webcontent/                               ← Webcontent module changesets
└── db.changelog-master.yaml                  ← Master file (references all)
```

**When Adding Entities or Columns:**
1. Create a new numbered changeset file (e.g., `003-add-user-authorities.yaml`) in `db/changelog/{module}/`
2. Add changeset reference to `db.changelog-master.yaml`
3. Never modify existing changesets

### Key Dependencies

- **Lombok**: `@Data`, `@NoArgsConstructor`, `@RequiredArgsConstructor` for boilerplate
- **Spring Data JPA**: Auto-generates repository implementations
- **Spring Modulith**: Module boundary verification and enforcement
- **Spring Security**: Authentication + authorization with BCrypt password encoding
- **Liquibase**: Schema versioning and migrations

---

## Frontend Development

### Quick Commands

```bash
# Development server (HMR enabled, proxies /api to localhost:8080)
npm run dev

# Build for production (outputs to src/main/resources/static)
npm run build

# Type-check TypeScript
npx tsc -b

# Lint code
npm run lint

# Preview production build locally
npm run preview
```

### Frontend Project Structure

```
src/main/webapp/
├── index.html                ← Entry HTML template
├── src/
│   ├── main.tsx             ← React entry point (i18n initialization)
│   ├── App.tsx              ← Main router component
│   ├── index.css            ← Tailwind imports + theme colors
│   ├── components/
│   │   ├── Navbar.tsx       ← Top navigation (language switcher, user menu)
│   │   ├── Footer.tsx       ← Bottom footer (admin links when authenticated)
│   │   ├── LoginModal.tsx   ← Authentication modal
│   │   ├── common/          ← Shared components (ConfirmDialog)
│   │   ├── webcontent/      ← Article/Image components (list, form, modal, details)
│   │   └── customer/        ← Customer components (list, form, modal)
│   │   └── user/            ← User components (list, form, modal)
│   ├── pages/
│   │   ├── public/          ← Public pages (HomePage, NewsPage)
│   │   ├── webcontent/      ← Admin pages (ArticlesPage, ImagesPage)
│   │   ├── customer/        ← Admin pages (CustomerPage)
│   │   └── user/            ← Admin pages (UserPage)
│   ├── types/               ← TypeScript type definitions
│   │   ├── article.ts
│   │   ├── image.ts
│   │   ├── customer.ts
│   │   ├── user.ts
│   │   └── auth.ts
│   ├── i18n/                ← Internationalization (4 languages)
│   │   ├── config.ts        ← i18next configuration
│   │   ├── de/              ← German translations (8 namespaces)
│   │   ├── en/              ← English translations
│   │   ├── sv/              ← Swedish translations
│   │   └── ru/              ← Russian translations
│   └── styles/
│       ├── base.css         ← Tailwind @layer base (reusable classes)
│       └── (component CSS files co-located with components)
└── vite.config.ts           ← Vite + Tailwind plugin config
```

### Routing & Page Types

**App Router Type:**
```typescript
type Page = 'home' | 'news' | 'articles' | 'images' | 'customers' | 'users'
```

**Public Pages (no authentication required):**
- `HomePage` - Hero + published articles from HOME page
- `NewsPage` - Hero + published articles from NEWS page

**Admin Pages (authentication required):**
- `ArticlesPage` - Article CRUD management
- `ImagesPage` - Image upload & management
- `CustomerPage` - Customer CRUD management
- `UserPage` - User CRUD management

All admin pages follow the same layout pattern: header (title + action buttons) → content area.

### Styling Architecture

**Tailwind CSS v4** with custom Bootstrap color theme + component-scoped CSS.

**Color Theme** (Bootstrap colors, defined in `src/main/webapp/src/index.css` via `@theme`):
```
--color-primary: #0d6efd
--color-secondary: #6c757d
--color-success: #198754
--color-danger: #dc3545
--color-warning: #ffc107
--color-info: #0dcaf0
--color-light: #f8f9fa
--color-dark: #212529
```

**CSS Organization:**
1. `src/main/webapp/src/index.css`: Imports Tailwind, defines @theme colors, imports base.css
2. `src/main/webapp/src/styles/base.css`: Reusable @layer component classes (`.btn`, `.badge`, `.card`, `.form-*`)
3. **Component CSS files** (co-located with components): Pure CSS using Bootstrap color variables, **no @apply** in separate files (Tailwind v4 limitation)

**Component Styling Pattern:**
Each component has its own `.css` file with semantic class names (BEM-like: `.component-name__element--modifier`). Import in component: `import './ComponentName.css'`.

### Component Patterns

**List Components** (Read-only display):
- Props: `data` array + callbacks (`onEdit`, `onDelete`)
- Example: `ArticleList`, `CustomerList`, `UserList`

**Form Components** (Create/Edit in single form):
- Props: `initial` (null = create mode), `onSave`, `onCancel`, `saving` boolean
- Example: `ArticleForm`, `CustomerForm`, `UserForm`

**Modal Components** (Form wrapped in modal):
- Props: pass through to wrapped form
- Example: `ArticleFormModal`, `CustomerFormModal`, `UserFormModal`

**API & Data Fetching Patterns:**
- Fetch data in `useEffect` with dependencies
- Handle loading/error/success states
- Pass callbacks to child components for mutations
- Re-fetch data after create/update/delete operations

### Internationalization (i18next)

**Setup:**
- Initialized in `src/main/webapp/src/main.tsx` with 4 languages
- Browser language auto-detection with localStorage persistence
- Fallback: German (de)

**Translation Files:**
- **Namespaces** (8 total): `common`, `navbar`, `home`, `news`, `articles`, `images`, `customers`, `users`
- **Languages**: 🇩🇪 de, 🇬🇧 en, 🇸🇪 sv, 🇷🇺 ru

**Usage in Components:**
```typescript
const { t } = useTranslation('namespace')
// Use: t('key'), t('key.nested')
```

---

## Frontend Configuration

### Vite Configuration
- **Root**: `src/main/webapp` (not root directory)
- **Build Output**: `src/main/resources/static/` (served by Spring Boot)
- **Plugins**: `@tailwindcss/vite`, `@vitejs/plugin-react`
- **Dev Proxy**: `/api/*` → `http://localhost:8080/api/*`

### TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict Mode**: Enabled

---

## Development Workflow

### Running Locally

**Terminal 1 (Backend):**
```bash
./gradlew bootRun
# Backend starts on http://localhost:8080
# Serves static frontend from src/main/resources/static (production build only)
```

**Terminal 2 (Frontend Dev):**
```bash
npm run dev
# Dev server on http://localhost:5173
# Proxies /api to http://localhost:8080
```

Then open **http://localhost:5173** in browser (HMR enabled).

### Building for Deployment

```bash
# Compiles frontend to src/main/resources/static/
# Then builds Spring Boot jar (includes frontend assets)
./gradlew build
```

The resulting jar contains both backend + frontend and can be run standalone.

---

## Testing

### Backend

**Unit & Integration Tests:**
- Located in `src/test/java/com/feurle/tg/`
- Run all: `./gradlew test`
- Run specific: `./gradlew test --tests "ClassName"`
- Run method: `./gradlew test --tests "ClassName.methodName"`

**Module Boundary Tests:**
```bash
./gradlew test --tests "*ModuleTests"
```
Verifies Spring Modulith module structure (catches dependency violations).

### Frontend

**Linting:**
```bash
npm run lint
```

**Type Checking:**
```bash
npx tsc -b
```

---

## Common Development Tasks

### Adding a New CRUD Page

1. Create types: `src/main/webapp/src/types/{domain}.ts`
2. Create main page: `src/main/webapp/src/pages/{module}/{DomainPage}.tsx` + `.css`
3. Create list component: `src/main/webapp/src/components/{module}/{DomainList}.tsx` + `.css`
4. Create form component: `src/main/webapp/src/components/{module}/{DomainForm}.tsx` + `.css`
5. Create form modal: `src/main/webapp/src/components/{module}/{DomainFormModal}.tsx` + `.css`
6. Update `App.tsx` to add page to router + ADMIN_PAGES array
7. Update `Navbar.tsx` to add menu item
8. Add translation keys to 8 i18n namespace files (de, en, sv, ru)

### Adding a Backend Module

1. Create directory: `src/main/java/com/feurle/tg/{moduleName}/`
2. Layers: `domain/`, `application/`, `infrastructure/`
3. In `domain/`: Entities, Enums, Port interfaces (repositories)
4. In `application/`: Services (return domain objects)
5. In `infrastructure/persistence/`: JPA repositories
6. In `infrastructure/rest/`: Controller + DTOs
7. Create Liquibase changelog: `src/main/resources/db/changelog/{moduleName}/`
8. Reference in `db.changelog-master.yaml`
9. Add module boundary test: `src/test/java/com/feurle/tg/{moduleName}/{ModuleName}ModuleTests.java`

### Styling a New Component

1. Create component CSS file: `src/main/webapp/src/components/Path/ComponentName.css`
2. Use Bootstrap color variables: `var(--color-primary)`, etc.
3. Use Tailwind spacing tokens (padding, margin)
4. Import CSS in component: `import './ComponentName.css'`
5. Apply classes: `className="component-name__element"`

### Running Tests Before Push

```bash
# Type check
npx tsc -b

# Lint
npm run lint

# Backend tests + module boundary tests
./gradlew test

# Build (compiles both frontend + backend)
./gradlew build
```

---

## Backend Configuration

**File:** `src/main/resources/application.yaml`

- **Database**: H2 in-memory (`jdbc:h2:mem:testdb`), schema managed by Liquibase
- **Multipart**: Max 10MB files
- **JPA**: `ddl-auto: none` (Liquibase controls schema)
- **Security**: Spring Security with form login (stateful sessions)

---

## Key Notes

### Architecture
- Module boundaries are enforced via Spring Modulith tests
- Strict onion architecture: domain → application → infrastructure
- All DTO mapping happens in REST controllers, never in services
- Services return domain objects, never DTOs

### Frontend
- All pages follow consistent header/content layout
- CSS is co-located with components (one `.css` file per component)
- Tailwind utilities used for layout; CSS for component-specific styling
- All hardcoded text uses i18next translation keys

### Database
- Schema changes via Liquibase changesets
- Never modify existing changesets
- Create new numbered files, reference in master changelog
- H2 console available at `http://localhost:8080/h2-console` in development

### Security
- Public endpoints: article reading, image download, authentication
- Protected endpoints: everything else (CRUD operations)
- Authentication: form-based login (stateful sessions)
- Password encoding: BCrypt
- User roles managed via Authority entities (M:N relationship)

---

## Git Workflow Notes

- Current branch: `npm-folder-reorg` (reorganizing frontend files from `frontend/` → `src/main/webapp/`)
- Frontend and backend are in the same repository
- Commit prefix: `[Frontend]` or `[Backend]` if changes are isolated
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
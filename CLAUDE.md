# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TG App** is a full-stack Spring Boot + React application for content management with support for articles, images, and customer management.

- **Backend**: Spring Boot 4.0.3 · Java 21 · Spring Modulith 2.0.3 · H2 Database
- **Frontend**: React 19 · TypeScript · Vite · Tailwind CSS v4
- **Build**: Gradle (backend) · npm (frontend)

---

## Backend Development

### Quick Commands

```bash
# Build and run tests
./gradlew build

# Run application
./gradlew bootRun

# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest"

# Run specific test method
./gradlew test --tests "com.feurle.tg.webcontent.application.ImageServiceTest.upload_savesImageAndReturnsIt"

# Clean build outputs
./gradlew clean
```

### H2 Console (Development Only)

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (empty)

### Architecture: Onion Architecture with Spring Modulith

The backend is organized into modules using Spring Modulith. Each module follows **Onion Architecture** with three fixed layers:

```
{module}/
├── domain/             ← Entities + Port interfaces (no Spring, except JPA annotations)
├── application/        ← Use-case services; return domain objects, never DTOs
└── infrastructure/
    ├── persistence/    ← JpaXxxRepository: extends JpaRepository<E,ID> + implements domain port
    └── rest/
        ├── dto/        ← Request/Response records
        └── *Controller ← Maps HTTP ↔ application services; owns all DTO mapping
```

**Dependency Rule**: `infrastructure → application → domain`. Nothing in `domain` or `application` may import from `infrastructure`.

### Modules

#### `webcontent` Module
Manages articles and images with support for multiple content pages.

**Entities:**
- `Article`: title, content, state (CREATED/PUBLISHED/CLOSED), page (HOME/NEWS/TEASER), timestamps, M:N relationship with Images
- `Image`: binary image data, fileName, mimeType, created timestamp

**API Endpoints:**
- Articles: `GET /api/webcontent/articles`, `GET /api/webcontent/articles/{id}`, `GET /api/webcontent/articles/page/{pageType}`, `GET /api/webcontent/articles/page/{pageType}/published`, `POST /api/webcontent/articles`, `PUT /api/webcontent/articles/{id}`, `DELETE /api/webcontent/articles/{id}`
- Images: `POST /api/webcontent/images`, `GET /api/webcontent/images/{imageId}/download`, `DELETE /api/webcontent/images/{imageId}`

#### `customer` Module
Basic CRUD operations for customer management.

**Entity:**
- `Customer`: firstName, lastName, email, phone, address, city, state, zip, country, timestamps

**API Endpoints:**
- `GET /api/customer`, `GET /api/customer/{id}`, `GET /api/customer/email/{email}`, `POST /api/customer`, `PUT /api/customer/{id}`, `DELETE /api/customer/{id}`

### Database & Schema Management

**Liquibase** manages the schema (`ddl-auto: none`). Master changelog is at `src/main/resources/db/changelog/db.changelog-master.yaml`.

When adding a new entity or column:
1. Create a new numbered changeset file (e.g., `002-add-column.yaml`) in `db/changelog/{module}/`
2. Reference it from the master changelog
3. Never modify existing changesets

### Spring Modulith Verification

Run module boundary tests to verify architecture:
```bash
./gradlew test --tests "*ModuleTests"
```

---

## Frontend Development

### Quick Commands

```bash
# Development server (HMR enabled)
npm run dev

# Build for production
npm run build

# Type-check TypeScript
npx tsc -b

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Project Structure

```
frontend/src/
├── App.tsx                  ← Main app router
├── components/
│   ├── common/             ← Shared components (ConfirmDialog)
│   ├── webcontent/         ← Article/Image components
│   └── customer/           ← Customer management components
├── pages/
│   ├── public/             ← Public pages (HomePage, NewsPage)
│   ├── webcontent/         ← Article/Image management pages
│   └── customer/           ← Customer management page
├── types/                  ← TypeScript type definitions
│   ├── article.ts
│   ├── image.ts
│   └── customer.ts
├── styles/
│   ├── base.css            ← Tailwind @layer base (reusable classes)
│   └── index.css           ← Main stylesheet with @theme colors
└── index.css               ← Entry point (imports Tailwind + base.css)
```

### Styling Architecture

**Tailwind CSS v4** with custom Bootstrap color theme + component-scoped CSS files.

**Color Theme** (Bootstrap colors):
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
1. `index.css`: Imports Tailwind, defines @theme colors, and imports base.css
2. `styles/base.css`: Reusable @layer component classes (.btn, .badge, .card, .form-*)
3. **Component CSS files** (per-component styling): Pure CSS using Bootstrap color values, **no @apply in separate files** (limitation of Tailwind v4 with @tailwindcss/vite)

**Component CSS Pattern:**
Each component has its own `.css` file with semantic class names (BEM-like: `.component__element--modifier`). These files contain pure CSS, not @apply directives.

### Page Structure & Routing

**App Router Types:**
```typescript
type Page = 'home' | 'news' | 'articles' | 'images' | 'customers'
```

**Public Pages:**
- `/pages/public/HomePage.tsx` - Hero section + published articles (HOME page)
- `/pages/public/NewsPage.tsx` - Hero section + published articles (NEWS page)

**Admin Pages:**
- `/pages/webcontent/ArticlesPage.tsx` - Article CRUD management
- `/pages/webcontent/ImagesPage.tsx` - Image management
- `/pages/customer/CustomerPage.tsx` - Customer CRUD management

All admin pages share identical layout: title + subtitle + action buttons (Create + Back) in header, content area below.

### Component Patterns

**List Components:**
- Read-only display of data in table format
- Props: data array + callbacks (onEdit, onDelete)
- Example: `CustomerList`, `ArticleList`

**Form Components:**
- Handle create/edit operations in a single form
- Props: `initial` (null = create mode), `onSave`, `onCancel`, `saving` boolean
- Example: `CustomerForm`, `ArticleForm`

**Modal Components:**
- Wrap form in modal backdrop
- Props: pass through to wrapped form component
- Example: `CustomerFormModal`, `ArticleFormModal`

**API Patterns:**
- Fetch data in `useEffect` with dependencies
- Handle loading/error/success states
- Pass callbacks to child components for user interactions
- Re-fetch data after mutations (create/update/delete)

### Type Definitions

Each feature domain has a types file:
- `types/customer.ts`: Customer, CreateCustomerData, UpdateCustomerData
- `types/article.ts`: ArticleResponse, ArticleState, PageType, ImageResponse
- `types/image.ts`: ImageResponse

### Development Workflow

1. **Start dev server**: `npm run dev` (watches frontend)
2. **Start backend**: `./gradlew bootRun` (in project root)
3. **Both serve together**: Frontend proxies to `http://localhost:8080/api/*`

### Common Development Tasks

**Adding a new CRUD page:**
1. Create `types/{domain}.ts` with entity types
2. Create `pages/{module}/{DomainPage}.tsx` (use CustomerPage as template)
3. Create `pages/{module}/{DomainPage}.css` (use CustomerPage.css as template)
4. Create `components/{module}/{DomainList}.tsx` and `.css`
5. Create `components/{module}/{DomainForm}.tsx` and `.css`
6. Create `components/{module}/{DomainFormModal}.tsx` and `.css`
7. Update `App.tsx` to import and route to new page
8. Update `Navbar.tsx` to add menu item

**Styling a new component:**
1. Create component `.css` file with semantic class names
2. Use Bootstrap color variables and Tailwind spacing tokens
3. Import CSS in component: `import './ComponentName.css'`
4. Apply classes in JSX: `className="component-name__element"`

---

## Backend Configuration

Default configuration in `application.yaml`:
- **H2 Database**: In-memory, `ddl-auto: none` (Liquibase manages schema)
- **Multipart Upload**: Max 10MB (`spring.servlet.multipart.max-file-size`)
- **JPA**: Spring Data auto-generates repository implementations

### Key Dependencies

- **Lombok**: For `@Data`, `@NoArgsConstructor`, `@RequiredArgsConstructor` on entities/services
- **Liquibase**: Schema versioning and migrations
- **Spring Modulith**: Module boundary verification
- **Spring Data JPA**: Query generation from interfaces

---

## Frontend Configuration

### Vite Configuration
- **Plugin**: `@tailwindcss/vite` (handles Tailwind CSS v4)
- **React Plugin**: `@vitejs/plugin-react` (with HMR)

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext
- **JSX**: react-jsx

### Build Output
- **Dist**: `dist/` folder
- **Assets**: Single CSS bundle + JS chunks
- **All TypeScript**: Compiled to JavaScript, sourcemaps included

---

## Development Tips

### Backend
- Module boundary violations are caught at test time—run `./gradlew test` before pushing
- Use `@RequiredArgsConstructor` on services for dependency injection
- Store enums as strings in DB (`@Enumerated(EnumType.STRING)`)

### Frontend
- All pages follow the same header/content pattern—maintain consistency
- CSS color values must match Bootstrap theme defined in `index.css`
- Component imports should be relative paths: `import X from '../../components/...'`
- Fetch errors are caught and stored in component state—display in error UI

---

## Commit Convention

Frontend and backend are in the same repository. When committing:
- Prefix commit message with **[Frontend]** or **[Backend]** if changes are isolated
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Example: `[Frontend] feat: add customer delete confirmation dialog`


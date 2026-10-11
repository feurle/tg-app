# Local development

Run the backend and the frontend dev server together:

- Terminal 1: `./gradlew bootRun` starts the backend on `http://localhost:8080` (dev profile, H2).
- Terminal 2: `cd frontend && npm run dev` starts the frontend on `http://localhost:5173`.

Open `http://localhost:5173` in the browser.

Alternatively, `./gradlew devAll` starts both in one terminal. Ctrl+C stops both. Its output is
interleaved without labels, so use the two-terminal setup when debugging a startup failure.

- Vite proxies `/api/*` to the backend, so the browser sees one origin and no CORS setup is needed.
- Spring Boot DevTools reloads the backend when Java files change.
- H2 console: `http://localhost:8080/h2-console`.
- Dev login: `admin` / `admin` (see [database.md](database.md)).
- To verify a change at runtime, follow [verification.md](verification.md).

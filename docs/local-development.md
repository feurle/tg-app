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
- Logins: see [database.md](database.md#test-credentials).
- To verify a change at runtime, follow [verification.md](verification.md).

## Sending real mail locally

The mail properties come from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`,
`SMTP_PASSWORD`, `MAIL_FROM`). `bootRun` (and so `devAll`) reads them from a git-ignored `.env`
in the repo root, one `KEY=value` per line; surrounding quotes are stripped:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<gmail address>
SMTP_PASSWORD=<Gmail app password, not the account password>
MAIL_FROM='Name <address@example.com>'
```

Gmail rewrites the sender to the authenticated account unless the `MAIL_FROM` address is
configured as a "Send mail as" alias. To check delivery, submit the contact form at
`http://localhost:5173` and look at the inbox and spam folder. Never commit `.env`.

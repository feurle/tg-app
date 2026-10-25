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

## Parallel worktrees

Work on several issues at once with one git worktree per issue:

```bash
git worktree add ../tg-app-95 -b feat/95-cta-article-type origin/trunk
```

- Branch names are `<type>/<issue>-<slug>`, for example `fix/113-office-hours`. Any prefix works,
  because only the PR and `trunk` trigger CI. Open the PR against `trunk` (see
  [contributing.md](contributing.md)).
- Every worktree has its own `node_modules`, H2 database and `.env` (git-ignored, so copy it over
  if you need real mail).
- The default ports 8080 and 5173 are taken by the first instance. Give every other worktree its own
  pair, for example:

  ```bash
  SERVER_PORT=8081 VITE_PORT=5174 ./gradlew devAll
  ```

  `SERVER_PORT` moves the backend and the Vite proxy target, `VITE_PORT` moves the dev server (it
  fails instead of picking another port, so the URL is always the one you set).
- `docs/verification.md` and the `Makefile` assume the default ports. Substitute yours there.

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

Optional `MAIL_TO=<address>` redirects **all** outgoing mail to that address (the subject gets a
`[an: <real recipient>]` prefix, Reply-To is unchanged). Contact, appointment, referral and
questionnaire mails otherwise go to the primary practice address from `vet_info`
(`info@tier-gesund.at` in the seed), so set `MAIL_TO` before testing with real SMTP.

Gmail rewrites the sender to the authenticated account unless the `MAIL_FROM` address is
configured as a "Send mail as" alias. To check delivery, submit the contact form at
`http://localhost:5173` and look at the inbox and spam folder. Never commit `.env`.

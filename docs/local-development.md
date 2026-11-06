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

Work on several issues at once with one git worktree per issue, next to the main checkout:

```bash
scripts/new-worktree.sh 137 chore actions-node24
```

This creates `../tg-app-137` on the new branch `chore/137-actions-node24` from `origin/trunk`,
copies `.env` from the main checkout and runs `npm ci` in `frontend/`. It prints the ports and
the next commands. The manual equivalent:

```bash
git fetch origin trunk
git worktree add --no-track -b chore/137-actions-node24 ../tg-app-137 origin/trunk
```

- `--no-track` matters. Without it the branch tracks `origin/trunk`, and a bare `git push` targets
  `trunk`. Push the first time with `git push -u origin <branch>`.
- Branch names are `<type>/<issue>-<slug>`, for example `fix/113-office-hours`. Any prefix works,
  because only the PR and `trunk` trigger CI. Open the PR against `trunk` (see
  [contributing.md](contributing.md)).
- Every worktree has its own `node_modules`, H2 database and `.env` (git-ignored, so copy it over
  if you need real mail).
- The main checkout keeps the default ports 8080 and 5173. A worktree for issue `N` uses backend
  `20000 + N` and frontend `30000 + N`, so parallel worktrees never collide:

  ```bash
  SERVER_PORT=20137 VITE_PORT=30137 ./gradlew devAll
  ```

  `SERVER_PORT` moves the backend and the Vite proxy target, `VITE_PORT` moves the dev server (it
  fails instead of picking another port, so the URL is always the one you set). Pass both on the
  command line, not in `.env`: `.env` only reaches the backend, so Vite would still proxy to 8080.
- `docs/verification.md` assumes the default ports. Substitute yours there.
- Issues that touch the same files (`global.css`, seed CSVs, Liquibase changesets) conflict at
  merge time. Work on those one after the other.

### With OpenCode

Run one OpenCode session per worktree, started inside it:

```bash
cd ../tg-app-137 && opencode
```

The session then reads and writes only that worktree. Tell it the issue's ports, or let it derive
them from the rule above.

- `opencode.json` starts `chrome-devtools-mcp` with `--isolated` (also in `.mcp.json`), so every
  session gets its own temporary Chrome profile instead of fighting over the shared default one.
  Browser logins don't persist between sessions. That is fine, because verification logs in via the
  API anyway (see [verification.md](verification.md#authenticate)).
- OpenCode can also create worktrees itself. `"worktree": { "directory": ".." }` in `opencode.json`
  puts them next to the main checkout. Prefer the script, because it sets the branch name, `.env`
  and `node_modules` the way this repo expects.

### Cleaning up

After the PR is merged, from the main checkout:

```bash
git worktree remove ../tg-app-137
git branch -D chore/137-actions-node24
git pull --ff-only
```

`git branch -d` refuses here, because a squash merge leaves the branch's own commits unmerged as far
as git can tell. `git worktree remove` refuses while the worktree has uncommitted or untracked
files. Check them first, then add `--force` if they can go.

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

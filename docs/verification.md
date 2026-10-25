# Runtime verification

Most changes span both the backend (repo root) and the frontend (`frontend/`).
Verify through the running stack, not either half alone.

## Prerequisites

Browser steps need one of these MCP servers:

- **chrome-devtools** (`.mcp.json`: `npx chrome-devtools-mcp@latest`). This is the default; the examples below use its tool names.
- **firefox-devtools**: use this when Firefox is requested or Chrome is unavailable.

curl steps need no browser.

Tool names differ between the two:

| Task | chrome-devtools | firefox-devtools |
|---|---|---|
| Open a page | `navigate_page` / `new_page` | `navigate_page` / `new_page` (no `pageId`) |
| List and select tabs | `list_pages`, `select_page({pageId})` | `list_pages`, `select_page({pageIdx})` |
| Snapshot | `take_snapshot` | `take_snapshot` (100 lines by default, scope with `selector`) |
| Click / fill | `click`, `fill`, `fill_form` | `click_by_uid`, `fill_by_uid`, `fill_form_by_uid` |
| Key press | `press_key` | `press_key` |
| Viewport | `resize_page({pageId, width, height})` | `set_viewport_size({width, height})` |
| Screenshot | `take_screenshot` | `screenshot_page` / `screenshot_by_uid` |
| JS in page | `evaluate_script` | `evaluate_script` (function as string) |
| Console messages | `list_console_messages` / `get_console_message` | no direct equivalent; use `get_firefox_output` for browser logs |
| End session | not needed | `close_firefox_session` when done |

## Launch

Start backend and frontend in the background as in [local-development.md](local-development.md)
(~10s and ~1s). Wait on readiness rather than sleeping:

```bash
until curl -s -o /dev/null --max-time 2 localhost:8080/api/webcontent/pages/home \
   && curl -s -o /dev/null --max-time 2 localhost:5173/; do sleep 2; done
```

In a second worktree set `SERVER_PORT` and `VITE_PORT` (see
[local-development.md](local-development.md#parallel-worktrees)) and replace 8080 and 5173 in every
command below.

**H2 is in-memory.** Restarting the backend resets to the Liquibase seed, the
cheapest way to get clean data after probes pollute it. Seeded pages are in
`src/main/resources/db/data/page.csv`.

## Authenticate

Form login is disabled. Auth is a session cookie from a JSON POST. There is no
login button in the public nav, so get the session via the API.

curl:
```bash
J=$(mktemp)
curl -s -c $J -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' -H 'X-Requested-With: XMLHttpRequest' \
  -d '{"login":"admin","password":"admin"}'
curl -s -b $J localhost:8080/api/webcontent/articles/page/home
```

Browser: navigate to `localhost:5173` first so the cookie binds to that origin,
then run the same login call via `evaluate_script` (both browsers):
```js
() => fetch('/api/auth/login', {method:'POST',
  headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
  credentials:'include', body:JSON.stringify({login:'admin',password:'admin'})})
```
Don't trust that the fetch resolved. Check the `Set-Cookie` header on the
`/api/auth/login` response with `list_network_requests` / `get_network_request`
(Chrome). In Firefox, use `evaluate_script` to read `document.cookie` or check the
response status directly in the login fetch.
This catches a silent 401 that a status-blind assertion would miss.

Mutating endpoints return 401 without the cookie. Public endpoints: see
[webcontent.md](webcontent.md#access).

## Drive

- **Public pages:** routes in [frontend/README.md](../frontend/README.md#routes). An empty
  page usually means an article type problem, see [webcontent.md](webcontent.md).
- **Admin pages:** `localhost:5173/webcontent/page/{slug}`. A blank page means the
  session cookie is missing, not a crash (see [frontend.md](frontend.md#auth)).
- **Admin table loop** (Chrome names, Firefox equivalents in the table above):
  `resize_page` to ~1500x900 (action buttons are off-screen at default width; take a
  screenshot to confirm the resize revealed them) → `take_snapshot` → act on the
  returned `uid`s with `click`/`fill`/`fill_form` → re-snapshot before reusing a `uid`
  after any mutation.
- **Not covered yet:** the `contact`, `vetinfo`, `notification` and `questionnaire`
  modules have no verification recipes. Look at their controllers and pages
  directly and add recipes here once you've verified them.

Client/server consistency check (compares what the UI shows with what the server
reports, in one call). Article order is settable, so don't assume seed order
matches display order:
```js
() => {
  const ui = [...document.querySelectorAll('tr.tr-expandable')].map(r => r.querySelectorAll('td')[0].textContent);
  return fetch('/api/webcontent/articles/page/home').then(r => r.json()).then(a => a.map(x => x.order));
}
```

## Gotchas

- **`fill` with an empty string does not fire React's onChange.** The DOM value
  clears but component state keeps the previous value, so the form submits stale
  data. This looks exactly like an app bug. To clear a controlled input: focus it
  (e.g. via `click`), `press_key` `Control+a`, then `Backspace`.
- **Snapshot `uid`s go stale after any DOM mutation.** Re-run `take_snapshot`
  before reusing a `uid` from before a click, fill or navigation.
- **Chrome: `evaluate_script`'s `waitForStableDom` defaults to `true`**, which adds
  latency to read-only checks. Pass `waitForStableDom: false` for those. Firefox
  has no such option.
- **Multiple open pages need explicit targeting.** Chrome: `pageId` (or `select_page`).
  Firefox: `pageIdx` on `select_page`. Either way, the call acts on the selected tab,
  so check `list_pages` if in doubt.
- **Firefox: `fill_by_uid` with an empty string is untested here.** Check whether the
  React state updates. If it doesn't, use the clear sequence from above
  (`click_by_uid`, `press_key` `ctrl+a`, `press_key` `Backspace`).
- **Stopping the backend:** `kill $(ss -ltnp | grep ':8080' | grep -oP 'pid=\K[0-9]+')`.
  `pkill -f bootRun` only catches the Gradle wrapper and leaves the forked JVM
  holding the port. The kill command can return an odd exit code even on success,
  so check the port instead of trusting the exit code.
- **Stopping the frontend:** `pkill -f vite`. The `npm run dev` wrapper doesn't
  hold the port, `vite` does.
- **Confirm both are down:** `ss -ltnp | grep -E ':8080|:5173' || echo "both ports free"`.

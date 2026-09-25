---
name: verify
description: Build, launch and drive the tg-app backend + frontend to observe a change at runtime. Use when verifying webcontent/article/customer/contact changes end-to-end.
---

# Verifying tg-app (backend + frontend)

Most changes here span both the backend (repo root) and the frontend (`frontend/`).
Verify through the running stack, not either half alone.

## Launch

Both in background; they take ~10s and ~1s respectively.

```bash
./gradlew bootRun                    # :8080, dev profile, H2
cd frontend && npm run dev           # :5173, proxies /api -> :8080
```

`./gradlew devAll` runs both in one terminal, but interleaves their output
without labeling which process a line came from and has no readiness signal
of its own — prefer the two-terminal approach above when debugging a launch
failure.

Wait on readiness rather than sleeping (curl, not chrome-devtools — no
browser needed yet, and a tight polling loop through browser tool calls just
adds round-trip overhead):

```bash
until curl -s -o /dev/null --max-time 2 localhost:8080/api/webcontent/pages/home \
   && curl -s -o /dev/null --max-time 2 localhost:5173/; do sleep 2; done
```

**H2 is in-memory.** Restarting the backend resets to the Liquibase seed — the
cheapest way to get clean data after probes pollute it. Seeded pages: `home`(100),
`news`(200), `about`(300), `privacy`(400), `imprint`(500), `contact`(600).

## Authenticate

Form login is disabled; auth is a session cookie from a JSON POST. There is no
login button in the public nav — get the session via the API.

curl:
```bash
J=/tmp/cookies.txt
curl -s -c $J -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' -H 'X-Requested-With: XMLHttpRequest' \
  -d '{"login":"admin","password":"admin"}'
curl -s -b $J localhost:8080/api/webcontent/articles/page/home
```

Browser — use `chrome-devtools_navigate_page` to :5173 first (so the cookie binds
to that origin), then `chrome-devtools_evaluate_script` to run the same login
call. There is no login UI to drive against, so this stays a scripted fetch
rather than filling a form:
```js
() => fetch('/api/auth/login', {method:'POST',
  headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
  credentials:'include', body:JSON.stringify({login:'admin',password:'admin'})})
```
Confirm the cookie actually got set — don't just trust that the fetch resolved —
with `chrome-devtools_list_network_requests` / `get_network_request` on the
`/api/auth/login` response and check for `Set-Cookie`. This catches a silent 401
that a status-blind assertion would miss.

Mutating endpoints return 401 without the cookie; only `/published`, `/pages/**`
and image downloads are public.

## Drive

- **Public pages** — `localhost:5173/`, `/news`, `/about`, `/contact`. Rendering
  dispatches on `article.articleType`; an article with a null or unhandled type
  silently renders nothing, so check the type when a page looks empty. The enum
  is mid-refactor (has a `@TODO: refactor this to articleType` comment) — check
  `ArticleType.java` and the dispatch component directly rather than trusting a
  hardcoded list of values here, it will go stale again.
- **Admin pages** — `localhost:5173/webcontent/page/{home,news,about,privacy,imprint,contact}`.
  Protected routes render **blank** when unauthenticated, not a redirect — a white
  page usually means the cookie is missing, not a crash.
- Admin table interaction loop: `chrome-devtools_resize_page` to ~1500x900 (the
  action buttons are off-screen at default width — a screenshot here is worth it
  to confirm the resize actually revealed them) → `chrome-devtools_take_snapshot`
  → act on the returned `uid`s with `click`/`fill`/`fill_form` → re-snapshot
  before reusing a `uid` after any mutation, since uids go stale once the DOM
  changes.
- `contact` was split into `contact`/`vetinfo`/`notification` modules, and a new
  `questionair` domain exists — no verification recipes for these yet, just
  flagging they exist if you need to look.

Useful assertion pattern — compare what the UI shows against what the server has,
in one call, to catch client/server divergence (article sort order is now
settable, so don't assume seed order matches display order — this is comparing
against whatever the server currently reports, not the CSV seed):
```js
() => {
  const ui = [...document.querySelectorAll('tr.tr-expandable')].map(r => r.querySelectorAll('td')[0].textContent);
  return fetch('/api/webcontent/articles/page/home').then(r => r.json()).then(a => a.map(x => x.order));
}
```
Run via `chrome-devtools_evaluate_script`.

## Gotchas

- **`chrome-devtools_fill` with an empty string does not fire React's onChange.**
  The DOM value clears but component state keeps its previous value, so the form
  submits stale data. This looks exactly like an app bug. To genuinely clear a
  controlled input: focus the `uid` (e.g. via `click`), then
  `chrome-devtools_press_key` with `Control+a`, then `Backspace`.
- **Snapshot `uid`s go stale after any DOM mutation.** Re-run `take_snapshot`
  before reusing a `uid` from before a click/fill/navigation — a stale uid
  fails or silently targets the wrong element.
- **`evaluate_script`'s `waitForStableDom` defaults to `true`**, which adds
  latency to simple read-only checks (status polling, reading a value). Pass
  `waitForStableDom: false` for those.
- **Multiple open pages need explicit targeting.** `pageId` (or `select_page`)
  determines which tab a tool call acts on — don't assume a call lands on the
  tab you're looking at; check `list_pages` if in doubt.
- Writing scratch files (snapshots, dumps) into the repo pollutes `git status` —
  use a temp dir outside the working tree.
- `./gradlew spotlessApply` reformats the **whole** codebase — run it, then
  check `git status`/`git diff` for changes outside what you touched before
  committing, and revert anything unrelated.
- Killing the backend: `kill $(ss -ltnp | grep ':8080' | grep -oP 'pid=\K[0-9]+')`.
  `pkill -f bootRun` catches the Gradle wrapper but leaves the forked JVM holding
  the port. This kill command can report a non-zero/odd shell exit code even when
  it succeeds — check `ss -ltnp | grep :8080` (or the combined check below) instead
  of trusting the exit code.
- Killing the frontend: `pkill -f vite` — the `npm run dev` wrapper doesn't hold
  the port itself, `vite` does.
- Confirm both are down: `ss -ltnp | grep -E ':8080|:5173' || echo "both ports free"`.

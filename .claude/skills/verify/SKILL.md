---
name: verify
description: Build, launch and drive the tg-app backend + tg-web frontend to observe a change at runtime. Use when verifying webcontent/article/customer/contact changes end-to-end.
---

# Verifying tg-app + tg-web

Most changes here span both repos (`/home/daniel/Workspace/tg-app` backend,
`/home/daniel/Workspace/tg-web` frontend). Verify through the running stack, not
either half alone.

## Launch

Both in background; they take ~10s and ~1s respectively.

```bash
cd /home/daniel/Workspace/tg-app && ./gradlew bootRun    # :8080, dev profile, H2
cd /home/daniel/Workspace/tg-web && npm run dev          # :5173, proxies /api -> :8080
```

Wait on readiness rather than sleeping:

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

Browser (run on a page already loaded from :5173 so the cookie binds to that origin,
then navigate to the admin route):
```js
await fetch('/api/auth/login', {method:'POST',
  headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
  credentials:'include', body:JSON.stringify({login:'admin',password:'admin'})});
```

Mutating endpoints return 401 without the cookie; only `/published`, `/pages/**`
and image downloads are public.

## Drive

- **Public pages** — `localhost:5173/`, `/news`, `/about`, `/contact`. Rendering
  dispatches on `article.articleType` (HERO/COL2/COL3/COL4/TEXT); an article with a
  null type silently renders nothing, so check the type when a page looks empty.
- **Admin pages** — `localhost:5173/webcontent/page/{home,news,about,privacy,imprint,contact}`.
  Protected routes render **blank** when unauthenticated, not a redirect — a white
  page usually means the cookie is missing, not a crash.
- Resize to ~1500x900; the admin table's action buttons are off-screen at default width.

Useful assertion pattern — compare what the UI shows against what the server has,
in one call, to catch client/server divergence:
```js
const ui = [...document.querySelectorAll('tr.tr-expandable')].map(r => r.querySelectorAll('td')[0].textContent);
const server = (await (await fetch('/api/webcontent/articles/page/home')).json()).map(a => a.order);
```

## Gotchas

- **`fill` with an empty string does not fire React's onChange.** The DOM value
  clears but component state keeps its previous value, so the form submits stale
  data. This looks exactly like an app bug. To genuinely clear a controlled input,
  focus it and send `Control+A` then `Backspace`.
- Writing scratch files (snapshots, dumps) into either repo pollutes `git status` —
  use a temp dir outside the working trees.
- `./gradlew spotlessApply` reformats the **whole** codebase. The `contact` module
  is committed unformatted, so a blanket run silently adds unrelated churn to your
  diff. Format only what you touched, or revert the rest.
- Killing the backend: `kill $(ss -ltnp | grep ':8080' | grep -oP 'pid=\K[0-9]+')`.
  `pkill -f bootRun` catches the Gradle wrapper but leaves the forked JVM holding
  the port.

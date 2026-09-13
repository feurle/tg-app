# Plan: Auth-State nach Seiten-Reload wiederherstellen

## Context
`authStore` hält den eingeloggten User nur im Memory (`let _user = null`). Bei einem Hard-Reload (F5 / direkte URL) wird der Modulstate zurückgesetzt → `isAuthenticated = false` → `ProtectedRoute` leitet sofort zur Startseite weiter, obwohl der Session-Cookie noch gültig ist.

Lösung: Beim App-Start `/api/auth/me` aufrufen. Gibt es einen User zurück, wird `authStore` befüllt. Bis die Antwort da ist, zeigt `ProtectedRoute` einen Ladeindikator statt sofort weiterzuleiten.

---

## Änderungen (3 Dateien)

### 1. `src/features/auth/authStore.ts`
- `_loading = true` hinzufügen (initial true, bis init() abgeschlossen)
- `init()`: ruft `/api/auth/me` auf → bei Erfolg `_user` setzen, bei 401 nichts tun → `_loading = false`
- `useAuth()` gibt `isLoading` zurück

### 2. `src/router/ProtectedRoute.tsx`
Solange `isLoading` true: null rendern, nicht redirecten.

### 3. `src/main.tsx`
`authStore.init()` direkt beim Modul-Import aufrufen.

---

## Verifikation
1. Einloggen → `/webcontent/images` aufrufen → funktioniert
2. Seite neu laden (F5) → kurz null → Seite bleibt auf `/webcontent/images`
3. Ohne Session (kein Cookie) → Reload → Redirect zur Startseite

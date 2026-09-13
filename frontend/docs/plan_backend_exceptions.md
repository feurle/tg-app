# Plan: Backend-Fehlermeldung extrahieren

## Context
Backend liefert bei Fehlern JSON wie `{"error":"...","message":"An error occurred...","status":500,"timestamp":"..."}`.
`apiClient.ts` liest den Body aktuell als Rohtext (`response.text()`) und übergibt das gesamte JSON-String als `ApiError.message`. Im Frontend wird dadurch das gesamte JSON angezeigt statt nur der `message`-Wert.

## Änderung: `src/lib/apiClient.ts` (Zeile 21–23)

```ts
if (!response.ok) {
  const body = await response.text().catch(() => '');
  let message: string;
  try {
    const json = JSON.parse(body);
    message = json.message ?? body || response.statusText;
  } catch {
    message = body || response.statusText;
  }
  throw new ApiError(response.status, message);
}
```

- JSON parsen → `message`-Feld extrahieren
- Falls kein JSON oder kein `message`-Feld → Rohtext
- Falls Rohtext leer → `response.statusText` als Fallback

## Verifikation
Backend-Fehler (z.B. DB-Constraint 500) → Frontend zeigt nur `"An error occurred while processing your request"` statt dem gesamten JSON

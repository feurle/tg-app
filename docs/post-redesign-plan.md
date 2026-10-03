# Plan: Nacharbeit nach Phase 1–6, Content-Lücken schließen, Admin-Bereich ausbauen

## Context
Alle sechs Design-Phasen sind auf `feature/ui-foundation-tokens` umgesetzt (9 Commits, noch nicht gepusht). Vor dem PR sollen die Lücken geschlossen werden, die bei der Umsetzung offen geblieben sind: leere Seiten, Datenschutz, Admin-Pflege der Inhalte, ungeprüfte Bereiche.

Entscheidungen aus der Rückfrage:
- **Push/PR erst nach der Nacharbeit.** Ein PR, mehrere Commits (je Arbeitspaket einer).
- **Admin-Umfang:** Seiten Behandlungen und Für Tierärzte, Rich-Text für Abschnitte, Bilder gezielt zuordnen, Hilfetexte und Labels je Artikeltyp, Artikel in andere Sprache kopieren, Schreibrechte nur für ADMIN, echte Vorschau.
- **Inhalte:** Ich lege deutsche Entwürfe als Seed an, klar als Entwurf markiert. Die Ärztin überarbeitet sie. Die Datenschutz-Ergänzung braucht eine rechtliche Prüfung.
- **Prod-Persistenz:** Wird separat geklärt, ich ändere sie nicht (siehe Voraussetzung unten).

## Voraussetzung (nicht Teil der Umsetzung, aber entscheidend)
**Produktion löscht die Datenbank bei jedem Start.** Dev, Test und Prod haben `liquibase.drop-first: true` und den Kontext `seed` (`src/main/resources/application.yaml` Zeilen 85/86, 115/116, 150/151). Alles, was im Admin-Bereich gepflegt wird (auch Sprechzeiten), ist nach dem nächsten Deploy weg. Solange das so ist, bringt die Admin-Erweiterung produktiv nichts, und Content landet nur über die Seed-CSVs in Produktion. Das muss vor dem Go-live entschieden werden (Persistenz in Prod, MySQL-Volume und Backup prüfen).

---

## A. Antworten auf deine Fragen

### A1. Was ist noch nicht geprüft?
| Bereich | Stand |
|---|---|
| Liquibase `vetinfo/002`, `003`, `questionnaire/002` auf **MySQL** | Nie ausgeführt. Tests laufen nur auf H2, CI hat keinen MySQL-Service. Erster Lauf wäre Staging. Risiko: `DELETE` + `dropColumn` + `addColumn TIME NOT NULL`. |
| **Echter SMTP-Versand** (Kontakt, Termin, Überweisung, Erhebungsbogen) | Nur gegen lokalen Mail-Sink geprüft. SPF/DKIM, Zustellung, Spam-Ordner offen. |
| **Deep-Links/Reload** (`/treatments`, `/for-vets` direkt aufrufen) | Nicht bestätigt: im Java-Code gibt es keine SPA-Weiterleitung, `SecurityConfig` erlaubt nur `/` und `/index.html`. Auf Staging testen. |
| **Admin-Seiten unter den neuen Tokens** | Nur Kontaktdaten-Formular und Erhebungsbogen-Liste angesehen. Kunden, Benutzer, Bilder, Tags, Artikelverwaltung, Login-Modal nicht. |
| **About, News, Datenschutz, Impressum** | Nicht neu gestaltet und nicht visuell geprüft. About und News nutzen noch alte Klassen (`about-*`, `news-page-eyebrow` in Versalien). |
| Navigation **zwischen 900 und 1240 px** und Tablet | Nur 1280 und 390 px gesehen. |
| Barrierefreiheit, Performance | Kein Lighthouse-Lauf, kein Tastatur-/Fokus-Test, kein Screenreader-Test. |
| Sprachwechsel auf jeder Seite | Nur Deutsch geprüft. |
| Ladeplatzhalter im Kontaktbereich | Code vorhanden, nie bei langsamer Verbindung gesehen. |
| Frontend-Tests | Es gibt keinen Test-Runner. Alles Frontend-seitige ist nur manuell geprüft. |
| Echte Geräte, andere Browser (Safari, Firefox) | Nur Chromium. |

### A2. Offene Punkte je Phase
- **Phase 1 (Tokens/Figtree):** Figtree kommt von Google Fonts, das widerspricht dem Datenschutztext. `<html lang="en">` und statischer Titel „Tier Gesund“ in `frontend/index.html`. Toter CSS-Rest (`.service-card`, `.editorial*`, `.article-card-*`, Versalien-Eyebrows `.section-eyebrow`, `.news-page-eyebrow`).
- **Phase 2 (Navigation/Behandlungen):** Seite „Behandlungen“ hat keinen Inhalt und keinen Admin-Zugang. Fragebogen ist nur von „Behandlungen“ aus erreichbar. Statuszeile „Jetzt geöffnet“ aktualisiert sich nicht.
- **Phase 3 (Home):** Seed-Texte sind meine Entwürfe und müssen von der Ärztin gegengelesen werden. Gold-Foto nur 300 px breit, die dritte Methode hat kein Bild. Bild-zu-Abschnitt-Zuordnung läuft nach aufsteigender Bild-ID (fragil, siehe WP5). Hero nutzt dasselbe Porträt wie die Über-uns-Seite. EN/SV/RU: keine Inhalte geseedet, Seiten bleiben dort leer (siehe A4).
- **Phase 4 (VetInfo):** Migration löscht bestehende Sprechzeiten. `changeSet id 004` steht in Datei `002` (verwirrend, nicht ändern, sobald Persistenz existiert). `GET /api/vetinfo` (Liste) ist in Produktion nur für angemeldete Benutzer, der Test `getAllVetInfo_isPublic_withoutAuth` ist irreführend, weil er die Security-Filter nicht anwendet. Mobilnummer nur im Impressum. Zeitfeld im Admin zeigt je nach Browser 12 h.
- **Phase 5 (Überweisung):** Kein Spamschutz auf allen vier öffentlichen POST-Endpunkten (`/api/contact/message`, `/appointment`, `/referral`, `/api/questionnaire`): kein Rate-Limit, kein Honeypot, kein Captcha, CSRF ist abgeschaltet. Die Bestätigungsmail an eine frei eingegebene Adresse ist ein Spam-Vektor. Kein Datei-Upload (bewusst v1). Mail-Texte nur Deutsch. `for-vets` hat keinen CMS-Inhalt.
- **Phase 6 (Fragebogen):** Titel und Einleitung „Verhaltensberatung“ unverändert, passt evtl. nicht für Katzen und Kleintiere. Maschinelle Übersetzungen (SV/RU) ungeprüft. Bestehende Einsendungen gelten als „Hund“.
- **Kontaktseite/Navigation:** Kein „Kontakt“ in der Navbar (nur Footer). Leere Admin-Reste sind entfernt.

### A3. Was ist nach der Implementierung zu beachten?
1. **Prod-Persistenz klären** (siehe Voraussetzung), **bevor** Inhalte im Admin gepflegt werden.
2. **Release:** Alle Commits sind `feat`, der Merge löst nach `trunk` einen **Minor-Release (1.1.0)** aus. Changelog-Einträge stehen unter `[Unreleased]`.
3. **Staging-Deploy startet beim Push** (`feature/**` → Tag `snapshot`). Dort zuerst MySQL-Migrationen, SMTP, Deep-Links und Admin-Pflege prüfen.
4. **Sprechzeiten und Inhalte** in Staging/Prod neu eingeben, falls DB nicht persistent ist.
5. **Rechtliches:** Datenschutz-Ergänzung (WP1) von der Praxis oder einem Juristen prüfen lassen, bevor live. Hinweis auf Gesundheitsdaten Dritter im Überweisungsformular.
6. **Texte freigeben:** Home-Seed, Behandlungen, Für Tierärzte, Über mich, Hero-Statement durch Dr. Feurle-Elsäßer.
7. **Bilder:** höher aufgelöstes Gold-Foto, Foto für „Ganzheitliche Betreuung“; große Bilder liegen als Base64 in der DB (Hero 168 KB).
8. **Alte Spezifikation** `docs/superpowers/specs/2026-07-30-cta-block-design.md` (CTA-Artikeltyp) ist veraltet (verweist auf `tg-web`, `ForPetOwnersPage`). Entweder aktualisieren oder als überholt markieren; `ContactButton` ist weiterhin in 7 Komponenten hart verdrahtet.

### A4. Fehlen Seiten, Sections, Content?
| Was | Stand | Lösung im Plan |
|---|---|---|
| Behandlungen: Methoden im Detail, Ablauf | Seite hat Überschrift + Fragebogen-CTA, kein CMS-Inhalt, Slug `treatments` nicht geseedet, nicht im Admin | WP2, WP3 |
| Für Tierärzte: Wann überweisen, Ablauf, Rückmeldung | Nur Formular, Slug `for-vets` nicht geseedet, nicht im Admin | WP2, WP3 |
| Über mich | Text noch in Wir-Form („Unsere Mission“) | WP2 (Entwurf in Ich-Form) |
| Datenschutz | Erwähnt weder Erhebungsbogen, Überweisung, Termin, Google Maps noch Mail-Versand; behauptet „keine Dritten“, lädt aber Google Fonts | WP1 |
| 404-Seite, Fehlerseite | Keine (`path: '*'` und `errorElement` fehlen) | WP1 |
| EN/SV/RU-Inhalte | Alle Seed-Artikel sind `GERMAN`, Seiten bleiben leer | WP2 (Fallback auf Deutsch) |
| Notfall-/Außerhalb-Sprechzeit-Hinweis | Nicht vorhanden | Offen, mit der Praxis klären |
| Foto Praxis/Team, weitere Methodenbilder | Nur Chiro, Gold, Porträt vorhanden | Content-Aufgabe der Praxis |
| Preise/FAQ/Erfahrungsberichte | Nicht vorhanden, nicht beauftragt | Nur nennen |

---

## B. Arbeitspakete (Reihenfolge, je ein Commit)

### WP1 – Blocker vor dem PR
- **Schrift selbst hosten:** Figtree als WOFF2 (`@fontsource/figtree` oder Dateien in `frontend/public/fonts/`) + `@font-face` in `frontend/src/styles/variables.css`/`global.css`; Google-Links und `preconnect` aus `frontend/index.html` entfernen. Danach stimmt die Aussage „keine Dritten“.
- **`lang`, Titel, Beschreibung:** `frontend/src/i18n/LanguageSync.tsx` setzt `document.documentElement.lang`; `index.html` Standard `de`; kleiner Hook `usePageTitle` je Seite; Meta-Description in `index.html`.
- **404 und Fehlerseite:** Catch-all-Route und `errorElement` in `frontend/src/router/index.tsx`, eigene Seite in `pages/public/`.
- **Datenschutz-Ergänzung** (Entwurf, deutsch) in `src/main/resources/db/data/section_de.csv` (Artikel 400): Kontakt-, Termin- und Überweisungsformular, Erhebungsbogen (Gesundheitsdaten), Mailversand/SMTP, Google-Maps-Link (nur bei Klick), Speicherdauer. Als „rechtlich zu prüfen“ markieren.
- **Spamschutz minimal:** Honeypot-Feld + einfaches IP-Rate-Limit (in-memory Filter) für die vier öffentlichen POSTs. Ort: neuer Filter unter `user/infrastructure/config/` oder `common/`, Tests per IT.
- **Tests ehrlich machen:** `VetInfoControllerIT` mit `springSecurity()` bauen; `GET /api/vetinfo/primary` öffentlich, Liste/`{id}` 401 ohne Login; irreführenden Testnamen korrigieren.

### WP2 – Seiten, Seeds und gemeinsame Rendering-Bausteine
- **Seeds** in `src/main/resources/db/data/`: `page.csv` (+ `treatments` id 700, `for-vets` id 800), `article_de.csv`, `section_de.csv`. Deutsche Entwürfe, in den Beschreibungen als „Entwurf“ markiert, aus vorhandenen Texten abgeleitet (Chiropraktik-, Goldimplantations-, Blutegel-Artikel, Therapieangebot der Über-uns-Seite). Keine neuen medizinischen Aussagen erfinden.
  - Behandlungen: Intro, Schwerpunkte (`METHODS`), Ablauf (`STEPS`).
  - Für Tierärzte: Intro (Indikationen aus vorhandenen Texten), Rückmeldung/Befunde.
  - Über mich: Artikel 300 in Ich-Form anpassen.
- **Gemeinsamer `PageBlocks`-Renderer** (`features/webcontent/components/PageBlocks.tsx`) + Hook `usePublishedArticles(slug)`: ersetzt die vier duplizierten Fetch-und-Dispatch-Blöcke in `PublicPage.tsx`, `TreatmentsPage.tsx`, `ForVetsPage.tsx`, `AboutPage.tsx`. Danach rendern alle Seiten alle Artikeltypen (heute kennen Behandlungen/Für Tierärzte die neuen Typen nicht).
- **Fallback auf Deutsch:** Gibt es für EN/SV/RU keinen Artikel, lädt der Hook die deutschen und zeigt einen kleinen Hinweis (neuer i18n-Key).
- Fragebogen im Footer verlinken (`layout/Footer.tsx`).

### WP3 – Admin: Seiten dynamisch
- **Backend:** `GET /api/webcontent/pages` (Liste, nur angemeldet) in `WebContentController` über das vorhandene `PageService.getAllPages()` und `PageMapper`. Kein Anlegen/Löschen: für neue Slugs gibt es keine öffentliche Route, das wäre toter Code.
- **Frontend:** `pageApi.getAll` in `features/webcontent/api.ts`; `layout/Sidebar.tsx` baut „Seiten“ aus der API; eine dynamische Route `/webcontent/page/:slug` statt der fünf festen Einträge in `router/index.tsx` und `router/routes.ts`; `ArticlesPage` liest den Slug aus der URL.
- OpenAPI-Typen neu erzeugen (`npm run generate:api`, Datei ist gitignored).

### WP4 – Admin: Abschnitte mit Rich-Text und Sortierung
- `SectionFormModal.tsx`: Textarea durch den vorhandenen `RichTextEditor` ersetzen.
- Rendering anpassen: Abschnittsinhalt in `<div>` statt `<p>` (sonst `<p>` in `<p>`), betrifft `SymptomsComponent`, `StepsComponent`, `MethodsComponent`, `HeroPortraitComponent`.
- Abschnitte sortieren: `PUT /api/webcontent/sections/{id}/move` (Muster: Artikel-Move in `ArticleService` und `ArticleOrderingIT`), Hoch/Runter-Knöpfe in `ArticleTable.tsx`.

### WP5 – Admin: Bilder gezielt zuordnen
Heute: `article_images` hat keine Reihenfolge, `MethodsComponent` paart nach aufsteigender Bild-ID.
- **Neu:** Optionales Bild **am Abschnitt** (`section.image_id`, FK auf `image`, `ON DELETE SET NULL`). Liquibase-Changeset in `db/changelog/webcontent/`, `Section`-Entity, `SectionResponse` (+`image`), `CreateSectionRequest`/`UpdateSectionRequest` (+`imageId`).
- Frontend: `MethodsComponent` nutzt `section.image` statt Index-Paarung; Bildauswahl mit Vorschau in `SectionFormModal` und Vorschaubilder in der Bildliste von `ArticleFormModal`.
- Seed anpassen: Abschnitte 110/111 bekommen Bild 4/5, `article_images`-Zeilen für 110 entfallen.
- Hero- und Über-mich-Bild bleiben beim Artikel (`article.images[0]`).

### WP6 – Admin: Typ-Hilfen und Labels
- Alle `article.pageType.*`-Labels vollständig in de/en/sv/ru (heute: COL2, COL3, COL4, TEXT fehlen in de, ein Block fehlt komplett in en/sv/ru).
- Hilfetext je Typ unter dem Typ-Feld in `ArticleFormModal.tsx` (z. B. `HERO_PORTRAIT`: Titel = Überschrift, Inhalt = Unterzeile, 1. Abschnitt = Ich-Statement, 1. Bild = Porträt). Zentrale Map Typ → i18n-Key.

### WP7 – Admin: Kopieren, Rechte, Vorschau
- **In Sprache kopieren:** `POST /api/webcontent/articles/{id}/copy?language=…` in `ArticleService` (Artikel, Abschnitte, Bilder, Tags, Status `CREATED`, ans Ende der Seite). Knopf in `ArticleTable.tsx`.
- **Schreibrechte nur ADMIN:** `@PreAuthorize("hasRole('ADMIN')")` auf alle schreibenden Methoden in `WebContentController` (heute reicht jeder angemeldete Benutzer, auch `ROLE_USER`). Bestehende ITs (`WebContentControllerIT`, `ArticleOrderingIT`, `TagControllerIT`) auf `roles = "ADMIN"` umstellen, neue Tests für 403 bei `ROLE_USER`.
- **Echte Vorschau:** Route `/webcontent/page/:slug/preview?lang=…` im Admin-Layout, rendert `PageBlocks` mit allen Artikeln der Seite inkl. Entwürfen (die Admin-Abfrage `GET /pages/{slug}` liefert bereits alle Status und Sprachen). Knopf „Vorschau“ im Kopf von `ArticlesPage`. Beim Einzelartikel ein Modal mit demselben Renderer.

### WP8 – Aufräumen, Doku, Übersetzungen
- **Toter Code entfernen** (laut Grep ohne Import): `ServiceCard.tsx`, `EditorialBlock.tsx`, `ArticleCard.tsx`, `frontend/src/App.css`, `frontend/tg-layout-preview.jsx`, `assets/logo-footer.png`, `assets/react.svg`, `public/vite.svg` samt zugehörigem CSS (`.editorial*`, `.article-card-*`, `.service-card`).
- **Alte Optik:** About, News, Datenschutz, Impressum auf `public-page-header` und Tokens umstellen; Versalien-Eyebrows (`.section-eyebrow`, `.news-page-eyebrow`) entfernen oder in i18n legen (`Col3Component`/`Col4Component` haben „Leistungen“/„Kontakt“ hart verdrahtet).
- **i18n-Lücken** in en/sv/ru: `nav.about`, `nav.privacy`, `nav.imprint`, `nav.sidebar.pages`, `home.articles.sub`, `section`.
- **Doku:** `frontend/README.md` (derzeit Vite-Vorlage) mit Struktur, Routen, Artikeltypen; `README.md` (Seed-Beschreibung); `AGENTS.md` (Home-Typen ohne `COL4`, Admin-Seitenliste dynamisch, neue Endpoints); `docs/ui-design.md` (Roadmap als erledigt markieren, Schriftquelle); CTA-Spezifikation als überholt kennzeichnen. Changelog-Einträge je Arbeitspaket.

### WP9 – Abschlusstest und PR
- Alles, was in A1 als ungeprüft steht, abarbeiten, soweit lokal möglich: Lighthouse (Chrome-DevTools-MCP) für Home, Behandlungen, Für Tierärzte, Kontakt, Fragebogen; Tastatur-/Fokus-Prüfung; Breiten 360, 768, 1024, 1100, 1280; Sprachwechsel; Admin-Rundgang mit Login `admin`/`user`.
- Danach **Branch pushen und PR öffnen**, mit der Liste der offenen Punkte (Prod-Persistenz, MySQL, SMTP, Texte freigeben, Datenschutz prüfen) in der Beschreibung.

---

## Wiederverwendung (vorhanden, nicht neu bauen)
- `RichTextEditor` (tiptap) in `features/webcontent/components/` für Abschnitte.
- `PageService.getAllPages/…`, `PageMapper` für die Seitenliste.
- Move-Muster: `ArticleService` + `ArticleOrderingIT` für die Abschnitts-Sortierung.
- `imageApi.getDownloadUrl` für Bildvorschauen.
- `ContactSection`, `useVetInfoState`, `OpenStatusLine` unverändert.

## Verifikation
- `./gradlew spotlessApply test` und `cd frontend && npx tsc -b && npm run lint && npm run build` nach jedem Paket.
- Laufendes System (`./gradlew bootRun` + `npm run dev`, Chrome-DevTools-MCP): Admin-Rundgang als `admin` (alles bearbeitbar, Vorschau, Kopieren, Bild-Zuordnung, Abschnitte sortieren) und als `user` (Schreiben → 403); öffentliche Seiten in DE und EN (Fallback-Hinweis); 404-Seite; Seitenquelltext auf `lang`, Titel und fehlende Google-Requests prüfen (Network-Tab ohne `fonts.googleapis.com`); Rate-Limit per wiederholtem POST auslösen.
- Lokalen Mail-Sink wie bei Phase 5 für Formular-Mails verwenden.
- Auf Staging (nach Push, vor Merge): MySQL-Migrationen, SMTP, Deep-Link-Reload von `/treatments`.

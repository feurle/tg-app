# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.1.2] - 2026-10-24

### Added

- Frontend-Tests mit Vitest und React Testing Library (`npm test`), zuerst für `officeHours.ts` (Öffnungsstatus in Wiener Zeit), `apiClient.ts` und `HoneypotField`. Die CI führt sie nach dem Lint aus.
### Changed

- `home.cta.primary` ist jetzt auch auf Englisch, Schwedisch und Russisch „Termin anfragen“ (wie im Deutschen). Die Übersetzungen entsprechen den vorhandenen Formulartexten und sind von Muttersprachlern zu prüfen.

### Removed

- Ungenutzte Übersetzungsschlüssel (u. a. `home.cta.*`, `home.title.*`, `home.subtitle`, `nav.home`, `nav.articles`, `pages.home`, `pages.about`, `about.subtitle`, leere Spaltentitel `*.col.actions`) aus allen vier Sprachdateien entfernt.

### Fixed

- Image-Build in der CI: Der Paketo-Builder ist auf eine Version festgelegt, weil sein `latest`-Tag nur noch für arm64 veröffentlicht wurde (`exec format error` auf dem amd64-Runner).
- Neuladen, Lesezeichen und Links aus Bestätigungsmails auf Unterseiten wie `/treatments` liefern nicht mehr 401, sondern die Seite (Weiterleitung auf `index.html`). `bootRun` liest Werte mit Anführungszeichen oder `=` in `.env` korrekt ein.
- Chiropraktik-Seite: Pferde-Texte aus dem Seed entfernt (Abschnitt „Beweglichkeit beim Pferd“, Pferde-Beispiele bei „Wann soll mein Tier zum Chiropraktor?“).
- Die Statuszeile „Jetzt geöffnet“ aktualisiert sich jede Minute und kippt zur Öffnungs- und Schließzeit um.
- Zeitfelder (Sprechzeiten im Admin, gewünschte Uhrzeit im Terminformular) zeigen immer die 24-Stunden-Schreibweise `HH:mm`, unabhängig von der Browser-Sprache.

## [1.1.1] - 2026-10-24

### Fixed

- Image-Build in der CI: Der Paketo-Builder ist auf eine Version festgelegt, weil sein `latest`-Tag nur noch für arm64 veröffentlicht wurde (`exec format error` auf dem amd64-Runner).

## [1.1.0] - 2026-10-17

### Added

- Entwürfe für die Inhalte der Seiten „Behandlungen“ (Chiropraktik, Goldimplantation, Blutegeltherapie, Ablauf), „Für Tierärzte“ (Überweisungsgründe, Angebot, Ablauf) und „Über mich“ (Ich-Form, Mission). Sie sind aus den vorhandenen Texten abgeleitet und von Dr. Feurle-Elsäßer zu prüfen. Die Seiten `treatments` und `for-vets` sind als CMS-Seiten angelegt.
- Spamschutz für die öffentlichen Formulare (Nachricht, Termin, Überweisung, Erhebungsbogen): ein unsichtbares Feld, das Bots verrät (solche Einsendungen werden verworfen), und eine Begrenzung auf 5 Einsendungen pro Adresse und 10 Minuten (konfigurierbar über `app.rate-limit.*`, Antwort 429).
- Eigene 404-Seite und eine Fehlerseite statt einer weißen Seite, wenn eine Seite nicht angezeigt werden kann. Seitentitel passen sich Seite und Sprache an, `<html lang>` folgt der gewählten Sprache, und die Startseite hat eine Meta-Beschreibung.
- Überweisungsformular für Tierärzte auf `/for-vets`: Praxis, Tierhalter, Patient, Fragestellung, Vorbehandlung und Dringlichkeit; die Praxis bekommt eine Mail (Antworten gehen direkt an den überweisenden Tierarzt), der Tierarzt eine Bestätigung. Es werden keine Gesundheitsdaten gespeichert. Befunde werden weiterhin per E-Mail nachgereicht. Neuer öffentlicher Endpoint `POST /api/contact/referral`.

### Changed

- Termin- und Nachrichtenformular sind eigene Seiten (`/appointment`, `/message`) statt eines Modals. Die Buttons in Navigation, Hero und Kontaktbereich verlinken dorthin und heißen einheitlich „Termin anfragen“. Termin, Nachricht, Überweisung und Erhebungsbogen teilen sich dieselben Formular-Bausteine und dasselbe Seitenlayout; Fehlermeldungen nennen die Telefonnummer der Praxis, und die Bestätigung nach dem Senden nimmt den Fokus.

- Barrierefreiheit und Ladeverhalten: Telefon- und E-Mail-Links in Kontaktbereich und Footer haben ausreichend große Trefferflächen, die Felder im Erhebungsbogen sind mit ihren Beschriftungen verknüpft (Lighthouse Accessibility 100 auf Start, Behandlungen, Für Tierärzte, Kontakt und Erhebungsbogen), der Ladeplatzhalter verhindert Layout-Sprünge des Footers, und der Hinweis „nicht übersetzt“ steht bündig mit dem Seitentitel.
- Aufräumen: ungenutzte Komponenten (`ServiceCard`, `EditorialBlock`, `ArticleCard`), Vorlagen-Reste (`App.css`, `vite.svg`, `react.svg`, `tg-layout-preview.jsx`, `logo-footer.png`) und zugehöriges CSS entfernt; Versalien-Überschriften („Leistungen“, „Kontakt“, News) entfernt. Über mich, Aktuelles, Datenschutz und Impressum nutzen jetzt denselben Seitenkopf und die Schrift-Tokens wie die übrigen Seiten. Fehlende Übersetzungen (Abschnitts-Admin, Seitenleiste) in Englisch, Schwedisch und Russisch ergänzt, tote Schlüssel entfernt. `frontend/README.md` beschreibt jetzt das Projekt statt der Vite-Vorlage.
- Admin-Bereich: Artikel lassen sich mit Abschnitten, Bildern und Tags als Entwurf in eine andere Sprache kopieren (`POST /api/webcontent/articles/{id}/copy?language=…`). Neue „Vorschau“ je Seite (`/webcontent/page/:slug/preview?lang=…`) zeigt die Seite wie für Besucher inklusive Entwürfen, das Auge-Symbol zeigt einen einzelnen Artikel mit denselben Bausteinen.
- **Sicherheit:** Alle schreibenden Webcontent-Endpoints (Artikel, Abschnitte, Bilder, Tags) verlangen jetzt `ROLE_ADMIN`; ein angemeldeter Benutzer mit nur `ROLE_USER` bekommt 403. Lesen bleibt für Angemeldete möglich.
- Admin-Bereich: Beim Artikelformular erklärt ein Hilfetext unter dem Seiten-Typ, wofür Titel, Inhalt, Abschnitte und Bilder dieses Typs auf der Seite verwendet werden. Die Typ-Bezeichnungen sind jetzt für alle Typen in Deutsch, Englisch, Schwedisch und Russisch vorhanden.
- Admin-Bereich: Bilder werden gezielt einem Abschnitt zugeordnet (Bildauswahl mit Vorschau im Abschnittsformular, neue Spalte `section.image_id`, `imageId` in den Abschnitts-Endpoints). Die Schwerpunkte auf der Startseite zeigen das Bild ihres Abschnitts statt einer Zuordnung nach Bild-ID; in der Bildliste des Artikelformulars gibt es Vorschaubilder.
- Admin-Bereich: Abschnitte werden mit dem Rich-Text-Editor gepflegt (Fett, Listen, Links) und lassen sich mit ↑/↓ in der Artikelliste sortieren (neuer Endpoint `PUT /api/webcontent/sections/{id}/move`). Die öffentlichen Seiten stellen formatierte Abschnitte korrekt dar. Das Feld „Reihenfolge“ im Abschnittsformular entfällt, neue Abschnitte kommen ans Ende.
- Admin-Bereich: Die Seitenliste in der Seitenleiste kommt jetzt aus der API (`GET /api/webcontent/pages`, nur mit Login) und eine einzige Route `/webcontent/page/:slug` bearbeitet jede Seite. Damit sind auch „Behandlungen“ und „Für Tierärzte“ pflegbar. Neue Seiten erscheinen automatisch.
- Alle CMS-Seiten (Start, Behandlungen, Für Tierärzte, Über mich, Aktuelles) werden über denselben Baustein gerendert (`PageContent`/`PageBlocks`). Dadurch funktionieren alle Artikeltypen auf jeder Seite. Gibt es für Englisch, Schwedisch oder Russisch noch keinen Inhalt, zeigt die Seite den deutschen Inhalt mit einem Hinweis statt einer leeren Seite. Der Erhebungsbogen ist jetzt auch im Footer verlinkt.
- Die Schrift Figtree wird jetzt von der eigenen Website ausgeliefert statt von Google Fonts (keine Verbindung zu Google beim Seitenaufruf). Die Datenschutzerklärung nennt jetzt Kontakt-, Termin- und Überweisungsformulare, den Erhebungsbogen, den Google-Maps-Link und den lokalen Speicher der Sprachwahl; sie sollte vor dem Go-live rechtlich geprüft werden.
- Kontaktseite zeigt nur noch die Kontaktdaten aus VetInfo, mit Seitenüberschrift und den Buttons „Termin anfragen“ und „Nachricht schreiben“. Das CMS-Pendant (Seite `contact` samt Artikel, Eintrag „Kontakt“ in der Admin-Seitenleiste und Seed-Daten) ist entfernt, der Link „Kontakt“ aus der Navbar ebenfalls; im Footer bleibt er.
- Erhebungsbogen: neues Pflichtfeld „Tierart“ (Hund, Katze, Kleintier, Anderes); Hundeschule und Kommandos werden nur bei Hunden abgefragt. Bisherige Einsendungen gelten als Hunde. Die Praxis-Mail nennt die Tierart, der Admin-Bereich zeigt sie in Liste und Detailansicht. Das Formular ist optisch an das neue Design angepasst.
- Kontaktdaten kommen jetzt aus einer Quelle (VetInfo): Hero (Telefon und „Heute geöffnet“), Kontaktbereich auf Home und Kontaktseite, Footer und der Anruf-Button der mobilen Leiste. Die Sprechzeiten sind strukturiert (Wochentag, von, bis) statt Freitext; das Admin-Formular hat dafür Wochentag-Auswahl und Zeitfelder. **Bestehende Sprechzeiten werden dabei gelöscht und müssen im Admin-Bereich neu erfasst werden.** Neuer öffentlicher Endpoint `GET /api/vetinfo/primary`. Das Impressum nennt jetzt „Holzackergasse 13".
- Neue Startseite: Hero mit Porträt von Dr. Feurle-Elsäßer, Beschwerdebilder, Schwerpunkte mit Fotos, „Über mich“-Teaser, Ablauf des ersten Termins und ein Band für überweisende Tierärzte. Dafür gibt es die neuen Artikeltypen `HERO_PORTRAIT`, `SYMPTOMS`, `METHODS`, `STEPS` und `VET_BAND` (im Admin-Bereich wählbar); die Inhalte bleiben im CMS pflegbar. Der Hero-Text nennt keine Pferde mehr.
- Öffentliche Navigation neu aufgebaut: Behandlungen · Über mich · Aktuelles mit festem Button „Termin anfragen“, dezentem Link „Für Tierärzte“ und auf dem Handy einer festen Termin-Leiste unten; das „Anfragen“-Dropdown entfällt. `/for-pet-owners` ist jetzt die Seite „Behandlungen“ (`/treatments`) und leitet weiter.
- Neues Design-Fundament „Bodensee & Holz“ (siehe `docs/ui-design.md`): zentrale Tokens für Farbe, Typografie (Figtree statt Lora/DM Sans), Abstände und Radien; fest codierte Farben und Schriften in `global.css` und den Formular-Modals durch Tokens ersetzt.

### Fixed

- Entwürfe und geschlossene Artikel waren über `GET /api/webcontent/pages/{slug}` auch ohne Login lesbar. Anonyme Besucher bekommen dort jetzt nur veröffentlichte Artikel, angemeldete Benutzer wie bisher alle.
- Öffentliche Seiten stürzten ab (weiße Seite), wenn in den Kontaktdaten die Telefonnummer fehlte. Kontaktbereich, Footer und Links berücksichtigen jetzt fehlende Angaben; ohne Kontaktdaten zeigt die Kontaktseite einen Hinweis auf die Formulare, und beim Laden wird Platz reserviert. Auf der Kontaktseite folgen auf die Überschrift jetzt Überschriften der zweiten Ebene.
- Neue Tags ließen sich nicht anlegen (Fehler 500), weil die automatisch vergebene ID mit den geseedeten Tags kollidierte. Tags, Abschnitte und Seiten vergeben neue IDs jetzt ab 1500, wie die übrigen Tabellen. Bei Abschnitten wäre derselbe Fehler ab dem hundertsten neuen Abschnitt aufgetreten (#88).

## [1.0.3] - 2026-09-26

### Changed

- Projektdoku für Coding-Agenten (bisher `CLAUDE.md`/`TODO.md`) in eine einzige `AGENTS.md` zusammengeführt; das `verify`-Skill liegt jetzt unter `.agents/skills/`, damit es auch von anderen Agenten als OpenCode genutzt werden kann.
- `tg-admin` nutzt jetzt Spring Boot 4.1.1.

### Fixed

- `./gradlew devAll` gibt die Ausgabe von Backend und Frontend jetzt zuverlässig im aufrufenden Terminal aus, statt sie im getrennten Gradle-Daemon verschwinden zu lassen.

## [1.0.2] - 2026-09-25

### Fixed

- CI: Test- und Prod-Deploy haben sich gegenseitig den App-Container entfernt (`docker compose ... --remove-orphans` sah den jeweils anderen Container als verwaist an, sobald dessen Compose-Datei nicht mitgeladen war).

## [1.0.1] - 2026-09-25

### Added

- `./gradlew devAll` startet Backend (`bootRun`) und Frontend-Dev-Server (`npm run dev`) parallel in einem Terminal.

### Changed

- Frontend und Backend laufen jetzt in einem Container: Spring Boot baut und liefert das React-Frontend selbst aus (`docs/adr/0001-single-container-deployment.md`).
- Abhängigkeiten aktualisiert: Gradle 9.8.0, Spring Boot 4.1.1, Spring Modulith 2.1.1, Spring Boot Admin Client 4.1.3, Spotless 8.10.2, SonarQube-Plugin 7.5.0.8588; Frontend auf Vite 8, ESLint 10, i18next 26/react-i18next 17, React 19.3, react-router-dom 7.18 sowie weitere kleinere Bumps (TypeScript bleibt auf 5.x, da `typescript-eslint` TypeScript 7 noch nicht unterstützt).

### Removed

- Separates `tg-web`-Image, dessen Dockerfile/nginx-Config und den zweiten Deploy-Workflow (`frontend-deploy.yml`).

### Fixed

- CI: `docker compose up` bezieht jetzt auch `services.yml` (`tg-database`, `tg-admin`) mit ein, damit `--remove-orphans` diese Container nicht mehr fälschlich löscht und dadurch der Health Check mit 502 fehlschlägt.

### Security

- Sicherheits-Header (HSTS, `X-Content-Type-Options`, `Referrer-Policy`), die zuvor von `tg-web`s nginx gesetzt wurden, kommen jetzt von Spring Security.

## [1.0.0] - 2026-09-21

### Changed

- CI: Deployment kann jetzt zusätzlich manuell über "Run workflow" in GitHub Actions angestoßen werden (workflow_dispatch).
- CI: Automatisches Deployment auf TEST greift jetzt auch für `fix/**`, `hotfix/**`, `chore/**` und `refactor/**` Branches, nicht mehr nur für `feature/**`.
- CI: Nach jedem erfolgreichen Prod-Deploy wird automatisch ein SemVer-Tag gesetzt, das Changelog in eine datierte Version überführt und ein GitHub Release erstellt. Die App-Version (Actuator `/info`, Docker-Image-Tag) folgt derselben Nummer.

[Unreleased]: https://github.com/feurle/tg-app/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/feurle/tg-app/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/feurle/tg-app/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/feurle/tg-app/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/feurle/tg-app/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/feurle/tg-app/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/feurle/tg-app/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/feurle/tg-app/releases/tag/v1.0.0

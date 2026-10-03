# tg-app - UI Design

Design-Richtung und Umsetzungs-Roadmap für das öffentliche Frontend von **Tier. Gesund.** Grundlage ist eine Grilling-Session vom 2026-10-03.

## 1. Zielgruppen & Aufgaben

| Zielgruppe | Situation | Hauptaufgabe |
|---|---|---|
| **Tierbesitzer** (primär) | Ihr Tier hat Schmerzen, Bewegungsprobleme oder eine chronische Erkrankung | Vertrauen zur Ärztin fassen und **einen Termin anfragen** |
| **Tierärzte** (sekundär) | Sie haben einen Patienten, der von den Schwerpunkten profitiert | **Den Patienten schnell und strukturiert überweisen**, ohne Login |

**Praxisprofil:**
- Kleintierpraxis in Bregenz (AT) für Hunde, Katzen und Kleintiere, **keine Pferde**.
- Schwerpunkte: Chiropraktik, Goldimplantation zur Schmerztherapie und ganzheitlich-integrative Betreuung.
- Positionierung als **Schwerpunktpraxis**: Die Schwerpunkte sind das Alleinstellungsmerkmal und zugleich der Grund, warum Tierärzte überweisen.

## 2. Gestaltungsprinzipien

1. **Warm und persönlich.** Dr. Lisa Feurle-Elsäßer ist die Marke. Die Texte sind in Ich-Form geschrieben und sprechen Besucher mit „Sie“ an.
2. **Kühnheit an genau einer Stelle:** das große Porträt im Hero. Alles andere bleibt ruhig und mit viel Weißraum.
3. **Beschwerdebilder vor Methoden.** Besitzer denken in Symptomen („mein Hund lahmt“), nicht in Verfahren.
4. **Barrierearm:** WCAG AA, Fließtext 18px, Click-to-call und große Trefferflächen. Viele Besitzer sind älter und nutzen das Handy.
5. **Keine generischen Muster** (siehe `.agents/skills/frontend-design/SKILL.md`):
   - keine Eyebrow-Labels in Versalien
   - keine 01/02/03-Nummerierung
   - kein einzelnes eingefärbtes Akzentwort in Headlines
   - keine SaaS-Kartenraster
   - kein Creme + Serif + Terrakotta

## 3. Farbe: „Bodensee & Holz“

Die Palette ist aus dem Ort abgeleitet: Seewasser, Vorarlberger Holz und heller Kalkstein.

| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#F4F3EF` | Steinweiß, Seitengrund |
| `--surface` | `#FFFFFF` | Flächen, Formulare |
| `--ink` | `#1F2A2C` | Text (ca. 13:1 auf `--bg`) |
| `--ink-muted` | aus `--ink` ableiten, ≥ 4,5:1 | Sekundärtext |
| `--brand` | `#1E5A5E` | Seepetrol: Primär-Button mit weißer Schrift, Links (ca. 7,8:1 auf Weiß) |
| `--brand-light` | `#DCEBEA` | Hintergrund von Bändern und Hinweisen |
| `--wood` | `#C08A4A` | Eichenholz, **nur als Detail**: Unterstreichungen, Icons, Trennlinien, Hover-Akzent |
| `--line` | `#DAD8D1` | Linien, Rahmen |

Regeln:
- `--wood` erreicht auf Weiß nur ca. 3:1. Deshalb wird es **nie** für Text oder als Buttonfläche verwendet.
- Die Status-Farben (`--danger*`, `--warning*`) bleiben wie sie sind.
- Alle heute fest codierten Hex-Werte in `frontend/src/styles/global.css` werden auf Tokens umgestellt. Dazu gehören die Braun- und Salbeitöne `#2C2620`, `#5B7C5D`, `#F0EBE3` und weitere.
- Dark Mode ist kein Ziel.

## 4. Typografie

- **Figtree** (Google Fonts) für Headlines und Text. Lora, DM Sans und DM Mono entfallen.
- Die Wärme kommt aus der Form der Schrift. Die Kühnheit kommt aus Foto und Größe, nicht aus einer zweiten Schrift.
- Type-Scale als Tokens:

| Token | Größe | Verwendung |
|---|---|---|
| `--fs-xs` | 14px | Meta, Labels |
| `--fs-sm` | 16px | UI, Formulare |
| `--fs-base` | 18px | Fließtext, Zeilenhöhe 1,6 |
| `--fs-lg` | 22px | Lead, H4 |
| `--fs-xl` | 28px | H3 |
| `--fs-2xl` | 36px | H2 |
| `--fs-3xl` | 52px | Hero-Headline, leicht negatives Letter-Spacing |

- Neu kommen Spacing-Tokens (8pt-Raster: 4, 8, 16, 24, 32, 48, 64, 96) und Radius-Tokens (`--radius-sm` 6px, `--radius` 12px) dazu. Beides gibt es heute nicht.

## 5. Bildsprache

- **Porträt:** Ein echtes Porträt von Dr. Feurle-Elsäßer ist schon vorhanden und wird heute auf der „Über uns“-Seite gezeigt (`aboutme.jpg`, id 7, in `src/main/resources/db/data/image.csv`). Der Hero verwendet dasselbe Bild über die bestehende Artikel-Bild-Verknüpfung (`article_images.csv`). Ein höher aufgelöster Zuschnitt für den Hero kann es später ersetzen.
- **Behandlungsfotos „Hände am Tier“** liegen bereits in der DB (`chiro1.jpg`, `GoldImplantation2.jpg`, `GoldImplantation3.jpg`, `cat.png`). Sie werden in der Methoden-Sektion wiederverwendet.
- Gezeigt werden nur Hund, Katze und Kleintiere. Es gibt keine Stockfotos und keine Illustrationen.

## 6. Navigation

**Desktop:**
```
[Logo] Tier. Gesund.        Behandlungen  Über mich  Aktuelles  Kontakt   [Termin anfragen]
                                                                       Für Tierärzte →  (klein)
```

**Mobile:**
```
[Logo]                         [☰]
...
┌──────────────────────────────────┐
│  [ Termin anfragen ]   [ ☎ ]     │  ← sticky unten
└──────────────────────────────────┘
```

- Das „Anfragen“-Dropdown in `frontend/src/layout/Navbar.tsx` entfällt.
- „Für Tierärzte“ erscheint als dezenter Link in der Kopfzeile und im Footer.
- `/for-pet-owners` wird zur Seite **Behandlungen**: Methoden im Detail, Ablauf des Erstbesuchs und ein Link zum Fragebogen. Die alte Route leitet weiter.
- Das Menü-Label ist „Über mich“ (Ich-Form). Die Seite `/about` behält ihre Route.

## 7. Home

Die Struktur der Sektionen legt der Code fest, die Inhalte kommen aus dem CMS (Artikel je Sektionstyp).

**Desktop:**
```
1 HERO           ┌──────────────────────────┬─────────────────┐
                 │ Headline (52px)          │                 │
                 │ Subline                  │   PORTRÄT       │
                 │ Statement in Ich-Form    │   (groß,        │
                 │ [Termin anfragen]  ☎ Tel │    angeschnitten)│
                 │ ● Heute 14–18 Uhr offen  │                 │
                 └──────────────────────────┴─────────────────┘
2 WANN ZU MIR?   Schmerz | Bewegung/Lahmheit | Chronisches | Senioren
                 (je ein Satz + Verweis auf passende Methode)
3 METHODEN       Chiropraktik | Goldimplantation | Integrativ
                 (Foto Hände-am-Tier + 2 Sätze + "mehr" → Behandlungen)
4 ÜBER MICH      Vita kurz, Zertifikate (IVCA …), → /about
5 ERSTER TERMIN  Anfrage → Fragebogen → Termin   (als Fließtext/Pfeile, keine Nummern-Badges)
6 FÜR TIERÄRZTE  schmales Band auf --brand-light: "Patient überweisen →"
7 KONTAKT        Adresse + Karten-Link | Sprechzeiten | Telefon   (aus VetInfo)
```

**Mobile:** Das Porträt steht oben, Headline, Statement und CTA folgen darunter. Die Sektionen 2 und 3 werden einspaltig gestapelt, die Termin-Leiste bleibt sticky.

**Hero-Text (Entwurf):** Dr. Feurle-Elsäßer überarbeitet ihn, die finale Fassung wird im CMS gepflegt.
- Headline: „Wenn Ihr Tier mehr braucht als eine Diagnose.“ (die bestehende Zeile bleibt)
- Subline: „Ganzheitlich-integrative Tiermedizin für Hunde, Katzen und Kleintiere, mit Schwerpunkt auf Schmerz und Bewegung.“
- Statement: „Ich bin Lisa Feurle-Elsäßer. Ich verbinde Schulmedizin mit Chiropraktik, Goldimplantation und integrativen Methoden, damit Ihr Tier wieder schmerzfrei und beweglich wird.“
- Sprachregeln:
  - Ich-Form und Sie-Anrede.
  - Aktive Verben.
  - Fachbegriffe nur mit Erklärung.
  - Fehlermeldungen geben eine Richtung vor und entschuldigen sich nicht.

## 8. Für Tierärzte: Überweisung (`/for-vets`)

```
Für Tierärzte
Kurztext: wann eine Überweisung sinnvoll ist (Schmerz, Bewegungsapparat, Therapieresistenz)

┌ Überweisung ──────────────────────────────────────────┐
│ Überweisende Praxis   │ Name Tierärztin/-arzt         │
│ E-Mail                │ Telefon                       │
│ Besitzer: Name, Telefon/E-Mail                        │
│ Tier: Art · Rasse · Alter                             │
│ Fragestellung                                         │
│ Vorbehandlung / Medikation                            │
│ Dringlichkeit: ( ) Routine ( ) zeitnah ( ) dringend   │
│ Hinweis: Befunde bitte an info@tier-gesund.at senden  │
│ [Überweisung senden]                                  │
└───────────────────────────────────────────────────────┘
```

- Das Formular ist öffentlich und braucht keinen Login.
- **v1 ohne Datei-Upload.** Befunde werden per E-Mail an info@tier-gesund.at geschickt. Die Adresse kommt aus VetInfo über `PrimaryContactEmailLookup`. Ein Upload ist eine spätere Ausbaustufe; sie bringt Speicher-, Viren- und DSGVO-Themen mit sich.
- **Verarbeitung wie im `contact`-Modul:** Die Praxis bekommt eine Mail, der überweisende Tierarzt eine Bestätigungsmail. Es werden **keine Gesundheitsdaten in der DB** gespeichert.

## 9. Kontaktdaten aus einer Quelle

- `VetInfo` wird die einzige Quelle für das Telefon im Hero, die Kontaktsektion und den Footer. Der Freitext in COL4 auf der Home entfällt.
- `OfficeHour` wird um Wochentag, Beginn und Ende erweitert. Erst dann lässt sich „Heute 14–18 Uhr geöffnet“ berechnen.
- Geklärte Daten:
  - **Adresse:** Holzackergasse 13, 6900 Bregenz. Das Impressum („Holzackerstraße“) wird korrigiert.
  - **Telefon:** Das Festnetz +43 (0)5574 83500 ist die Praxisnummer (`VetInfo.phone`, Hero, Click-to-call, Kontakt, Footer). Die Mobilnummer +43 681 20302253 steht nur im Impressum.
  - **E-Mail:** info@tier-gesund.at
  - **Sprechzeiten:** Mo 14–18, Di 8:30–12:30, Do 8:30–12:30

## 10. Admin-Bereich

Der Admin-Bereich (`AppLayout`) übernimmt nur die neuen Tokens und die Schrift. Die Admin-Screens werden nicht neu gestaltet.

## 11. Roadmap

Jede Phase ist ein eigener PR mit einem Changelog-Bullet unter `[Unreleased]`.

1. **Fundament:**
   - Tokens für Farbe, Typo, Spacing und Radius anlegen und Figtree einbinden.
   - Fest codierte Farben aus `global.css` entfernen.
   - Betrifft `frontend/src/styles/variables.css`, `frontend/src/styles/global.css` und `frontend/index.html`.
2. **Gerüst:**
   - Neue Navbar mit Termin-Button und mobiler Sticky-Leiste, neuer Footer.
   - Seite „Behandlungen“ anlegen, `/for-pet-owners` weiterleiten.
   - Betrifft `frontend/src/layout/Navbar.tsx`, `frontend/src/layout/Footer.tsx` und `frontend/src/router/`.
3. **Home:**
   - Neue oder erweiterte Sektionstypen (HERO mit Porträt, Beschwerdebilder, Ablauf, Tierärzte-Band) in `ArticleType` (Backend `webcontent/domain/enumeration/ArticleType.java` und `frontend/src/features/webcontent/types.ts`).
   - Rendering in `PublicPage.tsx`.
   - Seed-Inhalte für die Home inklusive Hero-Entwurf; „Pferde“ wird entfernt.
4. **VetInfo:**
   - Strukturierte Öffnungszeiten (Liquibase-Changeset).
   - Seed-Daten mit den geklärten Werten.
   - Anbindung von Hero, Kontakt und Footer; Impressum korrigieren.
5. **Überweisung:**
   - Formular auf `/for-vets` und ein Endpoint nach dem Muster des `contact`-Moduls.
   - Mails über `notification`/`MailService`.
6. **Fragebogen (Folgeaufgabe):**
   - Ein Feld für die Tierart; hundespezifische Felder (Hundeschule, Kommandos) erscheinen nur bei Hund.
   - Danach die optische Anpassung an die neuen Tokens.

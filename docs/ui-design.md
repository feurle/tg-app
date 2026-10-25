# tg-app - UI Design

Design-Referenz für das öffentliche Frontend von **Tier. Gesund.** Sie beschreibt, wie die Seite aussehen und sich verhalten soll.

## 1. Zielgruppen & Aufgaben

| Zielgruppe | Situation | Hauptaufgabe |
|---|---|---|
| **Tierbesitzer** (primär) | Ihr Tier hat Schmerzen, Bewegungsprobleme oder eine chronische Erkrankung | Vertrauen zur Ärztin fassen und **einen Termin anfragen** |
| **Tierärzte** (sekundär) | Sie haben einen Patienten, der von den Schwerpunkten profitiert | **Den Patienten schnell und strukturiert überweisen**, ohne Login |

**Praxisprofil:**
- Kleintierpraxis in Bregenz (AT) für Hunde, Katzen und Kleintiere, **keine Pferde**.
- Schwerpunkte: Chiropraktik, Goldimplantation zur Schmerztherapie und ganzheitlich-integrative Betreuung.
- Die Schwerpunkte sind das Alleinstellungsmerkmal und zugleich der Grund, warum Tierärzte überweisen.

## 2. Gestaltungsprinzipien

1. **Warm und persönlich.** Dr. Lisa Feurle-Elsäßer ist die Marke. Texte sind in Ich-Form geschrieben und sprechen Besucher mit „Sie“ an.
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

Die Palette ist aus dem Ort abgeleitet: Seewasser, Vorarlberger Holz und heller Kalkstein. Die Werte stehen als Tokens in `frontend/src/styles/variables.css`.

| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#F4F3EF` | Steinweiß, Seitengrund |
| `--surface` | `#FFFFFF` | Flächen, Formulare |
| `--ink` | `#1F2A2C` | Text (ca. 13:1 auf `--bg`) |
| `--ink-muted` | aus `--ink` abgeleitet, ≥ 4,5:1 | Sekundärtext |
| `--brand` | `#1E5A5E` | Seepetrol: Primär-Button mit weißer Schrift, Links (ca. 7,8:1 auf Weiß) |
| `--brand-light` | `#DCEBEA` | Hintergrund von Bändern und Hinweisen |
| `--wood` | `#C08A4A` | Eichenholz, **nur als Detail**: Unterstreichungen, Icons, Trennlinien, Hover-Akzent |
| `--line` | `#DAD8D1` | Linien, Rahmen |

Regeln:
- `--wood` erreicht auf Weiß nur ca. 3:1. Deshalb wird es **nie** für Text oder als Buttonfläche verwendet.
- Die Status-Farben (`--danger*`, `--warning*`) bleiben unverändert.
- Neue Farben gibt es nur als Tokens. Feste Hex-Werte in Komponenten oder `global.css` sind nicht erlaubt.
- Dark Mode ist kein Ziel.

## 4. Typografie

- **Figtree** für Headlines und Text, selbst gehostet über `@fontsource-variable/figtree`. Es gibt keinen Aufruf an Google beim Seitenaufruf, passend zum Datenschutztext.
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

- Spacing-Tokens (8pt-Raster: 4, 8, 16, 24, 32, 48, 64, 96) und Radius-Tokens (`--radius-sm` 6px, `--radius` 12px) gelten für alle neuen Komponenten.

## 5. Bildsprache

- **Porträt:** Das Porträt von Dr. Feurle-Elsäßer (`aboutme.jpg`) steht im Hero und auf der Seite „Über mich“. Ein höher aufgelöster Zuschnitt für den Hero kann es ersetzen.
- **Behandlungsfotos „Hände am Tier“** werden in der Methoden-Sektion verwendet.
- Gezeigt werden nur Hund, Katze und Kleintiere. Es gibt keine Stockfotos und keine Illustrationen.

## 6. Navigation

**Desktop:**
```
[Logo] Tier. Gesund.        Behandlungen  Über mich  Aktuelles   [Termin anfragen]
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

- Es gibt kein „Anfragen“-Dropdown in der Navigation.
- „Für Tierärzte“ erscheint als dezenter Link in der Kopfzeile und im Footer.
- `/for-pet-owners` ist die Seite **Behandlungen**: Methoden im Detail, Ablauf des Erstbesuchs und ein Link zum Fragebogen. Die alte Route leitet weiter.
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

Zuordnung zu Artikeltypen (`ArticleType`, maßgeblich ist `frontend/src/features/webcontent/blockTypes.ts`):

| Sektion | Typ |
|---|---|
| 1 Hero | `HERO_PORTRAIT` |
| 2 Wann zu mir | `SYMPTOMS` |
| 3 Methoden | `METHODS` (jeder Abschnitt hat optional ein eigenes Bild, `section.image_id`) |
| 4 Über mich | `ABOUT_TEASER` |
| 5 Erster Termin | `STEPS` |
| 6 Für Tierärzte | `VET_BAND` |
| 7 Kontakt | `ContactSection` aus VetInfo |

**Mobile:** Das Porträt steht oben, Headline, Statement und CTA folgen darunter. Die Sektionen 2 und 3 werden einspaltig gestapelt, die Termin-Leiste bleibt sticky.

**Sprachregeln für Texte:**
- Ich-Form und Sie-Anrede.
- Aktive Verben.
- Fachbegriffe nur mit Erklärung.
- Fehlermeldungen geben eine Richtung vor und entschuldigen sich nicht.

## 8. Formulare und Überweisung (`/referral`, `/for-vets`)

Alle öffentlichen Formulare (Termin, Nachricht, Überweisung, Fragebogen) teilen ein Muster: Seitenkopf mit kurzem Einleitungstext, Fieldsets als weiße Karten (800px breit, `--radius`, Legend in `--fs-lg`), Absenden unten rechts (mobil volle Breite) und eine Bestätigungskarte statt des Formulars. Die Bausteine liegen in `frontend/src/components/form/`. Termin, Nachricht und Überweisung sind eigene Seiten (`/appointment`, `/message`, `/referral`), kein Modal. Der CTA heißt überall „Termin anfragen“, nur auf `/for-vets` steht an erster Stelle „Patienten überweisen“.

`/for-vets` ist eine reine Infoseite, aufgebaut wie `/contact`:

```
Für Tierärzte
Zusammenarbeit bei Schmerz- und Bewegungsproblemen Ihrer Patienten
[Patienten überweisen]   → /referral, im Code, ohne Scrollen sichtbar
CMS-Inhalt: wann eine Überweisung sinnvoll ist, Ablauf, CTA (Überweisen · Nachricht)
```

`/referral` zeigt nur das Formular, ohne Infotext. Die mobile Leiste hat dort wie auf `/appointment` nur den Anruf-Button.

```
Patienten überweisen
Untertitel · Link „Mehr zur Zusammenarbeit“ → /for-vets
* Pflichtfeld

┌ Überweisung ──────────────────────────────────────────┐
│ Überweisende Praxis   │ Name Tierärztin/-arzt         │
│ E-Mail                │ Telefon                       │
│ Besitzer: Name, Telefon/E-Mail                        │
│ Tier: Art · Rasse · Alter                             │
│ Fragestellung                                         │
│ Vorbehandlung / Medikation                            │
│ Dringlichkeit: ( ) Routine ( ) zeitnah ( ) dringend   │
│ Hinweis: Befunde bitte an die Praxis-E-Mail senden    │
│ [Überweisung senden]                                  │
└───────────────────────────────────────────────────────┘
```

- Das Formular ist öffentlich und braucht keinen Login. Eine Pflicht-Checkbox bestätigt, dass der Tierhalter der Weitergabe seiner Kontaktdaten zugestimmt hat.
- **Kein Datei-Upload.** Befunde werden per E-Mail an die Praxis geschickt. Die Adresse kommt aus VetInfo über `PrimaryContactEmailLookup`. Ein Upload bringt Speicher-, Viren- und DSGVO-Themen mit sich und ist eine spätere Entscheidung.
- **Verarbeitung wie im `contact`-Modul:** Die Praxis bekommt eine Mail, der überweisende Tierarzt eine Bestätigungsmail. Es werden **keine Gesundheitsdaten in der DB** gespeichert.

## 9. Kontaktdaten aus einer Quelle

- `VetInfo` ist die einzige Quelle für Telefon, Adresse, E-Mail und Sprechzeiten. Hero, Kontaktbereich (Home und `/contact`), Footer und der Anruf-Button der mobilen Leiste lesen daraus.
- Öffentlich lesbar über `GET /api/vetinfo/primary`.
- `OfficeHour` besteht aus Wochentag, Beginn und Ende (mehrere Intervalle pro Tag möglich). Das Frontend berechnet daraus „Jetzt geöffnet, bis 18:00 Uhr“ bzw. die nächste Sprechzeit, immer in Wiener Zeit.
- Das Festnetz ist die Praxisnummer für Click-to-call. Eine Mobilnummer steht nur im Impressum.

## 10. Admin-Bereich

Der Admin-Bereich (`AppLayout`) übernimmt die Tokens und die Schrift. Die Admin-Screens werden nicht neu gestaltet.

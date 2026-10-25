# Changelog-Fragmente

Jeder PR mit einer nennenswerten Änderung legt hier eine eigene Datei an, statt `CHANGELOG.md`
zu bearbeiten. So geraten parallele PRs nicht in Konflikt.

- Dateiname: der Branch-Name, `/` durch `-` ersetzt. Aus `fix/113-office-hours` wird
  `fix-113-office-hours.md`, aus `feat/95-cta-article-type` wird `feat-95-cta-article-type.md`.
- Inhalt: die gleichen Kategorien wie in `CHANGELOG.md` (`Added`, `Changed`, `Deprecated`,
  `Removed`, `Fixed`, `Security`), nur die befüllten:

```markdown
### Fixed

- Terminanfrage: Wunschtermine sind nur noch innerhalb der Sprechzeiten möglich (#113)
```

Der Release-Job (`.github/workflows/deploy.yml`) sortiert die Bullets beim Release in
`[Unreleased]` von `CHANGELOG.md` ein, schneidet den Abschnitt als neue Version und löscht die
Fragmente im Release-Commit. Ohne Fragment und ohne Bullet unter `[Unreleased]` gibt es kein
Release.

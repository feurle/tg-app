### Changed

- Bilder werden vom Browser ein Jahr lang zwischengespeichert statt bei jedem Seitenaufruf neu geladen (#97)
- Bild-Upload im Admin: Fotos über 1600 px werden vor dem Hochladen verkleinert und als JPEG gespeichert (#97)
- Startseite: Das Hero-Bild wird bevorzugt geladen (#97)

### Security

- Bild-Upload nimmt nur noch JPEG, PNG und WebP an, SVG und andere Dateien werden abgelehnt (#97)

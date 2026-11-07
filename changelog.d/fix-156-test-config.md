### Fixed

- Tests: Die Haupt-Konfiguration `application.yaml` gilt jetzt auch in den Tests. Die Test-Overrides liegen im Profil `junit` (`src/test/resources/application-junit.yaml`) und ersetzen die Haupt-Datei nicht mehr. Die Komprimierung ist dadurch in `application.yaml` statt im Code konfiguriert (#156)

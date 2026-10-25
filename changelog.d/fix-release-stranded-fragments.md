### Fixed

- CI: Ein Doku-Merge direkt nach einem Merge mit Changelog-Fragment blockiert weder das Release noch den PROD-Deploy. Bisher blieb das Fragment liegen, bis der nächste Code-Merge kam
- CI: Sammelt ein Release mehrere Merges ein, zählt der höchste Versionssprung seit dem letzten Tag (`feat` → Minor), nicht nur der letzte Commit
- CI: Das Docker-Tag `feurle/tg-app:x.y.z` setzt erst der Release-Job auf das Image des Releases. Es entstehen keine Versions-Tags ohne Release mehr

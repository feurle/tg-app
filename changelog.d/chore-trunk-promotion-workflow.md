### Changed

- Neuer Deploy-Ablauf: Ein Merge auf `trunk` deployt nach TEST und erzeugt das Release. Nach PROD gelangt dasselbe Image erst nach einer Freigabe. Feature-Branches lassen nur noch die CI laufen, ein Branch lässt sich bei Bedarf per `workflow_dispatch` auf TEST deployen. Changelog-Einträge liegen als Fragmente in `changelog.d/`. Mit `SERVER_PORT` und `VITE_PORT` laufen mehrere Worktrees lokal parallel.

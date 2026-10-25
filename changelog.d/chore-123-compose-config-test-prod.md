### Changed

- CI: TEST-Deploy kopiert nur noch `test-compose.yml`, PROD-Deploy und PROD-Rollback nur noch `prod-compose.yml`. `services.yml` (Datenbank, tg-admin) wird nicht mehr bei App-Deployments überschrieben; der manuelle Aktualisierungsweg steht in `docs/deployment.md` (#123)

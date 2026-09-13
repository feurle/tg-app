# Plan: GitHub Actions CI/CD Workflow

## Context
Drei-Job-Pipeline für den Vite/React-Frontend-Container.
Kein Test-Framework vorhanden → Job 1 nutzt Lint + TypeScript-Check + Build.
Docker-Registry: **GitHub Container Registry (ghcr.io)** — kein externer Account nötig, läuft mit `GITHUB_TOKEN`.
Deploy: SSH auf Server via `appleboy/ssh-action`.

## Datei: `.github/workflows/deploy.yml`

### Benötigte GitHub Secrets
| Secret | Beschreibung |
|---|---|
| `SSH_HOST` | Server-IP oder Hostname |
| `SSH_USER` | SSH-Benutzer |
| `SSH_KEY` | Privater SSH-Schlüssel (PEM) |
| `BACKEND_URL` | Backend-URL für nginx-Proxy, z.B. `http://backend:8080` |

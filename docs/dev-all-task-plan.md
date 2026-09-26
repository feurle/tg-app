# Plan: Combined `devAll` Gradle Task (Backend + Frontend Dev Server)

## Goal
Add a single Gradle command that starts both the Spring Boot backend (`bootRun`)
and the Vite frontend dev server (`npm run dev`) in parallel, replacing the need
for two separate terminals during local development. This is step 1 of a larger
effort to eventually integrate the React frontend into the same deployable
container as the backend (see open questions below for related, deferred work).

## Scope
- Only affects local dev workflow (`./gradlew devAll`).
- No changes to `bootRun`, `bootBuildImage`, CI workflows (`deploy.yml`,
  `frontend-deploy.yml`), or Docker/compose files.
- No changes to how the app is built or deployed in prod/test.

## Changes

### 1. `build.gradle` — add Node plugin
Add the `com.github.node-gradle.node` Gradle plugin (v7.1.0) to manage a
reproducible Node.js toolchain for the `frontend/` directory, instead of
depending on whatever `npm`/`node` happens to be installed locally.

```groovy
plugins {
    // ...existing plugins...
    id 'com.github.node-gradle.node' version '7.1.0'
}

node {
    version = '24.21.0'          // current Active LTS ("Krypton"), matches
                                  // node:22-alpine bump target discussed for
                                  // frontend/Dockerfile in a later step
    download = true
    nodeProjectDir = file("${project.projectDir}/frontend")
}
```

This gives us generated tasks like `npmInstall`, `npm_run_dev`, `npm_run_build`
scoped to `frontend/`.

### 2. New task `devAll`
A custom task (not `Exec`, since we need two long-running processes started in
parallel with coordinated shutdown) that:
- Depends on `npmInstall` (ensures `frontend/node_modules` exists first).
- Starts the backend via `ProcessBuilder('./gradlew', 'bootRun')`, output
  inherited to the console.
- Starts the frontend via `ProcessBuilder('npm', 'run', 'dev')` in
  `frontend/`, output inherited to the console.
- Registers a JVM shutdown hook so `Ctrl+C` destroys both child processes
  (avoids orphaned `vite` process left listening on port 5173).
- Waits until either process exits, then force-destroys the other.

Sketch:
```groovy
tasks.register('devAll') {
    group = 'application'
    description = 'Starts backend (bootRun) and frontend (vite dev server) in parallel for local development.'
    dependsOn('npmInstall')
    doLast {
        def backend = new ProcessBuilder('./gradlew', 'bootRun')
            .directory(projectDir)
            .redirectOutput(ProcessBuilder.Redirect.INHERIT)
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()
        def frontend = new ProcessBuilder('npm', 'run', 'dev')
            .directory(file('frontend'))
            .redirectOutput(ProcessBuilder.Redirect.INHERIT)
            .redirectError(ProcessBuilder.Redirect.INHERIT)
            .start()

        Runtime.runtime.addShutdownHook(new Thread({
            backend.destroy()
            frontend.destroy()
        }))

        while (backend.isAlive() && frontend.isAlive()) {
            Thread.sleep(500)
        }
        backend.destroyForcibly()
        frontend.destroyForcibly()
    }
}
```
(Exact error/exit-code handling to be refined during implementation.)

### 3. Documentation
Add a short note under "Local Development" in the root `AGENTS.md`:
`./gradlew devAll` as a one-command alternative to running backend and
frontend in two separate terminals (existing two-terminal instructions stay,
just supplemented).

## Verification
1. Run `./gradlew devAll`.
2. Confirm backend reachable at `http://localhost:8080` and frontend dev
   server at `http://localhost:5173`.
3. Confirm `/api` calls from the frontend proxy correctly to the backend
   (existing Vite proxy config, unchanged).
4. Press `Ctrl+C`; confirm both processes terminate (check with
   `lsof -i:8080` / `lsof -i:5173` — nothing should remain listening).

## Explicitly out of scope (deferred, discussed but not decided in detail yet)
These were raised in the broader "integrate frontend into backend container"
discussion but are separate follow-up work, not part of this task:
- Merging `tg-app`/`tg-web` into a single Docker image (Q1).
- Copying `frontend/dist` into `src/main/resources/static` as part of the
  Gradle build + SPA fallback controller (Q3, Q6).
- Replacing nginx security headers with Spring Security header config (Q4).
- Consolidating `deploy.yml` / `frontend-deploy.yml` CI workflows (Q5).

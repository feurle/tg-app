.ONESHELL:
SHELL := /bin/bash
.PHONY: api-sync dump-openapi

# Regenerate the OpenAPI contract and the frontend's TypeScript types from it.
api-sync: dump-openapi
	cd frontend && npm run generate:api

# Boot the backend just long enough to dump its live OpenAPI spec, then stop it.
# Backgrounded output goes to a log file, not inherited stdout/stderr - otherwise
# a caller piping this target's output (e.g. `make dump-openapi | tail`) hangs
# forever once the recipe's own shell exits, since the still-running JVM keeps
# holding that pipe open. The trap guarantees the backend gets killed even if a
# later step (e.g. the curl below) fails, so we never leak a running process.
# Killed by port, not by the gradlew PID: gradlew forks the actual JVM, so
# killing the wrapper alone leaves that JVM holding :8080 (see .claude/skills/verify).
dump-openapi:
	set -e
	./gradlew bootRun --args='--spring.profiles.active=dev' > /tmp/tg-app-bootrun.log 2>&1 &
	trap 'kill $$(ss -ltnp | grep ":8080" | grep -oP "pid=\K[0-9]+") 2>/dev/null || true' EXIT
	until curl -sf http://localhost:8080/actuator/health > /dev/null; do sleep 1; done
	mkdir -p api-contract
	curl -sf http://localhost:8080/v3/api-docs -o api-contract/openapi.json

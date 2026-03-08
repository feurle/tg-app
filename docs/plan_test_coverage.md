# Plan: Test Coverage Report (JaCoCo + CI Artifact)

## Context

JaCoCo ist bisher nicht konfiguriert. Der User möchte die Testabdeckung lokal als HTML-Report sehen und zusätzlich den Report in GitHub Actions als downloadbares Artifact. 6 Testklassen (Spring Boot Integration, Mockito Unit, Spring Modulith).

## Änderungen

### 1. `build.gradle` — JaCoCo-Plugin hinzufügen

```groovy
plugins {
    id 'java'
    id 'jacoco'                                          // NEU
    id 'org.springframework.boot' version '4.0.3'
    id 'io.spring.dependency-management' version '1.1.7'
    id 'com.diffplug.spotless' version '6.25.0'
}
```

Konfigurationsblock ans Ende der Datei:

```groovy
test {
    useJUnitPlatform()
    finalizedBy jacocoTestReport   // Report wird automatisch nach Tests erzeugt
}

jacocoTestReport {
    dependsOn test
    reports {
        html.required = true
        xml.required = false
    }
}
```

> Hinweis: Der bestehende `tasks.named('test') { useJUnitPlatform() }` Block wird ersetzt durch einen direkten `test { ... }` Block mit `finalizedBy`.

**Lokale Nutzung nach Änderung:**
```bash
./gradlew test
# Report: build/reports/jacoco/test/html/index.html
```

---

### 2. `.github/workflows/deploy.yml` — CI anpassen

Im `build`-Job, Step "Run Tests" ersetzen und einen Upload-Step ergänzen:

**Vorher:**
```yaml
- name: Run Tests
  run: ./gradlew test
```

**Nachher:**
```yaml
- name: Run Tests with Coverage
  run: ./gradlew test jacocoTestReport

- name: Upload Coverage Report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: build/reports/jacoco/test/html/
  if: always()   # Upload auch bei fehlgeschlagenen Tests
```

---

## Kritische Dateien

- `build.gradle` — JaCoCo-Plugin + Konfigurationsblock
- `.github/workflows/deploy.yml` — Test-Step + Artifact-Upload-Step im `build`-Job (Zeilen 39-43)

## Verifikation

```bash
# Lokal
./gradlew test
open build/reports/jacoco/test/html/index.html

# In CI: Nach Push zu trunk → GitHub Actions → "Test & Build" Job → Artifacts → "coverage-report"
```

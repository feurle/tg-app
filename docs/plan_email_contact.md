# Plan: E-Mail-Kontaktfunktion

## Context
Webseitenbesucher sollen eine Nachricht (Titel, Text, Antwort-E-Mail) an einen festen Empfänger senden können. Die Nachricht wird direkt per SMTP verschickt, nicht gespeichert.

---

## DDD-Einordnung

Der Use Case gehört zu keiner bestehenden Domäne:
- `webcontent` → Content-Verwaltung
- `user` → Authentifizierung
- `customer` → Kundendaten

→ **Neues Modul `contact`** (eigener Bounded Context: Kommunikation nach außen). Kein DB-Entity nötig, da Nachrichten nicht gespeichert werden — nur Fire & Forget per SMTP.

---

## Neue Dateien

```
com.feurle.tg.contact/
├── application/
│   └── ContactService.java              # JavaMailSender, sendet Mail
└── infrastructure/
    ├── config/
    │   └── ContactProperties.java       # @ConfigurationProperties("app.contact")
    └── rest/
        ├── ContactController.java       # POST /api/contact/message → 204
        └── dto/
            └── SendMessageRequest.java  # title, text, replyToEmail (mit Validation)
```

---

## Geänderte Dateien

### `build.gradle`
Neue Dependency:
```groovy
implementation 'org.springframework.boot:spring-boot-starter-mail'
```

### `src/main/resources/application.yaml`
**Dev-Profil** (z.B. MailHog auf localhost:1025 — optional, oder einfach nicht konfigurieren und Fehler in Log tolerieren):
```yaml
spring:
  mail:
    host: localhost
    port: 1025
app:
  contact:
    recipient-email: dev@localhost
```

**Stage-Profil** (via Umgebungsvariablen):
```yaml
spring:
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME}
    password: ${SMTP_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
app:
  contact:
    recipient-email: ${CONTACT_RECIPIENT_EMAIL}
```

### `SecurityConfig.java`
Endpunkt öffentlich freischalten (Kontaktformular braucht kein Login):
```java
.requestMatchers(HttpMethod.POST, "/api/contact/message").permitAll()
```

---

## Implementierungsdetails

**`SendMessageRequest`** — Java Record mit Bean Validation:
- `@NotBlank String title`
- `@NotBlank String text`
- `@Email @NotBlank String replyToEmail`

**`ContactService`** — sendet `SimpleMailMessage`:
- `To`: fester Empfänger aus `ContactProperties`
- `Subject`: `title` aus Request
- `Text`: `text` aus Request
- `ReplyTo`: `replyToEmail` aus Request (damit der Empfänger direkt antworten kann)

**`ContactController`** — `POST /api/contact/message`:
- `@Valid @RequestBody SendMessageRequest`
- Gibt `204 No Content` zurück

---

## Test

Unit-Test für `ContactService` mit gemocktem `JavaMailSender`:
- Verifizieren dass `send()` aufgerufen wird
- Verifizieren dass To, Subject, ReplyTo korrekt gesetzt sind

---

## Verifikation

1. `./gradlew spotlessApply && ./gradlew test` — alles grün
2. Lokal mit MailHog testen:
   ```bash
   docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```
   Dann `POST http://localhost:8080/api/contact/message` mit Body:
   ```json
   { "title": "Hallo", "text": "Testnachricht", "replyToEmail": "sender@example.com" }
   ```
   Ergebnis im MailHog-UI unter `http://localhost:8025` prüfen.

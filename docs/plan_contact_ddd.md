# Plan: Contact-Modul um ContactInfo-Entity erweitern (DDD)

## Context

Das bestehende `contact`-Modul ist rein zustandslos — es schickt E-Mails via `ContactService`,
die Empfängeradresse kommt statisch aus `ContactConfig` (`app.contact.recipient-email`).

Ziel: Eine persistente `ContactInfo`-Entity einführen, die Telefon, E-Mail, Adresse und
Sprechzeiten der Praxis speichert. Die dort hinterlegte E-Mail löst die statische
Umgebungsvariable `CONTACT_RECIPIENT_EMAIL` ab.

---

## Neue Dateien

### Domain Layer (`contact/domain/`)

**`ContactInfo.java`** — JPA Entity, Singleton (nur 1 Datensatz pro Instanz)
```java
@Entity @Data @NoArgsConstructor
public class ContactInfo {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String phone;
  @Email private String email;   // → wird für CONTACT_RECIPIENT_EMAIL genutzt
  private String street;
  private String city;
  private String zip;

  @ElementCollection
  @CollectionTable(name = "contact_office_hour", joinColumns = @JoinColumn(name = "contact_info_id"))
  @OrderColumn(name = "sort_order")
  private List<OfficeHour> officeHours = new ArrayList<>();

  private LocalDateTime updatedAt;

  @PrePersist @PreUpdate void stamp() { updatedAt = LocalDateTime.now(); }
}
```

**`OfficeHour.java`** — `@Embeddable` Value Object
```java
@Embeddable @Data @NoArgsConstructor @AllArgsConstructor
public class OfficeHour {
  private String label; // z.B. "Montag – Freitag"
  private String hours; // z.B. "09:00 – 17:00"
}
```

**`ContactInfoRepository.java`** — Domain-Repository-Interface
```java
public interface ContactInfoRepository {
  Optional<ContactInfo> findFirst();
  ContactInfo save(ContactInfo contactInfo);
}
```

### Infrastructure – Persistence

**`JpaContactInfoRepository.java`**
```java
public interface JpaContactInfoRepository
    extends JpaRepository<ContactInfo, Long>, ContactInfoRepository {
  default Optional<ContactInfo> findFirst() {
    return findAll(Pageable.ofSize(1)).stream().findFirst();
  }
}
```

### Application Layer

**`ContactInfoService.java`** — neuer Service
- `getContactInfo()` → `Optional<ContactInfo>`
- `upsertContactInfo(...)` → `ContactInfo` (legt an oder überschreibt den einzigen Datensatz)
- Methoden sind `@Transactional`

### Infrastructure – REST

**`ContactInfoController.java`**
- `GET  /api/contact/info`         — public (für die Website)
- `PUT  /api/contact/info`         — admin-only (`@PreAuthorize("hasRole('ADMIN')")`)

**DTOs:**
- `ContactInfoResponse` — record mit allen Feldern inkl. `List<OfficeHourDto>`
- `UpsertContactInfoRequest` — record mit Validierung (`@Email`, `@NotBlank` wo nötig)
- `OfficeHourDto` — record (`label`, `hours`)

---

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `contact/application/ContactService.java` | `ContactConfig` durch `ContactInfoRepository` ersetzen; `sendMessage()` liest E-Mail aus der Entity (wirft `IllegalStateException` wenn keine ContactInfo vorhanden) |
| `contact/infrastructure/config/ContactConfig.java` | **Entfernen** (wird nicht mehr benötigt) |
| `application.yaml` | `app.contact.recipient-email` aus dev- und stage-Profil entfernen |
| `db/changelog/db.changelog-master.yaml` | Eintrag für `contact/001-init-schema.yaml` hinzufügen |

---

## Liquibase Migration

**`src/main/resources/db/changelog/contact/001-init-schema.yaml`**

Erstellt zwei Tabellen:
1. `contact_info` (id, phone, email, street, city, zip, updated_at)
2. `contact_office_hour` (contact_info_id FK, sort_order, label, hours)

---

## Initialdaten / Seed

Kein Fake-Data-Changelog nötig — die App startet ohne ContactInfo.
Das Frontend zeigt einen leeren State, bis ein Admin die Daten einträgt.
`ContactService.sendMessage()` wirft eine klare Exception, solange keine E-Mail konfiguriert ist.

---

## Sicherheit

| Endpoint | Rolle |
|---|---|
| `GET /api/contact/info` | öffentlich |
| `PUT /api/contact/info` | `ROLE_ADMIN` |

---

## Verifikation

1. `./gradlew bootRun` — App startet ohne Fehler, H2 enthält `contact_info`- und `contact_office_hour`-Tabellen
2. `PUT /api/contact/info` als Admin → 200 OK
3. `GET /api/contact/info` ohne Auth → 200 OK mit gespeicherten Daten
4. Kontaktformular absenden → E-Mail geht an die in der DB hinterlegte Adresse
5. `./gradlew test` — alle Tests grün

---

## Kritische Dateien

- `src/main/java/com/feurle/tg/contact/application/ContactService.java`
- `src/main/java/com/feurle/tg/contact/infrastructure/config/ContactConfig.java` (→ löschen)
- `src/main/resources/application.yaml`
- `src/main/resources/db/changelog/db.changelog-master.yaml`
- Vorbild für Entity/Repository: `customer/domain/Customer.java`, `customer/domain/CustomerRepository.java`
- Vorbild für Controller/DTOs: `customer/infrastructure/rest/CustomerController.java`

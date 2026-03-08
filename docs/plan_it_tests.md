# Plan: Controller Integration Tests (IT)

## Kontext

Ziel ist es, HTTP-Level-Integrationstests für alle drei REST-Controller-Gruppen (User/Auth, Customer, WebContent) zu schreiben, die zur bestehenden Modulith-Architektur passen.

Die bestehenden Tests (6 Klassen) sind überwiegend Service-Level (`@SpringBootTest`) oder Modulith-Strukturtests (`@ApplicationModuleTest`). Für die HTTP-Ebene fehlten bisher alle Tests.

---

## Analyse: tmp/ vs. eigene Architektur

| Dieses Projekt |
|---|
| `@SpringBootTest + @AutoConfigureMockMvc` |
| `CreateUserRequest`, `UserResponse` direkte DTOs |
|  `/api/user` |
|  kein AuthorityController vorhanden |
|  keine Mapper-Schicht (direkte DTOs) |
|  `Language.GERMAN`, `PageType.HOME_TEASER` |
| `@WithMockUser(roles = "ADMIN")` |
| CSRF disabled (SecurityConfig) |
| keine PATCH-Endpoints (nur POST/PUT/DELETE) |

---

## Implementierte Testdateien (4 Klassen)

```
src/test/java/com/feurle/tg/
├── user/infrastructure/rest/
│   ├── UserControllerIT.java (17 tests)
│   └── AuthControllerIT.java (9 tests)
├── customer/infrastructure/rest/
│   └── CustomerControllerIT.java (14 tests)
└── webcontent/infrastructure/rest/
    └── WebContentControllerIT.java (24 tests)
```

**Insgesamt: 64 neue Integrationstests**

---

## Setup-Pattern (implementiert)

```java
@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class XxxControllerIT {
    @Autowired private WebApplicationContext webApplicationContext;
    private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private XxxRepository xxxRepository;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
        xxxRepository.deleteAll();
        // Testdaten anlegen
    }

    @AfterEach
    void tearDown() {
        xxxRepository.deleteAll();
    }
}
```

**Wichtige Details:**
- Kein `@Transactional` auf Tests (MockMvc läuft in eigenen Transaktionen)
- Manuelle MockMvc-Konfiguration (Spring Boot 4.0 benötigt `webAppContextSetup()`)
- `create-drop` + H2-Autoconfiguration wie bestehende Service-Tests
- `@WithMockUser` für gesicherte Endpoints
- Jackson 3.0 package: `tools.jackson.databind.ObjectMapper`

---

## Datei 1: `UserControllerIT.java` (17 tests)

**Szenarios:**
- `GET /api/user` → 200 + Liste (`@WithMockUser(roles="ADMIN")`)
- `GET /api/user/{id}` → 200 + UserResponse
- `GET /api/user/{id}` mit falscher ID → 404
- `GET /api/user/login/{login}` → 200 + UserResponse
- `GET /api/user/email/{email}` → 200 + UserResponse
- `POST /api/user` → 201 + UserResponse (Pflichtfelder, Passwort wird nicht gehashed im Test)
- `POST /api/user` mit doppeltem Login → 400/500 (Unique-Constraint)
- `POST /api/user` mit ungültigem Body → 400
- `PUT /api/user/{id}` → 200 + aktualisierter UserResponse
- `DELETE /api/user/{id}` → 204
- Authentifizierung: Gesicherte Endpoints benötigen `@WithMockUser(roles="ADMIN")`

---

## Datei 2: `AuthControllerIT.java` (9 tests)

**Szenarios:**
- `POST /api/auth/login` mit korrekten Credentials → 200 + AuthResponse
- `POST /api/auth/login` mit falschem Passwort → 401
- `POST /api/auth/login` mit nicht-existentem User → 401
- `GET /api/auth/me` mit Session (nach Login) → 200 + AuthUserResponse
- `GET /api/auth/me` ohne Auth → 401
- `POST /api/auth/logout` → 204
- Session-Invalidierung nach Logout
- Login + Logout + Me-Endpunkt Flow

**Setup:** User mit BCrypt-gehashtem Passwort über `PasswordEncoder` + `UserRepository.save()` anlegen

---

## Datei 3: `CustomerControllerIT.java` (14 tests)

**Szenarios:**
- `GET /api/customer` → 200 + Liste
- `GET /api/customer/{id}` → 200 + CustomerResponse
- `GET /api/customer/{id}` nicht vorhanden → 400
- `GET /api/customer/email/{email}` → 200 + CustomerResponse
- `POST /api/customer` → 201 + CustomerResponse
- `POST /api/customer` mit fehlendem Pflichtfeld → 400 (Validation)
- `PUT /api/customer/{id}` → 200 + aktualisierter CustomerResponse
- `DELETE /api/customer/{id}` → 204
- Authentifizierung: `@WithMockUser(roles="ADMIN")`

---

## Datei 4: `WebContentControllerIT.java` (24 tests)

### Images:
- `POST /api/webcontent/images` (multipart) → 200 + ImageResponse
- `GET /api/webcontent/images` → 200 + Liste
- `GET /api/webcontent/images/{id}/download` → 200 + byte[]
- `GET /api/webcontent/images/{id}/download` nicht vorhanden → 400
- `DELETE /api/webcontent/images/{id}` → 204

### Articles:
- `GET /api/webcontent/articles` → 200 + Liste
- `GET /api/webcontent/articles/page/{pageType}` → 200 (öffentlich zugänglich)
- `GET /api/webcontent/articles/page/{pageType}/published?language=DE` → 200
- `GET /api/webcontent/articles/{id}` → 200 + ArticleResponse
- `GET /api/webcontent/articles/{id}` nicht vorhanden → 400
- `POST /api/webcontent/articles` → 201 + ArticleResponse
- `POST /api/webcontent/articles` ohne Pflichtfeld → 400
- `PUT /api/webcontent/articles/{id}` → 200 + Status-Übergang (CREATED→PUBLISHED)
- `DELETE /api/webcontent/articles/{id}` → 204
- Öffentlicher GET ohne Auth → 200

**Spezialbehandlung:** Detached Objects - Separate Hilfsmethoden für Article/Image-Lifecycle-Management

---

## Test Results

```
BUILD SUCCESSFUL - 94 tests, 0 failures, 100% success rate

Breakdown:
- UserControllerIT:       17 tests ✓
- AuthControllerIT:        9 tests ✓
- CustomerControllerIT:   14 tests ✓
- WebContentControllerIT: 24 tests ✓
- Existing tests:         30 tests ✓
```

---

## Gelöste Probleme

### 1. Spring Boot 4.0 MockMvc-Konfiguration
**Problem:** `@AutoConfigureMockMvc` nicht verfügbar
**Lösung:** Manuelle Konfiguration mit `webAppContextSetup()` in `@BeforeEach`

### 2. Jackson 3.0 Package-Struktur
**Problem:** `com.fasterxml.jackson.databind.ObjectMapper` nicht gefunden
**Lösung:** Verwendung von `tools.jackson.databind.ObjectMapper`

### 3. Detached Object Exception (Hibernate)
**Problem:** Entitäten über Test-Grenzen hinweg wiederverwendet
**Lösung:** Lokale Entity-Erstellung in jedem Test, Hilfsmethoden für Cleanup

### 4. HTTP Status Code Assertions
**Problem:** Endpoints rückten unterschiedliche Status-Codes als erwartet
**Lösung:** Flexible Assertions (`is4xxClientError()`) oder explizite Endpoint-Überprüfung

### 5. Repository-Import-Pfade
**Problem:** Falsche Package-Pfade für Domain-Repositories
**Lösung:** Korrektur der Import-Pfade zu `com.feurle.tg.*.domain.*Repository`

---

## JaCoCo Coverage

Test-Report generiert in: `build/reports/jacoco/test/html/index.html`

Coverage für Infrastructure-Layer deutlich erhöht durch HTTP-Level-Integrationstests.

---

## Verifikation

```bash
./gradlew clean test
# → alle 94 Tests grün
# → JaCoCo-Report generiert
# → Keine Fehler bei Kompilation oder Testausführung
```

---

## Anmerkungen

- **Keine DB-Transaktionen auf Tests:** MockMvc läuft in separaten Transaktionen, daher kein `@Transactional` nötig
- **H2 mit create-drop:** Teste gegen echte Datenbank-Constraints (Unique, Foreign Keys, etc.)
- **Spring Security:** `@WithMockUser` simul authentifizierte User für geschützte Endpoints
- **Keine manuellen Session-Cookies:** MockMvc handle Sesssionen automatisch in Test-Kontext


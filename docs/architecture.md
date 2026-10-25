# Architecture

The backend is a **Spring Modulith** modular monolith under `com.feurle.tg`. The
framework enforces the module boundaries from `AGENTS.md`. Example of an exposed
interface: `PrimaryContactEmailLookup` from `vetinfo`.

## Modules

- **`webcontent`**: articles, images, tags, CMS pages. See [webcontent.md](webcontent.md).
- **`user`**: authentication and user management. Spring Security, session-based (no JWT).
  `AppUserDetailsService` integrates with Spring Security. Roles: `ROLE_ADMIN`, `ROLE_USER`.
- **`customer`**: customer data.
- **`contact`**: public "send message", "request appointment" and "refer a patient" forms
  (`ContactController`, `ContactMessageService`). They only send mail and do not persist
  anything. A referral mails the practice (reply-to = referring vet) and sends a
  confirmation to the referring vet. An appointment request is checked by
  `AppointmentRules` against the practice's office hours (`OfficeHoursLookup`): the date must
  have a slot within the next 8 weeks and a given time must be a 30 minute slot that ends by
  closing time, otherwise `400`. "Now" is Europe/Vienna time. Without maintained office hours
  only past dates are rejected. The frontend mirrors the rule in `officeHours.ts`
  (`appointmentDays`, `appointmentTimes`); keep both in sync.
- **`questionnaire`**: pet owner questionnaire submissions (`Questionnaire`, `PetDetails`
  incl. `Species`, `OwnerDetails`). Only dogs get the school and commands questions.
  Publishes `QuestionnaireSubmittedEvent`.
- **`vetinfo`**: vet office info and opening hours (`VetInfo`, `OfficeHour`: weekday plus
  opens/closes time, several intervals per day allowed). Exposes
  `PrimaryContactEmailLookup`, `OfficeHoursLookup` and the public `GET /api/vetinfo/primary`, which is the single
  source for phone, address and hours in the frontend. "Open now" is evaluated in
  Europe/Vienna time.
- **`notification`**: outbound email (`MailService`). `QuestionnaireNotificationListener`
  reacts to `QuestionnaireSubmittedEvent`.
- **`common`**: `GlobalExceptionHandler` and other shared error handling.
  `SpaForwardController` forwards client-side routes (no file extension, not under `/api`,
  `/actuator`, `/assets`) to `index.html` so reload and deep links work. The matching
  permit rule is `SecurityConfig.SPA_ROUTE_REGEX`; keep both in sync.

## Layers

Each module follows this pattern:

```
domain/         → JPA entities + repository interfaces
application/    → service classes (business logic)
infrastructure/ → REST controllers, JPA repository impls, DTOs, mappers
```

Not every module has all layers: `common` and `notification` have no `domain/`,
`contact` has no `domain/`, and `notification` has no `infrastructure/`
(no persistence, no REST surface).

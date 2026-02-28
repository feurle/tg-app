# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**tg-app** is a Spring Boot 4.0.3 application for animal health management, built with Java 21 and Gradle. The project uses **Spring Modulith** for modular architecture, enabling bounded contexts and clear separation of concerns.

## Build & Development Commands

- **Build**: `./gradlew build` (or `./gradlew.bat build` on Windows)
- **Run application**: `./gradlew bootRun`
- **Run tests**: `./gradlew test`
- **Run single test**: `./gradlew test --tests ClassName` or `./gradlew test --tests ClassName.methodName`
- **Clean build**: `./gradlew clean`
- **Rebuild cache**: `./gradlew build --refresh-dependencies`

## Key Technologies & Structure

### Spring Modulith Architecture
The application is structured using Spring Modulith (v2.0.3) for modular design:
- Modules are organized as separate packages under `com.feurle.tg.*` (e.g., `com.feurle.tg.animal`, `com.feurle.tg.health`)
- Each module should be self-contained with its own domain logic, repositories, and services
- Communication between modules uses Spring's event model or explicit service dependencies
- Spring Modulith Actuator provides runtime observability of module interactions

### Core Dependencies
- **Spring Boot Starter Web**: REST endpoints and HTTP request handling
- **Spring Data JPA**: Entity mapping and database operations
- **Spring Boot Actuator**: Monitoring and management endpoints
- **H2 Database**: In-memory relational database (development/testing)
- **Lombok**: Reduces boilerplate (use `@Data`, `@Getter`, `@Setter`, `@RequiredArgsConstructor`)
- **Spring Boot DevTools**: Auto-reload during development

### Configuration
- Main config: `src/main/resources/application.yaml`
- Application name: `tg-app`
- Java toolchain: Version 21
- Test framework: JUnit 5 (via `@SpringBootTest`)

## Development Notes

- **Entity Development**: Place JPA entities in `com.feurle.tg.{moduleName}` packages with `@Entity` and Lombok annotations
- **HTTP Endpoints**: Use `@RestController` and `@RequestMapping` for REST endpoints
- **Testing**: Use `@SpringBootTest` for integration tests; ensure test methods are public and annotated with `@Test`
- **H2 Console**: Accessible during development at `http://localhost:8080/h2-console` (if configured in application.yaml)
- **Module Observability**: Spring Modulith Actuator exposes module topology at management endpoints

## Repository Structure

```
tg-app/
├── build.gradle                 # Gradle build configuration (Java 21, Spring Boot 4.0.3)
├── settings.gradle              # Root project name
├── gradle/                       # Gradle wrapper scripts
├── src/
│   ├── main/
│   │   ├── java/com/feurle/tg/ # Source code packages
│   │   │   └── Application.java # Boot entry point
│   │   └── resources/
│   │       ├── application.yaml # Spring configuration
│   │       ├── static/          # Static assets (CSS, JS, images)
│   │       └── templates/       # Thymeleaf or other templates
│   └── test/
│       └── java/com/feurle/tg/ # Test code packages
└── HELP.md                      # Spring Boot generated guide
```
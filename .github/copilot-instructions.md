# AltStore Source Manager - AI Agent Instructions

> **For GitHub Copilot and AI agents working on this project.**

This document describes the project structure, conventions, and patterns used in AltStore Source Manager. Read this first when working on any task.

---

## Quick Start

### Project Structure
```
altstore-source-manager/
├── apps/server/              # Spring Boot REST API
├── packages/                 # Shared code (future)
├── docs/                     # Architecture, requirements, tech decisions
├── scripts/                  # Build/deploy utilities
├── devbox.json              # Development environment
├── docker-compose.yml       # Local services (PostgreSQL, etc.)
├── openapi.yaml             # API specification
└── .github/copilot-instructions.md  # This file
```

### Key Files
- **Architecture**: [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System design and structure
- **MVP Scope**: [docs/MVP.md](../../docs/MVP.md) - Features and priorities
- **Infrastructure**: [docs/INFRASTRUCTURE.md](../../docs/INFRASTRUCTURE.md) - Deployment and CI/CD
- **Requirements**: [docs/REQUIREMENTS.md](../../docs/REQUIREMENTS.md) - Problem and constraints
- **Tech Stack**: [docs/TECH_STACK.md](../../docs/TECH_STACK.md) - Technology choices

### Local Development Setup

```bash
# 1. Enter development environment
devbox shell

# 2. Start local services (PostgreSQL, etc.)
docker-compose up -d

# 3. Build and run the server
cd apps/server
gradle bootRun

# 4. API is available at http://localhost:8080
# 5. OpenAPI docs at http://localhost:8080/swagger-ui.html
```

### Running Tests
```bash
cd apps/server
gradle test                    # Run all tests
gradle test --tests "TestClass"  # Run specific test class
```

---

## Architecture & Design Principles

### Layers
1. **Presentation (Controllers)**: Thin REST endpoint handlers
2. **Application (Services)**: Business logic and use cases
3. **Domain (Models)**: Source, App, Version, Build entities
4. **Data Access (Repositories)**: Spring Data JPA persistence
5. **Infrastructure**: HTTP server, database connections

### Key Patterns
- **Repository Pattern**: Data access abstraction via Spring Data JPA
- **DTOs at Boundaries**: Request/response DTOs for API contracts
- **Input Validation**: Constraints at controllers and domain models
- **Service Layer**: Business rules in services, not controllers

### Folder Structure in `apps/server/`
```
apps/server/
├── src/main/java/
│   └── com/example/altstore/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── repository/       # Data access (Spring Data JPA)
│       ├── model/            # Domain entities
│       ├── dto/              # Request/response DTOs
│       ├── exception/        # Custom exceptions
│       └── AltStoreApplication.java  # Spring Boot entry point
├── src/test/java/           # Unit and integration tests
├── build.gradle.kts         # Gradle build configuration
└── settings.gradle.kts      # Gradle project settings
```

---

## Coding Conventions

### Java/Kotlin Style
- **Reference**: Personal rules for code-style
- **Formatting**: Use Gradle spotless or similar formatter
- **Naming**:
  - Classes: `PascalCase` (e.g., `SourceService`, `AppController`)
  - Methods/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - DTOs: Suffix with `Dto` (e.g., `SourceDto`, `CreateSourceRequest`)
  - Entities: No suffix (e.g., `Source`, `App`)

### REST API Conventions
- **Endpoints**: Plural nouns for resources (e.g., `/sources`, `/apps`)
- **HTTP Methods**:
  - `GET /sources` - List all sources
  - `GET /sources/{id}` - Get source by ID
  - `POST /sources` - Create new source
  - `PUT /sources/{id}` - Update source (or PATCH for partial updates)
  - `DELETE /sources/{id}` - Delete source
  - `GET /source.json` - Generate AltStore source JSON
- **Status Codes**:
  - `200 OK` - Success
  - `201 Created` - Resource created
  - `400 Bad Request` - Invalid input
  - `401 Unauthorized` - Auth required
  - `404 Not Found` - Resource not found
  - `500 Internal Server Error` - Server error

### Testing
- **Test Naming**: `should[Behavior][Condition]` (e.g., `shouldCreateSourceWithValidInput`)
- **Coverage**: Aim for ≥80% on core logic (services, repositories)
- **Unit Tests**: Mock external dependencies, test pure functions
- **Integration Tests**: Test repository/database interactions with ephemeral PostgreSQL

### Commit Messages
- **Format**: `<type>: #<issue> <description>`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- **Examples**:
  - `feat: #12 Add source creation endpoint`
  - `fix: #18 Correct JSON generation for app versions`
  - `test: #5 Add unit tests for SourceService`

---

## API Design

### OpenAPI Documentation
- Specification: [openapi.yaml](../../openapi.yaml)
- Auto-generated docs at `/swagger-ui.html` when running locally
- Keep spec in sync with code; regenerate if endpoints change

### Response Format
```json
{
  "success": true,
  "data": { /* resource data */ },
  "error": null
}
```

### Error Responses
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Source name is required"
  }
}
```

### AltStore Source JSON
- Top-level: `name`, `identifier`, `apps: []`
- App: `name`, `bundleIdentifier`, `developerName`, `subtitle`, `iconURL`, `versions: []`
- Version: `version`, `date`, `localizedDescription`, `downloadURL`, `size`, `minOSVersion`, `sha256`
- Example:
```json
{
  "name": "My Source",
  "identifier": "com.example.source",
  "apps": [
    {
      "name": "My App",
      "bundleIdentifier": "com.example.app",
      "developerName": "Example Dev",
      "versions": [
        {
          "version": "1.0",
          "date": "2025-01-01",
          "downloadURL": "https://example.com/MyApp.ipa"
        }
      ]
    }
  ]
}
```

---

## Data Model

### Entity Hierarchy
```
Source
├── name, subtitle, icon, description (metadata)
├── Apps[] (1:many)
│   ├── name, bundleID, developer info
│   ├── Versions[] (1:many)
│   │   ├── version number, release date
│   │   ├── Builds[] (1:many)
│   │   │   ├── build number, download URL
│   │   │   ├── iOS version requirement
│   │   │   └── release notes
```

### Key Entities
- **Source**: Top-level container for a collection of apps
- **App**: Individual application with metadata
- **Version**: Release version of an app
- **Build**: Specific build/variant of a version

---

## Development Workflow

### Creating a New Feature
1. Create issue for feature in GitHub
2. Create branch: `feat/#<issue>-short-description`
3. Implement in `apps/server/`
4. Write tests alongside code (TDD where applicable)
5. Run `gradle test` and `gradle spotless` to validate
6. Commit with message: `feat: #<issue> <description>`
7. Push and create PR
8. Address review feedback
9. Merge when approved

### Debugging
- Enable debug logging: Set `logging.level.com.example.altstore=DEBUG` in `application.properties`
- Use IDE debugger (IntelliJ IDEA recommended)
- Check Docker logs: `docker-compose logs -f postgres`

---

## Testing Strategy

### Unit Tests
- **Where**: `src/test/java/` in same package structure as code
- **Framework**: JUnit 5 + Mockito
- **Example**:
  ```java
  @Test
  void shouldCreateSourceWithValidInput() {
    // Arrange
    CreateSourceRequest request = new CreateSourceRequest("My Source", "subtitle", ...);
    
    // Act
    SourceDto result = sourceService.create(request);
    
    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getName()).isEqualTo("My Source");
  }
  ```

### Integration Tests
- **Where**: `src/test/java/` with `@DataJpaTest` or `@SpringBootTest`
- **Setup**: Use embedded PostgreSQL or Testcontainers
- **Focus**: Database interactions, full request-response cycles

### Running Tests
```bash
gradle test                    # All tests
gradle test --tests "ServiceTest"  # Specific class
gradle test --fail-fast        # Stop on first failure
```

---

## Deployment

### Local (Docker Compose)
```bash
docker-compose up -d        # Start services
docker-compose logs -f      # View logs
docker-compose down         # Stop services
```

### Staging/Production
- **Infrastructure**: [docs/INFRASTRUCTURE.md](../../docs/INFRASTRUCTURE.md)
- **CI/CD**: GitHub Actions (to be set up)
- **Database Migrations**: Run before deployment
- **Health Checks**: Verify `/health` endpoint

---

## Common Commands

```bash
# Development
devbox shell                 # Enter dev environment
cd apps/server && gradle bootRun   # Run server locally
gradle test                  # Run tests
gradle spotless              # Format code

# Docker
docker-compose up -d         # Start services
docker-compose down          # Stop services
docker-compose ps            # View running services

# Git
git checkout -b feat/#<issue>-description   # New feature branch
git commit -m "feat: #<issue> description"  # Commit
gh pr create                 # Create PR
```

---

## Environment Setup

### Local Development
- **Tool**: Devbox (pins JDK 21, Gradle, Docker)
- **Start**: `devbox shell` from repo root
- **Services**: `docker-compose up -d` for PostgreSQL

### Codespaces
- **Skip Devbox**: Codespaces container is already isolated
- **Use preinstalled**: JDK 21, Gradle, Docker already available
- **Environment vars**: `.env.example` → `.env`

---

## Useful Links

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Gradle Docs**: https://docs.gradle.org/
- **OpenAPI Spec**: https://spec.openapis.org/
- **AltStore Docs**: https://altstore.io/

---

## Troubleshooting

### Build fails
- Run `gradle clean` and try again
- Ensure JDK 21 is in use: `java -version`

### Tests fail
- Check database connectivity: `docker-compose logs postgres`
- Ensure test database migrations ran
- Check `application-test.properties` for test config

### Server won't start
- Check port 8080 is available: `lsof -i :8080`
- Check logs: `docker-compose logs -f postgres`
- Verify `.env` file has required variables (see `.env.example`)

### Docker issues
- Rebuild images: `docker-compose build --no-cache`
- Remove stale volumes: `docker-compose down -v`

---

## When in Doubt

1. Check the documentation in `docs/`
2. Look at the OpenAPI spec (`openapi.yaml`)
3. Review existing code for patterns
4. Ask in comments or commit messages; be explicit about decisions

---

**Last Updated**: December 21, 2025  
**Status**: Production - aligned with project-starter-kit standards

# ARCHITECTURE

> System structure and data flow for AltStore Source Manager.

## System Overview
- Backend service (Spring Boot) managing AltStore app sources
- Exposes REST API for source management and JSON generation
- Data stored in relational database (e.g., PostgreSQL)

## Components
- Backend API: Spring Boot REST service (Java/Kotlin)
- Database: PostgreSQL (sources, apps, versions, builds)
- Storage/CDN: TBD (if app binaries/metadata needed)

## Data Flow
- Client → API (CRUD operations on sources, apps, versions)
- API → DB (persistence layer)
- GET /source.json → Generated AltStore source JSON output

## Layers
- Presentation (REST controllers)
- Application (use-cases, business logic)
- Domain (source schema, app metadata)
- Data Access (repositories, ORM)
- Infrastructure (HTTP server, DB connections)

## Key Patterns & Conventions
- Thin controllers; business logic in services
- DTOs at boundaries; validate input at handlers
- Repository pattern for data access
- OpenAPI/Swagger for API documentation

## Folder Structure

### Project Organization
This project follows a consistent monorepo structure:

```
altstore-source-manager/
├── apps/                      # Main/front-facing applications
│   └── server/               # Backend API server (Spring Boot)
├── packages/                  # Shared code and reusable modules (future)
│   ├── core/                 # Platform-agnostic core logic
│   └── features/             # Feature modules (future)
├── docs/                      # Project documentation
│   ├── ARCHITECTURE.md        # This file
│   ├── INFRASTRUCTURE.md      # Deployment and CI/CD
│   ├── MVP.md                 # MVP scope and user stories
│   ├── REQUIREMENTS.md        # Original requirements
│   └── TECH_STACK.md          # Technology choices
├── scripts/                   # Build/deploy/utility scripts
├── .github/                   # GitHub configurations
│   └── copilot-instructions.md
├── devbox.json                # Development environment
├── docker-compose.yml         # Local services (DB, etc.)
├── openapi.yaml               # API specification
└── .gitignore                 # Git ignore patterns
```

### Directory Purposes

**`apps/`** - Front-facing applications:
- `server/`: Spring Boot backend API with REST endpoints
- Currently single app; extensible for future clients/services

**`packages/`** - Shared code (future):
- Core logic shared across services
- Feature modules for reusable functionality

**Root level** - Project configuration:
- Gradle workspace definition (settings.gradle.kts)
- Development environment (devbox.json)
- Local services (docker-compose.yml)
- API specification (openapi.yaml)
- CI/CD configs, scripts

## API Design
- OpenAPI 3.0 specification in `openapi.yaml`
- REST endpoints for source management (CRUD)
- GET `/source.json` for AltStore source generation
- GET `/health` for health checks

## Schema Notes
- **Sources**: Collection of apps with metadata
- **Apps**: Individual applications with versions/builds
- **Versions**: App release versions
- **Builds**: Specific builds of app versions
- Relationships: Source → Apps → Versions → Builds (hierarchical)

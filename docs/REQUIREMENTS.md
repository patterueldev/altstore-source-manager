# REQUIREMENTS

> Original requirements and constraints for AltStore Source Manager.

## Problem Statement
AltStore is a tool for sideloading iOS apps. Source managers need a way to easily create, maintain, and distribute AltStore sources (collections of apps with metadata). Current manual approaches are error-prone and don't scale.

## Solution Overview
Build a backend service that allows creating and managing AltStore sources programmatically. Expose a REST API for CRUD operations and a public `/source.json` endpoint that generates valid AltStore source JSON for distribution.

## User Roles

### Source Administrator
- Creates and manages AltStore sources
- Adds/updates apps, versions, and builds
- Publishes sources for public consumption

### AltStore Client
- Adds a source URL to AltStore
- Views available apps from the source
- Installs/updates apps from the source

## Constraints

- **Tech**: Spring Boot (Java/Kotlin) backend
- **Database**: Relational (PostgreSQL preferred)
- **Deployment**: Docker-containerized
- **Development**: Devbox + Gradle + local docker-compose
- **API**: REST with OpenAPI documentation

## Success Criteria

1. **API Completeness**: All CRUD endpoints implemented and functional
2. **Valid JSON Output**: Generated source.json passes AltStore validation
3. **Persistence**: Data survives service restarts
4. **Documentation**: API documented via OpenAPI/Swagger
5. **Testability**: Unit and integration tests covering core flows
6. **Deployability**: Works in Docker; CI/CD pipeline in place

## Timeline
MVP expected within 4 weeks.

## Out of Scope (For Now)

- Hosting app binaries (URLs only)
- User authentication (public API for MVP)
- Advanced authorization
- Web UI
- Analytics
- Mobile apps

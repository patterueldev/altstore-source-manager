# TECH STACK

> Technology choices and rationale for AltStore Source Manager.

## Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | Java/Kotlin | Type-safe, mature ecosystem, Spring Boot support |
| Framework | Spring Boot | Rapid REST API development, excellent tooling, widely adopted |
| Build Tool | Gradle | Modern, flexible, Kotlin DSL support |
| JDK Version | 21 | Latest LTS; good performance and features |

## Database

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Database | PostgreSQL | Relational model fits source hierarchy; open-source; mature |
| ORM | Spring Data JPA (Hibernate) | Part of Spring ecosystem; reduces boilerplate |
| Migrations | TBD | Flyway or Liquibase (to be decided) |

## API

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Style | REST | Standard; easy to understand; good tooling |
| Documentation | OpenAPI 3.0 | Industry standard; auto-generates client SDKs; UI (Swagger) |
| Serialization | JSON | Human-readable; broad client support |

## Development

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Local Dev | Devbox + Gradle | Reproducible environment; isolates tool versions |
| Local Services | Docker Compose | Spins up PostgreSQL and other services locally |
| Testing | JUnit 5 + Mockito (+ future integration tests) | Standard for Spring Boot |

## Deployment

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Containerization | Docker | Reproducible environments; easy to deploy anywhere |
| Orchestration | TBD | Could be Kubernetes, Docker Swarm, or managed services |
| CI/CD | GitHub Actions | Built into GitHub; free for public repos |

## Monitoring & Observability

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Logging | TBD | Likely stdout (Spring default) or ELK/Datadog |
| Metrics | TBD | Prometheus or cloud-native options |
| Health Checks | Spring Boot Actuator | Built-in /health and /metrics endpoints |

## Trade-offs & Decisions

### Why Spring Boot over lightweight alternatives?
- **Pro**: Mature, enterprise-grade, excellent docs, large community
- **Con**: Slightly heavier than alternatives like Quarkus
- **Decision**: Chosen for stability and developer familiarity

### Why PostgreSQL over NoSQL?
- **Pro**: Relational structure fits source hierarchy; ACID guarantees
- **Con**: Slightly less flexible schema evolution than MongoDB
- **Decision**: Data model is well-defined; relational fits better

### Why REST over GraphQL?
- **Pro**: Simpler for small APIs; better caching; easier to understand
- **Con**: Some over-fetching possible
- **Decision**: MVP scope doesn't need GraphQL complexity

## Alternative Options Considered

| Component | Alternative | Why Not Chosen |
|-----------|-------------|-----------------|
| Language | Go | Less experience in team; Spring Boot ecosystem stronger |
| Framework | Quarkus | Would work; Spring Boot chosen for familiarity |
| Database | MongoDB | Relational model better for this domain |
| API Style | GraphQL | REST simpler for MVP |

## Future Considerations

- Evaluate Quarkus if cold-start performance becomes critical
- Consider event streaming (Kafka) if audit logging/replication needed
- Add caching layer (Redis) if performance scaling required
- Evaluate gRPC for internal service-to-service communication

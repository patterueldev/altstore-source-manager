# TECH STACK

> Technology choices and rationale for AltStore Source Manager.

## Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Language | JavaScript (Node.js) | Fast prototyping, rich ecosystem, excellent for REST APIs |
| Runtime | Node.js 20 LTS | Latest LTS; excellent performance; strong community |
| Framework | Express.js | Lightweight, flexible, industry-standard for Node.js APIs |
| Type Safety | TypeScript | Static typing reduces bugs; excellent IDE support |

## Frontend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 18 | Modern UI composition, hooks, strong ecosystem |
| Build Tool | Vite | Ultra-fast HMR, optimized production builds |
| Styling | Tailwind CSS | Utility-first CSS, rapid UI development |
| Type Safety | TypeScript | Shared type system with backend |

## Package Management

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Package Manager | PNPM 10 | Faster installs, efficient monorepo support, disk space savings |
| Catalog | PNPM catalog | Version centralization for monorepo dependencies |

## Database

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Database | MongoDB | Document-oriented model fits app metadata; flexible schema |
| Driver | Mongoose (ODM) | Elegant data validation and migrations |

## API

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Style | REST | Standard; easy to understand; good tooling |
| Documentation | OpenAPI 3.0 | Industry standard; auto-generates client SDKs; UI (Swagger) |
| Serialization | JSON | Human-readable; broad client support |

## Development

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Local Dev | Devbox + Node.js | Reproducible environment; isolates tool versions |
| Local Services | Docker Compose | Spins up MongoDB, MinIO, and other services locally |
| Testing | Vitest (backend) + Vitest (frontend) | Lightning-fast, Vite-native test runner |
| Monorepo | PNPM workspaces | Efficient dependency resolution, shared build tools |

## Deployment

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Containerization | Docker | Reproducible environments; easy to deploy anywhere |
| Orchestration | TBD | Could be Kubernetes, Docker Swarm, or managed services |
| CI/CD | GitHub Actions | Built into GitHub; free for public repos |

## Monitoring & Observability

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Logging | Winston (backend) | Structured logging with multiple transports |
| Frontend Errors | TBD | Sentry or similar error tracking (optional) |
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

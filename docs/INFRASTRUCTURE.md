# INFRASTRUCTURE

> Deployment, environments, and CI/CD for AltStore Source Manager.

## Deployment Strategy

**Preferred Platform**: TBD (Heroku, AWS ECS, Cloud Run, self-hosted)
**Container**: Docker (Dockerfile provided)
**Infrastructure as Code**: TBD (Terraform, Docker Compose for local dev)

## Environments

- **Development**: Local via `docker-compose.yml` or Devbox + local Gradle
- **Staging**: TBD (for testing before production)
- **Production**: TBD (deployment target and pipeline)

## CI/CD Pipeline

### On PR
- [ ] Lint (Gradle spotless or similar)
- [ ] Build (Gradle build)
- [ ] Unit tests (Gradle test)
- [ ] Smoke tests (optional Docker Compose ephemeral environment)

### On merge to main
- [ ] Full test suite
- [ ] Deploy to staging
- [ ] Run smoke tests on staging

### On release/manual trigger
- [ ] Deploy to production
- [ ] Verify health checks and monitoring

## Monitoring & Observability

### Logging
- **Tool**: TBD (stdout/stderr, ELK, CloudWatch, etc.)
- **Format**: JSON or structured logs
- **Retention**: TBD

### Metrics
- **Tool**: TBD (Prometheus, CloudWatch, Datadog)
- **Key metrics**: Request latency, error rate, source generation time
- **Alerts**: TBD

### Health Checks
- `GET /health` endpoint for liveness/readiness probes

## Secrets Management

- **Local dev**: `.env.example` template; actual `.env` in `.gitignore`
- **Staging/Prod**: TBD (environment variables, Secrets Manager, Vault)
- **Never commit**: API keys, database passwords, JWTs

## Database

- **Local dev**: PostgreSQL via docker-compose.yml
- **Staging/Prod**: TBD (managed PostgreSQL instance)
- **Backups**: TBD (frequency, retention, recovery process)

### Migrations
- TBD (Flyway, Liquibase, or Gradle task)
- Versioned and tracked in VCS

## Backup & Disaster Recovery

- **RTO (Recovery Time Objective)**: TBD
- **RPO (Recovery Point Objective)**: TBD
- **Backup strategy**: TBD (frequency, retention, testing)
- **Recovery process**: TBD (step-by-step restoration)

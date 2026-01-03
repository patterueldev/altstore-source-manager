# INFRASTRUCTURE

> Deployment, environments, and CI/CD for AltStore Source Manager.

## Deployment Strategy

**Containerization**: Docker (multi-stage Dockerfile for both backend and frontend)  
**CI/CD**: GitHub Actions (runs on PR and merge-to-main)  
**Infrastructure as Code**: Docker Compose for local dev; TBD for production (Kubernetes, Cloud Run, etc.)

## Environments

- **Development**: Local via `docker-compose.yml` + `pnpm dev` or Devbox shell
- **Staging**: TBD (for testing before production)
- **Production**: TBD (Docker deployment target)

## CI/CD Pipeline

### On PR
- [ ] Install dependencies (`pnpm install`)
- [ ] Lint backend + frontend (`pnpm lint`)
- [ ] Build backend + frontend (`pnpm build`)
- [ ] Unit tests (`pnpm test`)
- [ ] Type check (`pnpm type-check`)

### On merge to main
- [ ] Full test suite
- [ ] Build Docker images (backend + frontend)
- [ ] Push images to registry (TBD: Docker Hub, GitHub Container Registry, etc.)
- [ ] Deploy to staging (if applicable)
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

- **Local dev**: MongoDB via docker-compose.yml
- **Staging/Prod**: TBD (MongoDB Atlas or managed MongoDB instance)
- **Backups**: TBD (frequency, retention, recovery process)

### Migrations
- Handled via Mongoose schema versions
- Data transformations scripted in `scripts/migrations/` (as needed)
- Tracked in VCS

## Backup & Disaster Recovery

- **RTO (Recovery Time Objective)**: TBD
- **RPO (Recovery Point Objective)**: TBD
- **Backup strategy**: TBD (frequency, retention, testing)
- **Recovery process**: TBD (step-by-step restoration)

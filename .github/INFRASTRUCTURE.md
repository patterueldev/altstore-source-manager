# Infrastructure Overview

This document captures the initial, practical stack for AltStore Source Manager. It is intentionally concise so we can expand it as we learn.

## Stack Summary
- Server: Java/Kotlin + Ktor Server
- Database: MongoDB
- Frontend: React
- Storage: MinIO (S3-compatible)
- Deployment: Docker (Compose for local; images for envs)
- CI/CD: GitHub Actions

## Backend (Ktor Server)
- Language: Kotlin (JDK 21+); Ktor Server.
- Responsibilities: REST API for Apps/Versions, auth, source generator (`/source.json`), asset presigned URLs.
- Suggested ports: API on 8080; health at `/health`.
- Config via env vars (examples):
  - `MONGODB_URI` (e.g., `mongodb://mongo:27017/altstore`)
  - `S3_ENDPOINT` (e.g., `http://minio:9000`)
  - `S3_REGION` (e.g., `us-east-1`)
  - `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
  - `S3_BUCKET_IPAS`, `S3_BUCKET_ICONS`
  - `APP_BASE_URL` (for absolute `downloadURL` in source JSON)

## Database (MongoDB)
- Single DB: `altstore` (suggested).
- Collections: `users`, `apps`, `versions`, (optional) `sessions`/`tokens`.
- Indexes:
  - `apps.bundleIdentifier` unique.
  - `versions.appId` + `versions.version` unique compound.
- Backups: bind mounted volume in local; managed backup in prod.

## Storage (MinIO / S3)
- Buckets: `ipas`, `icons`, (optional) `screenshots`.
- Upload flow: server receives IPA, stores to S3, computes `size` + `sha256`.
- Delivery: presigned URLs or public-read with CDN (future). Keep `/source.json` URLs stable.

## Frontend (React)
- Dev server on 5173 (Vite default) or 3000.
- API base: `/api` (dev proxy recommended) or `API_BASE_URL` env.
- Views: Login, Apps List, App Detail (versions), Version Create.

## Deployment (Docker)
- Strategy: multi-service Compose locally; build/push images for environments.
- Example services: `api` (Ktor), `web` (React static), `mongo`, `minio`.
- Ports: `8080:8080` (api), `3000:80` (web), `27017:27017` (mongo), `9000:9000` (minio console).
- Volumes: Mongo data, MinIO data.

## CI/CD (GitHub Actions)
- Workflows:
  - `ci.yml`: build + test (backend/frontend), lint, type-check.
  - `docker.yml`: build and push images on `main`/tags; cache layers.
  - `deploy.yml` (optional): environment deploy (self-hosted or cloud).
- Secrets: `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`, `S3_*` (if needed for smoke tests).

## Local Development
- Use Devbox shell for tooling consistency (optional): `devbox shell`.
- Minimal `.env` (example):
  - `MONGODB_URI=mongodb://localhost:27017/altstore`
  - `S3_ENDPOINT=http://localhost:9000`
  - `S3_ACCESS_KEY_ID=devadmin`
  - `S3_SECRET_ACCESS_KEY=devsecret`
  - `S3_BUCKET_IPAS=ipas`
  - `S3_BUCKET_ICONS=icons`
  - `APP_BASE_URL=http://localhost:8080`
- Run stack: `docker compose up -d` (after adding compose file).

## Security & Ops Notes
- Do not commit IPA assets; store in S3/MinIO.
- Keep secrets in env/Secrets Manager; never in Git.
- Add `/health` and `/ready` endpoints; simple logs initially.

## Next Expansions
- TLS termination (reverse proxy) and CDN for downloads.
- Auth hardening (sessions/JWT, password hashing, rate limits).
- Observability: metrics, tracing, structured logs.
- Backups and lifecycle rules for IPA buckets.

# Development Setup Guide

This guide walks you through setting up the AltStore Source Manager development environment.

## Prerequisites

- Docker and Docker Compose
- Git
- Devbox (optional, for consistent development tools)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/patterueldev/altstore-source-manager.git
cd altstore-source-manager
```

### 2. Install Dependencies

Requires Node.js 20+ and PNPM 10:

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Review and adjust `.env` if needed for your local setup.

### 4. Start Infrastructure Services

```bash
docker-compose up -d
```

This will start:
- **MongoDB** on `localhost:27017` (admin:password)
- **MinIO** API on `localhost:9000` (devadmin:devsecret)
- **MinIO Console** on `localhost:9001`

### 5. Start Development Servers

```bash
pnpm dev
```

This starts both the Express backend and React frontend in watch mode:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Or use the MinIO console: http://localhost:9001

**Credentials for MinIO Console:**
- Username: `devadmin`
- Password: `devsecret`

### 5. Initialize Development Tools (Optional)

If using Devbox:

```bash
devbox shell
devbox run test  # Verify setup
```

## Service Details

### MongoDB
- **Container:** `altstore-mongodb`
- **Port:** 27017
- **Database:** `altstore`
- **Admin User:** `admin:password`
- **Data Path:** `mongodb_data` volume
- **Initialization:** Automatic (see `scripts/init-mongo.js`)

**Collections created:**
- `users` - User accounts
- `apps` - App metadata
- `versions` - App versions and builds
- `sessions` - Session management

### MinIO
- **Container:** `altstore-minio`
- **API Port:** 9000
- **Console Port:** 9001
- **Access Key:** `devadmin`
- **Secret Key:** `devsecret`
- **Data Path:** `minio_data` volume

**Buckets created:**
- `ipas` - IPA file storage
- `icons` - App icon storage

## Common Tasks

### Stop Services

```bash
docker-compose down
```

### Build and Run the Server

The backend server is a Spring Boot application located in `apps/server/`.

**Build:**

```bash
cd apps/server
gradle build
```

Or using Nx:

```bash
nx run server:build
```

**Run:**

```bash
cd apps/server
gradle bootRun
```

Or using Nx:

```bash
nx run server:serve
```

**Test:**

```bash
cd apps/server
gradle test
```

Or using Nx:

```bash
nx run server:test
```

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mongodb
docker-compose logs -f minio
```

### Reset Data (⚠️ Deletes all data)

```bash
docker-compose down -v
docker-compose up -d
```

### Access MongoDB Shell

```bash
docker exec -it altstore-mongodb mongosh -u admin -p password --authenticationDatabase admin
```

### Upload to MinIO (example)

```bash
# Using MinIO client
docker exec altstore-minio-init mc cp /path/to/file.ipa minio/ipas/file.ipa
```

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

### Important Variables

- `MONGODB_URI` - MongoDB connection string
- `S3_ENDPOINT` - MinIO/S3 endpoint URL
- `S3_ACCESS_KEY_ID` - MinIO access key
- `S3_SECRET_ACCESS_KEY` - MinIO secret key
- `APP_BASE_URL` - Backend API base URL (for source.json generation)

## Troubleshooting

### Services won't start

```bash
# Check for port conflicts
lsof -i :27017  # MongoDB
lsof -i :9000   # MinIO API
lsof -i :9001   # MinIO Console
```

### MongoDB connection errors

Ensure MongoDB is healthy:
```bash
docker-compose ps
docker-compose logs mongodb
```

### MinIO bucket creation failed

Check MinIO initialization logs:
```bash
docker-compose logs minio-init
```

## Next Steps

- Set up the backend API (Kotlin/Ktor) in the `api/` directory
- Set up the frontend (React/Vite) in the `web/` directory
- Run integration tests to verify all services work together

## References

- [INFRASTRUCTURE.md](.github/INFRASTRUCTURE.md) - Architecture and stack details
- [copilot-instructions.md](.github/copilot-instructions.md) - Development conventions

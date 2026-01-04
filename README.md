# AltStore Source Manager

A self-hosted service to manage AltStore app sources, versions, and generate valid AltStore source JSON for distribution. Perfect for distributing your own iOS apps via AltStore.

## Features

- 📱 **App Management** — Create and manage multiple apps with versions, descriptions, icons, and screenshots
- 🎨 **Web Dashboard** — Beautiful admin UI for managing your apps and versions
- 📦 **IPA Upload** — Direct upload and hosting of .ipa files with automatic metadata extraction
- 🔄 **Version Control** — Track multiple versions per app with release notes and iOS compatibility
- 🌐 **Multi-Host Support** — Works seamlessly across different domains (localhost, LAN, public)
- 🐳 **Docker Ready** — One-command deployment with Docker Compose
- 🔒 **Authentication** — Secure admin access with JWT tokens
- 📸 **Asset Management** — Upload and manage app icons, screenshots with preview support
- 🎯 **AltStore Compatible** — Generates valid source.json format for AltStore

## Quick Deployment (Production)

**Requirements:** Docker and Docker Compose installed on your server

### 1. Download Example Configuration

```bash
# Create directory for your deployment
mkdir altstore-manager && cd altstore-manager

# Download the example configuration
curl -O https://raw.githubusercontent.com/patterueldev/altstore-source-manager/main/example/docker-compose.yml
curl -O https://raw.githubusercontent.com/patterueldev/altstore-source-manager/main/example/.env.example

# Copy and configure environment
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your settings:

```env
# MongoDB credentials
MONGO_USER=altstore
MONGO_PASSWORD=your-secure-password

# MinIO credentials (for file storage)
MINIO_ACCESS_KEY=altstore
MINIO_SECRET_KEY=your-minio-secret

# Optional: Override public URL (auto-detected by default)
# MINIO_PUBLIC_URL=https://yourdomain.com/public
```

### 3. Start the Stack

```bash
# Pull and start all services
docker compose up -d

# View logs to get admin credentials
docker compose logs server
```

Look for the admin credentials in the logs:

```
========================================
ADMIN CREDENTIALS
========================================
Username: admin
Password: <generated-password>
========================================
```

### 4. Access Your Instance

- **AltStore Source JSON**: `http://your-server/`
- **Admin Dashboard**: `http://your-server/manager`
- **API Docs**: `http://your-server/api-docs`

### Port Configuration

By default, the server runs on port 80. To change it, edit the ports section in `docker-compose.yml`:

```yaml
services:
  server:
    ports:
      - "8080:3000"  # Change 8080 to your desired port
```

## Development Setup

Want to contribute or customize? Here's how to set up a local development environment.

### Prerequisites

- **Node.js 20+** — [Download here](https://nodejs.org/)
- **PNPM 10+** — Install with `npm install -g pnpm@10`
- **Docker** (optional) — For local MongoDB and MinIO

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/patterueldev/altstore-source-manager.git
cd altstore-source-manager

# Install dependencies
pnpm install
```

### 2. Start Infrastructure

**Option A: Using Docker (Recommended)**

```bash
# Start MongoDB and MinIO
docker compose up -d mongodb minio

# Wait for services to be healthy (about 30 seconds)
```

**Option B: Local Services**

Install and run MongoDB and MinIO separately, then configure `.env` with your connection details.

### 3. Configure Environment

Create `.env` in the root:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://admin:password@localhost:27017/altstore?authSource=admin

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=devadmin
MINIO_SECRET_KEY=devsecret
MINIO_PUBLIC_URL=http://localhost:3000/public

# Admin (optional, auto-generated if not set)
# ADMIN_PASSWORD=yourpassword
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend (Express API)
pnpm --filter @altstore/server dev

# Terminal 2: Start frontend (React dashboard)
pnpm --filter @altstore/web dev
```

**Access points during development:**
- Backend API: `http://localhost:3000`
- Frontend Dev Server: `http://localhost:5173`
- Source JSON: `http://localhost:3000/`
- Admin Dashboard (dev): `http://localhost:5173/`

### 5. Build for Production

```bash
# Build both apps
pnpm build

# Build Docker image
docker build -f apps/server/Dockerfile -t altstore-manager .

# Or use buildx for multi-platform
docker buildx build --platform linux/amd64,linux/arm64 \
  -f apps/server/Dockerfile -t altstore-manager .
```

## Project Structure

```
altstore-source-manager/
├── apps/
│   ├── server/          # Express.js backend
│   │   └── src/
│   │       ├── api/     # API controllers
│   │       ├── models/  # MongoDB schemas
│   │       ├── routes/  # Express routes
│   │       └── utils/   # Utilities
│   └── web/             # React frontend
│       └── src/
│           ├── pages/   # Dashboard pages
│           ├── contexts/# React contexts
│           └── lib/     # API client
├── example/             # Production deployment example
├── docs/                # Documentation
└── .github/
    └── workflows/       # CI/CD (auto-builds on push)
```

## Tech Stack

**Backend:**
- Express.js — Web framework
- MongoDB — Database
- MinIO — S3-compatible object storage
- JWT — Authentication

**Frontend:**
- React + TypeScript
- React Router — Navigation
- Axios — API client
- Tailwind CSS — Styling

**Infrastructure:**
- Docker & Docker Compose
- GitHub Actions — CI/CD
- Multi-platform images (AMD64 + ARM64)

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format
4. Push to your fork and submit a Pull Request

## Troubleshooting

### Reset Admin Password

If you've forgotten your admin password or need to reset it:

```bash
# Using Docker Compose
docker compose exec altstore-manager-server pnpm reset-admin

# Or directly with docker exec
docker exec altstore-manager-server pnpm reset-admin
```

The command will generate a new password and display it in the output:

```
========================================
ADMIN PASSWORD RESET
========================================
New Password: <generated-password>
========================================
```

### Icons/Assets Not Loading

If assets aren't loading, check:
1. MinIO is running and healthy: `docker compose ps`
2. Environment variable `MINIO_PUBLIC_URL` is not set (auto-detection should work)
3. Check browser console for CORS errors

### Can't Access Dashboard

- Default path is `/manager`, not root
- Root path (`/`) serves the AltStore source JSON
- Check that you're using the correct admin credentials from logs

### Port Already in Use

Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "8080:3000"  # Change 8080 to any available port
```

## License

MIT

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/patterueldev/altstore-source-manager/issues)
- 💬 [Discussions](https://github.com/patterueldev/altstore-source-manager/discussions)

---

Made with ❤️ for the AltStore community
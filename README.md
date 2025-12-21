# AltStore Source Manager

A service to manage AltStore app sources (apps, versions, builds) and generate a valid AltStore source JSON for distribution.

## Quick Start

### Prerequisites
- Devbox or Codespaces (JDK 21, Gradle)
- Docker (for PostgreSQL and other services)

### Local Development

```bash
# 1. Enter development environment
devbox shell

# 2. Start local services
docker-compose up -d

# 3. Run the backend server
cd apps/server
gradle bootRun

# Server runs at http://localhost:8080
# OpenAPI docs: http://localhost:8080/swagger-ui.html
```

### Running Tests

```bash
cd apps/server
gradle test                    # Run all tests
gradle test --tests "ServiceTest"  # Specific test
```

## Project Structure

```
altstore-source-manager/
├── apps/server/              # Spring Boot REST API
├── packages/                 # Shared code (future)
├── docs/                     # Architecture and planning
│   ├── ARCHITECTURE.md       # System design
│   ├── INFRASTRUCTURE.md     # Deployment and CI/CD
│   ├── MVP.md                # MVP features and scope
│   ├── REQUIREMENTS.md       # Requirements and constraints
│   └── TECH_STACK.md         # Tech choices and rationale
├── scripts/                  # Build/deploy utilities
├── .github/
│   └── copilot-instructions.md  # AI agent guide
├── devbox.json              # Development environment
├── docker-compose.yml       # Local services (PostgreSQL)
└── openapi.yaml             # API specification
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed structure and design principles.

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design, layers, and patterns
- **[MVP.md](docs/MVP.md)** - MVP features and priorities
- **[INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)** - Deployment, environments, CI/CD
- **[REQUIREMENTS.md](docs/REQUIREMENTS.md)** - Problem statement and constraints
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Technology choices with rationale
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI agent guide for development

## Development

### Environment Setup

**Local (Recommended)**:
```bash
devbox shell        # Enter isolated dev environment
docker-compose up -d   # Start PostgreSQL and services
cd apps/server
gradle bootRun
```

**Codespaces**:
- Skip Devbox; use preinstalled JDK 21 and Gradle
- Run `docker-compose up -d` for PostgreSQL
- Then `cd apps/server && gradle bootRun`

### API Endpoints (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/source.json` | Generate AltStore source JSON |
| GET | `/sources` | List all sources |
| POST | `/sources` | Create a new source |
| GET | `/sources/{id}` | Get source by ID |
| PUT | `/sources/{id}` | Update source |
| DELETE | `/sources/{id}` | Delete source |

See [openapi.yaml](openapi.yaml) for full API specification.

### Testing

```bash
cd apps/server

# Run all tests
gradle test

# Run specific test
gradle test --tests "SourceServiceTest"

# Run with coverage
gradle test --coverage
```

## AltStore Source JSON Format

The service generates valid AltStore source JSON:

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

## Conventions

- **Branch naming**: `<type>/#<issue>-description` (e.g., `feat/#12-app-crud`)
- **Commits**: `<type>: #<issue> description` (e.g., `feat: #12 Add app creation endpoint`)
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed conventions and patterns.

## Deployment

See [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) for deployment strategy, CI/CD pipeline, and environment setup.

## Contributing

1. Create an issue for your feature/fix
2. Create a branch: `git checkout -b feat/#<issue>-description`
3. Make your changes
4. Run tests: `gradle test`
5. Commit: `git commit -m "feat: #<issue> description"`
6. Push and create a PR

## Troubleshooting

**Build fails**:
```bash
gradle clean && gradle build
```

**Server won't start**:
- Check port 8080: `lsof -i :8080`
- Check PostgreSQL: `docker-compose logs postgres`

**Tests fail**:
- Ensure PostgreSQL is running: `docker-compose logs postgres`
- Check `.env` file has required variables

See [.github/copilot-instructions.md](.github/copilot-instructions.md#troubleshooting) for more troubleshooting tips.
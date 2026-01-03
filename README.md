# AltStore Source Manager

A service to manage AltStore app sources (apps, versions, builds) and generate a valid AltStore source JSON for distribution.

## Development

See SETUP.md for environment setup.

### Full Stack Development

This is a monorepo with two main applications:
- `apps/server/` — Express.js backend API
- `apps/web/` — React frontend dashboard

Both share dependencies via PNPM workspaces.

**Quick start** (requires Node.js 20+ and PNPM 10):

```bash
pnpm install
pnpm dev          # Start all services in watch mode
pnpm build        # Build all apps
pnpm test         # Run tests
```
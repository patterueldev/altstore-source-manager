# AltStore Source Manager

A service to manage AltStore app sources (apps, versions, builds) and generate a valid AltStore source JSON for distribution.

## Development

See SETUP.md for environment setup.

### Server (Gradle Spring Boot)

The server project lives under `server/` and exposes:
- `GET /health` — simple health check
- `GET /source.json` — returns a sample AltStore Source JSON

Run locally (requires JDK 17 and Gradle):

```
cd server
gradle bootRun
```

Run tests:

```
cd server
gradle test
```

Notes:
- If Gradle is not installed, you can install it via your package manager or add it to Devbox. We'll wire Devbox packages in a follow-up.
- The `/source.json` output is a placeholder per the schema in copilot-instructions; CRUD and persistence will follow.
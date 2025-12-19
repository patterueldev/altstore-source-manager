# AltStore Source Manager — AI Agent Guide

## Purpose & Current State
- Goal: Manage AltStore app sources (apps, versions, builds) and generate a valid AltStore source JSON for distribution.
- Current repo: Greenfield scaffolding only; see [README.md](README.md) and vision in [copilot-instruction.md](copilot-instruction.md).
- Branch: `main` is default; keep changes focused and incremental.

## Architecture Intent (from repo docs)
- Backend API: Manage apps, versions, builds; serve AltStore source JSON and assets (.ipa).
- Web UI: Dashboard, CRUD for apps/versions; preview/export of source JSON.
- Auth: Planned; keep interfaces boundary-friendly to add later.

## Dev Environment
- Devbox is configured; enter shell before running tools: `devbox shell`.
- Packages list is empty; add per stack (Node, Python, Go, etc.) in [devbox.json](devbox.json). Keep scripts minimal and documented in README.

## Workflows & Conventions
- Keep documentation tight: update [README.md](README.md) and this file when decisions land.
- Prefer small PRs: backend scaffold → core CRUD → source JSON generation → UI.
- Store generated source JSON under a clear route (e.g., `/source.json`) and keep server-side schema validation close to the generator.
- Use clear domain naming: `App`, `Version`, `Build`, `Source` for entities/paths.

## Commit & Pull Request Conventions
Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#specification) for all commits and PR titles:

**Format**: `<type>[optional scope]: <description>`

**Types**:
- `feat`: New feature (correlates with MINOR in SemVer)
- `fix`: Bug fix (correlates with PATCH in SemVer)
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

**Breaking Changes**: Append `!` after type/scope (e.g., `feat!: remove legacy API`) or include `BREAKING CHANGE:` footer.

**Examples**:
- `feat(api): add CRUD endpoints for App entity`
- `fix(source): correct version date serialization`
- `docs: update installation steps in README`
- `refactor(ui)!: migrate to new component library`

**PR Titles**: Use the same format; squash commits with conventional title on merge.

**PR Template**: Use [.github/pull_request_template.md](.github/pull_request_template.md) as a guide when creating pull requests. The template includes Conventional Commits format guidance, type checklist, and standard sections for description, testing, and related issues.

## AltStore Source JSON (essentials)
- Top-level: `name`, `identifier`, `apps: []`.
- App: `name`, `bundleIdentifier`, `developerName`, `subtitle`, `iconURL`, `versions: []`.
- Version: `version`, `date`, `localizedDescription`, `downloadURL`, `size`, `minOSVersion`, `sha256`.
- Example skeleton to validate against early:
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

## Immediate, Concrete Tasks (derived from repo docs)
- Initialize backend API with CRUD for `App` and `Version` plus `/source.json` that renders current state.
- Add minimal persistence (file-based or lightweight DB) behind a repository layer to allow later swap.
- Add a tiny Web UI that lists apps and versions; include a live source preview panel.
- Wire a `test` script in Devbox shell and basic validation for the source JSON shape.

## Key References in Repo
- Vision and scope: [copilot-instruction.md](copilot-instruction.md)
- Environment & scripts: [devbox.json](devbox.json)
- Project root notes: [README.md](README.md)

## Guardrails
- Don’t commit real IPA files; use sample placeholders/links.
- Keep interfaces stable; surface changes in README and this guide.
- Prefer explicit schemas (JSON Schema/Type definitions) near the generator to gate regressions.

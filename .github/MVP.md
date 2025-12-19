# MVP User Stories

This MVP defines the first workable slice of AltStore Source Manager. It focuses on secure access, basic app CRUD, and version/IPA management sufficient to produce a valid `/source.json` feed.

## 1) Login
- Story: As a user, I can log in to access the dashboard.
- Acceptance Criteria:
  - See a login form (email/username + password).
  - Invalid credentials show a clear error without leaking details.
  - On success, redirect to dashboard; session persists across reloads.
  - Logout clears session and returns to login.
- Notes:
  - Start with single-user or in-memory users; plan to swap later.
  - Protect all routes except login and `/source.json`.

## 2) View Apps List
- Story: As a user, I can see a list of apps.
- Acceptance Criteria:
  - List shows `name`, `bundleIdentifier`, `latest version`, and `updated`.
  - Empty state prompts to create the first app.
  - Pagination or simple list (MVP may skip pagination if <50).

## 3) Add New App
- Story: As a user, I can create a new app.
- Acceptance Criteria:
  - Form fields: `name`, `bundleIdentifier`, `developerName`, `subtitle` (optional), `iconURL` (optional).
  - Validation: `bundleIdentifier` unique and reverse-DNS format; required fields present.
  - On save, app appears in list and detail view.

## 4) Modify App
- Story: As a user, I can edit app metadata.
- Acceptance Criteria:
  - Edit fields from creation flow; validate and persist changes.
  - Prevent changing `bundleIdentifier` if versions exist (or warn/confirm policy).
  - Changes reflect immediately in `/source.json` output.

## 5) Upload IPA & Create Version
- Story: As a user, I can upload an IPA and create a new version.
- Acceptance Criteria:
  - Form: `version`, `date` (default today), `localizedDescription`, `minOSVersion` (optional), file upload for `.ipa`.
  - On upload, compute `size` and `sha256` server-side; store or reference IPA URL.
  - New version appears under the app with download URL resolvable.
  - `/source.json` includes the new version entry.

## 6) Add Succeeding Versions
- Story: As a user, I can add subsequent versions without re-entering unchanged metadata.
- Acceptance Criteria:
  - New version form pre-fills prior values; only `version`, `date`, `localizedDescription`, and IPA required.
  - Versions are ordered newest-first.

## 7) Delete Version
- Story: As a user, I can delete a specific version.
- Acceptance Criteria:
  - Delete requires confirmation; update `/source.json` accordingly.
  - If latest version is deleted, next latest becomes current.
  - Optionally remove associated IPA asset (configurable policy).

## 8) Delete App
- Story: As a user, I can delete an app and its versions.
- Acceptance Criteria:
  - Delete requires confirmation that versions/assets will be removed.
  - App disappears from list and `/source.json`.

---

## Non-Functional (MVP level)
- Persistence: file-based or lightweight DB; repository layer to allow swapping later.
- Authentication: session/cookie or token; minimal CSRF safeguards if forms.
- Validation: server-side validation for inputs; sanitize file names.
- Assets: do not commit real IPA files; use storage folder or external URL.
- Source Feed: expose `/source.json` unauthenticated; all other routes require login.

## Suggested Views & Endpoints (illustrative)
- Views: Login, Dashboard (apps list), App Detail (metadata + versions), Version Create/Edit.
- Endpoints:
  - Auth: `POST /api/login`, `POST /api/logout`, `GET /api/me`
  - Apps: `GET /api/apps`, `POST /api/apps`, `GET /api/apps/:id`, `PUT /api/apps/:id`, `DELETE /api/apps/:id`
  - Versions: `POST /api/apps/:id/versions`, `DELETE /api/apps/:id/versions/:versionId`
  - Source: `GET /source.json`

## Definition of Done (per story)
- UI implements flows and validations described above.
- API persists data and returns expected shapes.
- `/source.json` reflects current state accurately.
- Basic happy-path tests or a manual test checklist executed.

## Dependencies & Order
1) Login → 2) Apps list → 3) Add app → 4) Modify app → 5) Upload IPA + create version → 6) Add versions → 7) Delete version → 8) Delete app.

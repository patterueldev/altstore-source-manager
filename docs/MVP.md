# MVP SCOPE

> MVP features, user stories, and priorities for AltStore Source Manager.

## Core Features (MVP)

### 1. Source CRUD Operations
- **Create**: Define a new AltStore source with metadata (name, subtitle, icon, description)
- **Read**: Retrieve source details and generate `/source.json` output
- **Update**: Modify source metadata
- **Delete**: Remove a source and associated data

**Priority**: Must-have  
**Acceptance Criteria**:
- API endpoints functional for all CRUD operations
- `/source.json` endpoint generates valid AltStore source JSON
- Data persisted to database

### 2. App Management
- **Add apps** to a source with metadata (name, bundle ID, developer info)
- **Manage versions** (multiple versions per app)
- **Manage builds** (download URLs, iOS version requirements, release notes)

**Priority**: Must-have  
**Acceptance Criteria**:
- App CRUD endpoints working
- Versions and builds linked correctly
- Generated source JSON includes all app/version/build data

### 3. Source JSON Generation
- **GET /source.json**: Generate valid AltStore source JSON
- Conforms to AltStore source schema
- Includes all apps, versions, and builds

**Priority**: Must-have  
**Acceptance Criteria**:
- Valid JSON output
- AltStore client can parse and use the source
- All metadata included

### 4. Basic Authentication
- Simple API key or token-based auth (TBD)
- Protect CRUD endpoints

**Priority**: Should-have  
**Acceptance Criteria**:
- Authentication middleware in place
- Endpoints require valid token
- Clear auth flow documented

## Future Features (Post-MVP)

- Role-based access control (admin, editor, viewer)
- Source visibility/publishing (draft, published)
- Version history and rollback
- Batch import/export
- Web UI for management
- Audit logging
- Rate limiting

## Non-Goals (Explicitly Out of Scope)

- Hosting app binaries (only metadata and download URLs)
- User management/registration system
- Payment processing
- Analytics
- Mobile apps (for MVP)

## Success Criteria

- Source can be created and managed via API
- Valid AltStore source JSON generated
- Data persists across restarts
- API is documented and testable

## Timeline

**Phase 1 (MVP)**: Weeks 1-2
- CRUD endpoints + source JSON generation
- Database schema and migrations
- Basic testing and documentation

**Phase 2 (Polish)**: Weeks 3-4
- Authentication and authorization
- Enhanced testing (integration, smoke)
- Deployment pipeline

**Phase 3+ (Future)**: Post-launch
- UI, advanced features, scaling

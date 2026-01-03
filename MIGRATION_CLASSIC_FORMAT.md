# Classic AltStore Format Migration

## Overview
Successfully migrated the AltStore Source Manager from a marketplace-specific format to the classic AltStore source format. This simplifies the system by removing marketplace-only fields and enforcing required fields for proper AltStore compatibility.

## Key Changes

### Backend Models

#### App Model (`apps/server/src/models/App.ts`)
**Removed Fields:**
- `marketplaceID` - Not used in classic format
- `category` - Not part of classic spec
- `appPermissions` - Marketplace only
- `patreon` - Marketplace only

**Required Fields (non-optional):**
- `iconURL` - Now required (was optional)
- `tintColor` - Now required (was optional)

**Retained Optional Fields:**
- `subtitle` - Kept for rich metadata
- `localizedDescription` - Kept for app descriptions
- `screenshots` - Array of screenshot URLs

#### Version Model (`apps/server/src/models/Version.ts`)
**Required Fields:**
- `buildVersion` - Now required for every version

**Added Field:**
- `screenshots` - Optional array for version-specific screenshots

### Backend Routes

#### Apps Routes (`apps/server/src/routes/apps.ts`)
**Changes:**
- Updated POST route to validate required fields (iconURL, tintColor)
- Updated PUT route to handle only valid fields
- Removed marketplace field processing
- Added new endpoints for file uploads:
  - `POST /apps/:id/icon` - Upload app icon (PNG) to MinIO
  - `POST /apps/:id/screenshots` - Upload app screenshots (PNG) to MinIO

#### Versions Routes (`apps/server/src/routes/versions.ts`)
**Changes:**
- Updated POST route to require `buildVersion` field
- Updated validation to prevent missing buildVersion
- Added new endpoint:
  - `POST /versions/:id/screenshots` - Upload version screenshots (PNG) to MinIO

### Source JSON Endpoint (`apps/server/src/index.ts`)
**Changes:**
1. **Field Filtering:** Only includes classic format fields in response
   - Removed: marketplaceID, category, appPermissions, patreon
   - Included: name, bundleIdentifier, developerName, subtitle, localizedDescription, iconURL, tintColor, screenshots
   
2. **Null/Empty Filtering:** New `filterNull()` function removes:
   - null values
   - undefined values
   - Empty strings ("")
   - Empty arrays ([])

3. **MinIO Bucket:** Added support for 3 buckets:
   - `ipas` - IPA files
   - `icons` - App icons
   - `screenshots` - App and version screenshots

### Frontend Updates

#### Dashboard (`apps/web/src/pages/Dashboard.tsx`)
**CreateAppModal Changes:**
- Removed marketplaceID and category inputs
- Changed iconURL from URL text input to file upload (PNG picker)
- Changed tintColor to color input + hex code input (dual display)
- Changed layout to handle file uploads properly
- Made tintColor required
- Implemented post-creation icon upload workflow

#### App Detail (`apps/web/src/pages/AppDetail.tsx`)
**EditAppModal Changes:**
- Removed marketplaceID and category fields
- Changed iconURL input to file upload with live preview
- Made tintColor required with color picker
- Simplified form to focus on core fields

**UploadVersionModal Changes:**
- Made buildVersion required (added validation)
- Simplified form without marketplace-related fields

## Database Considerations

The existing database contains old records with removed fields (marketplaceID, category, etc.). These won't cause issues because:
1. The source.json endpoint explicitly maps only the fields needed for classic format
2. The models are updated to not process these fields
3. Old data is safely ignored in responses
4. No migrations are required - old data remains in database but is unused

## File Upload Flow

### Icon Upload
1. User creates app with placeholder iconURL
2. App record is created with database ID
3. User uploads PNG icon via POST /apps/:appId/icon
4. Icon is stored in MinIO at `icons/{appId}.png`
5. App.iconURL is updated with MinIO URL

### Screenshots Upload
1. After app/version is created, user can upload screenshots
2. Screenshots sent to POST /apps/:appId/screenshots or POST /versions/:versionId/screenshots
3. Images stored in MinIO at `screenshots/{id}/{index}.png`
4. URLs are appended to the screenshots array

## Classic Format Compliance

The generated source.json now complies with the classic AltStore format:

```json
{
  "name": "Source Name",
  "identifier": "com.example.source",
  "apps": [
    {
      "name": "App Name",
      "bundleIdentifier": "com.example.app",
      "developerName": "Developer",
      "iconURL": "https://...",
      "tintColor": "#F54F32",
      "subtitle": "Optional",
      "localizedDescription": "Optional",
      "screenshots": ["https://...", "https://..."],
      "versions": [
        {
          "version": "1.0.0",
          "buildVersion": "1",
          "date": "2026-01-01",
          "downloadURL": "https://...",
          "size": 12345678,
          "minOSVersion": "15.0",
          "sha256": "..."
        }
      ]
    }
  ]
}
```

## Testing Checklist

- [x] Backend models updated with classic fields
- [x] Models compile without errors
- [x] source.json endpoint filters marketplace fields
- [x] source.json endpoint filters null/empty values
- [x] Icon upload endpoints created
- [x] Screenshot upload endpoints created
- [x] Frontend forms updated for file uploads
- [x] Build version validation working
- [x] MinIO buckets initialized (ipas, icons, screenshots)
- [ ] End-to-end app creation with icon upload
- [ ] End-to-end version upload with build version validation
- [ ] Screenshot upload and reordering
- [ ] source.json validation against classic format spec

## Next Steps

1. Add screenshot reordering UI (drag-drop or arrow buttons)
2. Add screenshot editing/deletion per app and version
3. Test full user flows for app creation and version uploads
4. Add proper validation for image file types and sizes
5. Consider adding database migration script to clean up old fields
6. Add more comprehensive error handling for file uploads

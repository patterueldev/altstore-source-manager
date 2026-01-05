# CI/CD API Keys Integration Guide

This document explains how to set up and use AltStore Source Manager's API key system for automated IPA uploads via CI/CD pipelines.

## Overview

Instead of using admin credentials, the system provides **Access Keys**—API key pairs that enable secure, auditable access to the CI/CD upload endpoint without exposing user passwords.

### Key Concepts

- **Access Key (Public)**: A unique identifier in the format `ak_<random-hex>`. This is safe to commit in CI/CD configs.
- **Secret (Private)**: A 64-character hex string. **Keep this confidential—treat it like a password.** It's only shown once during creation.
- **Key Pair**: Used together in the `X-Access-Key` header as `key:secret`.
- **Admin-Only**: Only administrators can create and revoke access keys.
- **Audit Trail**: Each key tracks creation time and last-used timestamp for security visibility.

## Creating Access Keys

### Via Web UI

1. Log in to AltStore Source Manager as an admin user.
2. Navigate to **Manage Access** (in the main menu).
3. Click **Create New Access Key**.
4. Give the key a descriptive name (e.g., "GitHub Actions", "Jenkins CI").
5. **Copy and save both the key and secret immediately.** The secret is only shown once.
6. Store them securely in your CI/CD platform's secret management system (e.g., GitHub Secrets, GitLab CI/CD variables).

### Via REST API (Advanced)

```bash
curl -X POST https://your-domain/api/access-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "GitHub Actions"}'
```

**Response:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "key": "ak_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "secret": "0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
  "name": "GitHub Actions",
  "createdAt": "2025-01-05T10:30:00Z"
}
```

## Uploading IPAs via CI/CD

### Authentication Header Format

All requests to the CI/CD upload endpoint must include:

```
X-Access-Key: ak_xxx:secret_xxx
```

### Upload Endpoint

**Endpoint:** `POST /api/versions/ci-upload`

**Required Headers:**
```
X-Access-Key: <key>:<secret>
```

**Required Fields (form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `ipa` | File | The compiled `.ipa` file |
| `appId` | String | MongoDB ObjectId of the target app |
| `version` | String | Semantic version (e.g., "1.0.0") |
| `buildVersion` | String | Build number (e.g., "1") |
| `date` | ISO 8601 | Release date (e.g., "2025-01-05") |
| `minOSVersion` | String | Minimum iOS version (e.g., "14.0") |
| `localizedDescription` | String | Release notes / changelog |
| `maxOSVersion` | String | (Optional) Maximum iOS version |
| `visible` | Boolean | (Optional) Whether to publish to source JSON (default: `true`) |

### Example: curl

```bash
curl -X POST https://your-domain/api/versions/ci-upload \
  -H "X-Access-Key: ak_abc123:secret456" \
  -F "ipa=@MyApp.ipa" \
  -F "appId=65a0b1c2d3e4f5g6h7i8j9k0" \
  -F "version=1.0.0" \
  -F "buildVersion=1" \
  -F "date=2025-01-05" \
  -F "minOSVersion=14.0" \
  -F "localizedDescription=Initial release"
```

**Success Response (201):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "appId": "65a0b1c2d3e4f5g6h7i8j9k0",
  "version": "1.0.0",
  "buildVersion": "1",
  "date": "2025-01-05T00:00:00Z",
  "localizedDescription": "Initial release",
  "downloadURL": "https://your-domain/storage/MyApp-1.0.0-1234567890.ipa",
  "size": 45682304,
  "minOSVersion": "14.0",
  "sha256": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
  "visible": true,
  "createdAt": "2025-01-05T10:30:00Z",
  "updatedAt": "2025-01-05T10:30:00Z"
}
```

### Example: GitHub Actions

```yaml
name: Publish IPA

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract version
        id: version
        run: echo "tag=${{ github.ref_name }}" >> $GITHUB_OUTPUT

      - name: Download built IPA
        run: |
          # Download your built IPA from artifacts or build system
          wget ${{ secrets.IPA_URL }} -O MyApp.ipa

      - name: Upload to AltStore Source Manager
        run: |
          curl -X POST ${{ secrets.ALTSTORE_API_URL }}/api/versions/ci-upload \
            -H "X-Access-Key: ${{ secrets.ALTSTORE_ACCESS_KEY }}" \
            -F "ipa=@MyApp.ipa" \
            -F "appId=${{ secrets.ALTSTORE_APP_ID }}" \
            -F "version=${{ steps.version.outputs.tag }}" \
            -F "buildVersion=${{ github.run_number }}" \
            -F "date=$(date -u +'%Y-%m-%d')" \
            -F "minOSVersion=14.0" \
            -F "localizedDescription=Release ${{ steps.version.outputs.tag }}"
```

**GitHub Secrets to configure:**
- `ALTSTORE_API_URL`: Base URL (e.g., `https://your-domain`)
- `ALTSTORE_ACCESS_KEY`: Full key pair as `key:secret`
- `ALTSTORE_APP_ID`: MongoDB ObjectId of the app in your AltStore instance

### Example: GitLab CI

```yaml
publish_ipa:
  stage: deploy
  script:
    - |
      curl -X POST "${CI_API_V4_URL}" \
        -H "X-Access-Key: ${ALTSTORE_ACCESS_KEY}" \
        -F "ipa=@build/MyApp.ipa" \
        -F "appId=${ALTSTORE_APP_ID}" \
        -F "version=${CI_COMMIT_TAG}" \
        -F "buildVersion=${CI_PIPELINE_ID}" \
        -F "date=$(date -u +'%Y-%m-%d')" \
        -F "minOSVersion=14.0" \
        -F "localizedDescription=Release ${CI_COMMIT_TAG}"
  only:
    - tags
```

**CI/CD Variables to set:**
- `ALTSTORE_API_URL`
- `ALTSTORE_ACCESS_KEY` (protected, masked)
- `ALTSTORE_APP_ID`

## Managing Access Keys

### Listing Keys (Admin Only)

```bash
curl -X GET https://your-domain/api/access-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "key": "ak_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "name": "GitHub Actions",
    "createdAt": "2025-01-05T10:30:00Z",
    "lastUsedAt": "2025-01-05T11:45:00Z",
    "active": true
  }
]
```

### Revoking Keys (Admin Only)

```bash
curl -X DELETE https://your-domain/api/access-keys/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

A revoked key can no longer be used for uploads and will return `401 Unauthorized`.

## Security Best Practices

1. **Never commit secrets.** Use CI/CD platform's secret management:
   - GitHub: [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
   - GitLab: [Protected CI/CD variables](https://docs.gitlab.com/ee/ci/variables/)
   - Jenkins: [Credentials Plugin](https://plugins.jenkins.io/credentials/)

2. **Rotate keys regularly.** Create a new key, update CI/CD configs, then revoke the old key.

3. **Monitor usage.** Check "Manage Access" page for `lastUsedAt` timestamps. Unused keys are candidates for revocation.

4. **Scope to minimal permissions.** All access keys have full upload access. If more granular control is needed, request role-based access control in a future version.

5. **Separate keys per pipeline.** Use different keys for GitHub Actions, Jenkins, etc., so compromising one doesn't affect all pipelines.

## Troubleshooting

### 401 Unauthorized

**Causes:**
- Missing or malformed `X-Access-Key` header
- Key revoked or inactive
- Secret doesn't match stored hash

**Solution:**
- Verify header format: `X-Access-Key: key:secret` (colon-separated)
- Check "Manage Access" page to confirm key is active
- Regenerate the key if the secret was lost

### 400 Bad Request

**Causes:**
- Missing required fields in form data
- Invalid app ID
- Malformed date format

**Solution:**
- Verify all required fields are present
- Confirm app ID exists via `/api/apps`
- Use ISO 8601 date format: `YYYY-MM-DD`

### 500 Server Error

**Causes:**
- Corrupted IPA file
- File upload size exceeds 500MB
- Database connection issues

**Solution:**
- Verify the IPA is not corrupted (`file MyApp.ipa` should show `Zip archive`)
- Check file size is under 500MB
- Check server logs for database errors

## Related

- [README.md](../README.md) — Project overview
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) — System design details
- [API Documentation](../openapi.yaml) — OpenAPI spec for all endpoints

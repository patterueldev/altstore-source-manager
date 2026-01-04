import { Request } from 'express';

// Derives the public base URL for MinIO-served assets.
// Priority: MINIO_PUBLIC_URL env (fully-qualified) > current host + /public.
export function getPublicBase(req?: Request): string {
  const envBase = process.env.MINIO_PUBLIC_URL?.trim();
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }

  if (req) {
    const host = req.get('host');
    const protocol = req.protocol;
    if (host) {
      return `${protocol}://${host}/public`.replace(/\/$/, '');
    }
  }

  throw new Error('MINIO_PUBLIC_URL is not configured and could not be derived from the request');
}

// Converts a stored relative path (e.g., "/icons/file.png") to a full public URL
// Also handles legacy full URLs (returns as-is if already a full URL)
export function buildPublicUrl(path: string, req?: Request): string {
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const base = getPublicBase(req);
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Helper to build relative path for storage (bucket/key -> /bucket/key)
export function buildStoragePath(bucket: string, key: string): string {
  return `/${bucket}/${key}`;
}

// Legacy: builds full URL from bucket/key (deprecated - use buildStoragePath + buildPublicUrl)
export function buildObjectUrl(bucket: string, key: string, req?: Request, cacheBust = false): string {
  const base = getPublicBase(req);
  const url = `${base}/${bucket}/${key}`;
  return cacheBust ? `${url}?v=${Date.now()}` : url;
}

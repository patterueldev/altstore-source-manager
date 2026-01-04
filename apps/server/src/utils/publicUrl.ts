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

export function buildObjectUrl(bucket: string, key: string, req?: Request, cacheBust = false): string {
  const base = getPublicBase(req);
  const url = `${base}/${bucket}/${key}`;
  return cacheBust ? `${url}?v=${Date.now()}` : url;
}

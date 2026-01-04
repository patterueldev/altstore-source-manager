import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Request } from 'express';
import { buildPublicUrl, getPublicBase, buildStoragePath } from './publicUrl.js';

const originalEnv = { ...process.env };

const makeReq = (host = 'localhost:3000', protocol: 'http' | 'https' = 'http'): Request => {
  return {
    get: (header: string) => (header.toLowerCase() === 'host' ? host : undefined),
    protocol,
  } as unknown as Request;
};

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('getPublicBase', () => {
  it('uses MINIO_PUBLIC_URL when provided and trims trailing slash', () => {
    process.env.MINIO_PUBLIC_URL = 'https://cdn.example.com/public/';
    expect(getPublicBase()).toBe('https://cdn.example.com/public');
  });

  it('falls back to request host + /public when env is unset', () => {
    delete process.env.MINIO_PUBLIC_URL;
    const req = makeReq('my-host.test:8080', 'https');
    expect(getPublicBase(req)).toBe('https://my-host.test:8080/public');
  });

  it('throws when env and request are missing', () => {
    delete process.env.MINIO_PUBLIC_URL;
    expect(() => getPublicBase(undefined as unknown as Request)).toThrow();
  });
});

describe('buildPublicUrl', () => {
  it('builds full URL from relative path using env base', () => {
    process.env.MINIO_PUBLIC_URL = 'https://cdn.example.com/public';
    const url = buildPublicUrl('/icons/app.png');
    expect(url).toBe('https://cdn.example.com/public/icons/app.png');
  });

  it('rewrites existing absolute URLs to current host base', () => {
    delete process.env.MINIO_PUBLIC_URL;
    const req = makeReq('demo.test');
    const url = buildPublicUrl('http://old.host/public/icons/app.png', req);
    expect(url).toBe('http://demo.test/public/icons/app.png');
  });

  it('ensures a leading slash when none is provided', () => {
    process.env.MINIO_PUBLIC_URL = 'https://cdn.example.com/public';
    const url = buildPublicUrl('icons/app.png');
    expect(url).toBe('https://cdn.example.com/public/icons/app.png');
  });
});

describe('buildStoragePath', () => {
  it('returns bucket/key path with leading slash', () => {
    expect(buildStoragePath('bucket', 'file.png')).toBe('/bucket/file.png');
  });
});

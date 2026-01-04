#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function loadVersion(filePath) {
  const contents = await readFile(filePath, 'utf8');
  return JSON.parse(contents).version;
}

async function main() {
  const rootDir = process.cwd();
  const packages = [
    path.join(rootDir, 'package.json'),
    path.join(rootDir, 'apps', 'server', 'package.json'),
    path.join(rootDir, 'apps', 'web', 'package.json'),
  ];

  const versions = await Promise.all(packages.map(loadVersion));
  const [rootVersion, ...childVersions] = versions;

  const mismatched = childVersions.filter((v) => v !== rootVersion);
  if (mismatched.length > 0) {
    console.error('Version mismatch detected across package.json files:');
    packages.forEach((pkgPath, idx) => {
      console.error(`- ${pkgPath}: ${versions[idx]}`);
    });
    process.exit(1);
  }

  console.log(`All package versions aligned at ${rootVersion}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
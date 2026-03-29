#!/usr/bin/env node
/**
 * Syncs SemVer across package.json, src-tauri/tauri.conf.json, and src-tauri/Cargo.toml.
 * Used by semantic-release (prepare step). Usage: node scripts/sync-version.mjs <version>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const version = process.argv[2]?.trim();
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error('Usage: node scripts/sync-version.mjs <semver>');
  process.exit(1);
}

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const tauriPath = path.join(root, 'src-tauri', 'tauri.conf.json');
const tauri = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
tauri.version = version;
fs.writeFileSync(tauriPath, `${JSON.stringify(tauri, null, 2)}\n`);

const cargoPath = path.join(root, 'src-tauri', 'Cargo.toml');
let cargo = fs.readFileSync(cargoPath, 'utf8');
if (!/^version\s*=\s*"[^"]*"/m.test(cargo)) {
  console.error('Could not find [package] version line in Cargo.toml');
  process.exit(1);
}
const updated = cargo.replace(/^version\s*=\s*"[^"]*"/m, `version = "${version}"`);
fs.writeFileSync(cargoPath, updated);

console.log(`Synced version to ${version}`);

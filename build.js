import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('--- Building ORCA Frontend ---');
const env = { ...process.env, NODE_ENV: 'development' };
execSync('npm install --include=dev', { cwd: 'frontend', stdio: 'inherit', env });
execSync('npx vite build && node copy-assets.js', { cwd: 'frontend', stdio: 'inherit', env });

console.log('--- Syncing build artifacts to root dist/ ---');
const src = path.resolve('frontend/dist');
const dest = path.resolve('dist');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.cpSync(src, dest, { recursive: true });
console.log('✓ Build complete and ready for deployment in dist/');

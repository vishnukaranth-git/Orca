import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('--- Building ORCA Frontend ---');
execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
execSync('npm run build', { cwd: 'frontend', stdio: 'inherit' });

console.log('--- Syncing build artifacts to root dist/ ---');
const src = path.resolve('frontend/dist');
const dest = path.resolve('dist');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.cpSync(src, dest, { recursive: true });
console.log('✓ Build complete and ready for deployment in dist/ and frontend/dist/');

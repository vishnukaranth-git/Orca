import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy js directory to dist/js
const jsSrc = path.join(__dirname, 'js');
const jsDest = path.join(distDir, 'js');
if (fs.existsSync(jsSrc)) {
  fs.cpSync(jsSrc, jsDest, { recursive: true });
  console.log('✓ Copied js/ to dist/js/');
}

// Copy media files
const mediaFiles = ['scuba_bg.mp4', 'satellite_ocean_bg.mp4', 'ocean_satellite_bg.jpg'];
for (const file of mediaFiles) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to dist/${file}`);
  }
}

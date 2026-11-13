import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, 'public');
const distDir = path.resolve(__dirname, 'dist');
const backendPublicDir = path.resolve(__dirname, '..', 'backend', 'public');

console.log('[sync_dist] Synchronizing static assets across frontend dist and backend public...');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      try {
        fs.mkdirSync(dest, { recursive: true });
      } catch (err) {
        console.warn(`[sync_dist] Warning: Could not create directory ${dest}: ${err.message}`);
        return;
      }
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    try {
      if (!fs.existsSync(dest) || fs.statSync(dest).size !== stat.size) {
        fs.copyFileSync(src, dest);
      }
    } catch (err) {
      console.warn(`[sync_dist] Skip file: ${src} (${err.message})`);
    }
  }
}

try {
  // 1. Sync to frontend dist
  copyRecursive(publicDir, distDir);
  console.log('[sync_dist] Synchronized to frontend dist successfully.');

  // 2. Sync full public directory to backend public
  if (fs.existsSync(backendPublicDir)) {
    copyRecursive(publicDir, backendPublicDir);
    console.log('[sync_dist] Synchronized full public directory to backend public successfully.');
  }

  console.log('[sync_dist] Complete!');
} catch (err) {
  console.error('[sync_dist] Sync error:', err);
}

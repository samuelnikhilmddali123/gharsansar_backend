import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, 'public');
const distDir = path.resolve(__dirname, 'dist');

console.log('[sync_dist] Synchronizing public assets to dist...');

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
      // Avoid overwriting newer bundled assets
      if (!fs.existsSync(dest) || fs.statSync(dest).size !== stat.size) {
        fs.copyFileSync(src, dest);
      }
    } catch (err) {
      // Gracefully log long path or permission issues without halting the entire sync
      console.warn(`[sync_dist] Skip file: ${src} (${err.message})`);
    }
  }
}

try {
  copyRecursive(publicDir, distDir);
  console.log('[sync_dist] Successfully synchronized all static assets to dist!');
} catch (err) {
  console.error('[sync_dist] Fatal copy error:', err);
}

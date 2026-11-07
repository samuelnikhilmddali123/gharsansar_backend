const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    try {
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        if (!fs.existsSync(destPath) || fs.statSync(destPath).mtimeMs < stat.mtimeMs) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    } catch (e) {
      // Ignore long path Windows limitations gracefully
    }
  }
}

const pubDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(pubDir) && fs.existsSync(distDir)) {
  copyDir(pubDir, distDir);
  console.log('✅ Public assets synchronized to dist.');
}

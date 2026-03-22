/**
 * Expo sirve archivos estáticos desde `public/` (por defecto).
 * Copia `web/multiverse`, `web/index.html` y assets PWA a `public/` para que
 * el iframe `/multiverse/index.html` exista siempre en desarrollo.
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const webDir = path.join(root, 'web');
const publicDir = path.join(root, 'public');

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

fs.mkdirSync(publicDir, { recursive: true });

const multiverseSrc = path.join(webDir, 'multiverse');
const multiverseDest = path.join(publicDir, 'multiverse');

if (!fs.existsSync(multiverseSrc)) {
  console.error('❌ No existe web/multiverse. Copiá ahí el template Multiverse (HTML5 UP).');
  process.exit(1);
}

fs.rmSync(multiverseDest, { recursive: true, force: true });
fs.cpSync(multiverseSrc, multiverseDest, { recursive: true });

const idx = path.join(webDir, 'index.html');
if (fs.existsSync(idx)) {
  fs.copyFileSync(idx, path.join(publicDir, 'index.html'));
}

for (const name of fs.readdirSync(webDir)) {
  if (/^icon-\d+x\d+\.png$/i.test(name)) {
    copyIfExists(path.join(webDir, name), path.join(publicDir, name));
  }
}

['manifest.json', 'sw.js', 'landing.html'].forEach((f) => {
  copyIfExists(path.join(webDir, f), path.join(publicDir, f));
});

console.log('✅ Sincronizado web/ → public/ (Multiverse + index + PWA).');

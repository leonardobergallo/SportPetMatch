/**
 * Tras `expo export`: renombra el SPA a app.html, copia la landing Multiverse a index.html
 * y sincroniza web/multiverse → dist/multiverse.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const webDir = path.join(__dirname, '../web');
const distDir = path.join(__dirname, '../dist');
const multiverseSrc = path.join(webDir, 'multiverse');
const multiverseIndex = path.join(multiverseSrc, 'index.html');

const filesToCopy = [
  'manifest.json',
  'sw.js',
  'landing.html',
  'admin.html',
  'suscripcion.html',
  'politica-de-privacidad.html',
  'seguridad-infantil.html',
  'privacidad.html',
  'terminos.html',
  'eliminar-cuenta.html',
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) {
      copyDirRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

console.log('📦 Post-build: PWA + landing Multiverse → dist/...');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: El directorio dist/ no existe. Ejecuta npm run build primero.');
  process.exit(1);
}

const spaIndex = path.join(distDir, 'index.html');
const spaApp = path.join(distDir, 'app.html');

if (fs.existsSync(spaIndex)) {
  try {
    if (fs.existsSync(spaApp)) {
      fs.unlinkSync(spaApp);
    }
    fs.renameSync(spaIndex, spaApp);
    console.log('✅ SPA Expo renombrado a dist/app.html');
  } catch (e) {
    console.error('❌ No se pudo renombrar index.html → app.html:', e.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️  No hay dist/index.html (¿export vacío?). Se omite renombre a app.html');
}

if (fs.existsSync(multiverseIndex)) {
  fs.copyFileSync(multiverseIndex, path.join(distDir, 'index.html'));
  console.log('✅ Landing Multiverse copiada a dist/index.html');
} else {
  console.warn('⚠️  Falta web/multiverse/index.html — no se escribió dist/index.html');
}

const multiverseDest = path.join(distDir, 'multiverse');
if (fs.existsSync(multiverseSrc)) {
  copyDirRecursive(multiverseSrc, multiverseDest);
  console.log('✅ Copiado web/multiverse → dist/multiverse');
} else {
  console.warn('⚠️  No existe web/multiverse');
}

let copied = 0;
let skipped = 0;

filesToCopy.forEach((file) => {
  const sourcePath = path.join(webDir, file);
  const destPath = path.join(distDir, file);

  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copiado: ${file}`);
      copied++;
    } catch (error) {
      console.error(`❌ Error copiando ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠️  No encontrado: ${file} (se omite)`);
    skipped++;
  }
});

// Las descargas directas se guardan comprimidas en el repo para no versionar
// binarios de más de 100 MB. Se descomprimen al construir el sitio.
// - arm64: ~40 MB, para la mayoría de los celulares Android actuales.
// - universal: ~109 MB, respaldo para equipos de 32 bits o emuladores.
const apks = [
  { gz: 'indio-1.0.1-arm64.apk.gz', apk: 'indio-1.0.1-arm64.apk' },
  { gz: 'indio-1.0.1.apk.gz', apk: 'indio-1.0.1.apk' },
];

for (const { gz, apk } of apks) {
  const origen = path.join(webDir, gz);
  if (fs.existsSync(origen)) {
    fs.writeFileSync(path.join(distDir, apk), zlib.gunzipSync(fs.readFileSync(origen)));
    console.log(`✅ APK de descarga directa generado en dist/${apk}`);
  } else {
    console.warn(`⚠️  Falta web/${gz}: no se publicó ${apk}`);
  }
}

console.log('');
console.log(`✅ PWA: ${copied} archivos, ${skipped} omitidos`);

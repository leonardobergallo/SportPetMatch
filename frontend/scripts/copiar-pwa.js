/**
 * Script para copiar archivos PWA al directorio dist después del build
 * Copia manifest.json, sw.js, landing e iconos desde web/ a dist/
 */

const fs = require('node:fs');
const path = require('node:path');

const sourceDir = path.join(__dirname, '../web');
const distDir = path.join(__dirname, '../dist');

// Archivos a copiar
const filesToCopy = [
  'manifest.json',
  'sw.js',
  'landing.html',
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png'
];

console.log('📦 Copiando archivos PWA a dist/...');

// Verificar que dist existe
if (!fs.existsSync(distDir)) {
  console.error('❌ Error: El directorio dist/ no existe. Ejecuta npm run build primero.');
  process.exit(1);
}

// Copiar cada archivo
let copied = 0;
let skipped = 0;

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
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

console.log('');
console.log(`✅ Proceso completado: ${copied} archivos copiados, ${skipped} omitidos`);

// No fallar si algunos archivos no existen (solo advertir)
if (copied === 0) {
  console.warn('⚠️  No se copió ningún archivo. Verifica que los archivos estén en web/');
  // No hacer exit(1) para no romper el build si faltan algunos archivos opcionales
}



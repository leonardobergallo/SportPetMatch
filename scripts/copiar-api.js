/**
 * Script para copiar el handler de API al directorio api/ en la raíz
 * Esto permite que Vercel sirva el backend como función serverless
 */

const fs = require('fs');
const path = require('path');

const sourceApi = path.join(__dirname, '../backend/api/index.js');
const destApi = path.join(__dirname, '../api/index.js');
const sourceDist = path.join(__dirname, '../backend/dist');
const destDist = path.join(__dirname, '../api/dist');

console.log('📦 Copiando archivos del backend para Vercel...');

// Crear directorio api si no existe
if (!fs.existsSync(path.join(__dirname, '../api'))) {
  fs.mkdirSync(path.join(__dirname, '../api'), { recursive: true });
  console.log('✅ Directorio api/ creado');
}

// Copiar api/index.js
if (fs.existsSync(sourceApi)) {
  try {
    // Leer el contenido y ajustar la ruta de require
    let content = fs.readFileSync(sourceApi, 'utf8');
    // Desde api/index.js (raíz), el build del backend vive en ../backend/dist/
    content = content.replace(/require\(['"]\.\.\/dist\//g, "require('../backend/dist/");
    fs.writeFileSync(destApi, content, 'utf8');
    console.log('✅ Copiado: api/index.js (con rutas ajustadas)');
  } catch (error) {
    console.error('❌ Error copiando api/index.js:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Error: No se encontró backend/api/index.js');
  process.exit(1);
}

// No copiar backend/dist dentro de api/, porque Vercel contaría esos .js como funciones extra.
// Limpiar api/dist legado si existe de builds anteriores.
if (fs.existsSync(destDist)) {
  try {
    fs.rmSync(destDist, { recursive: true, force: true });
    console.log('✅ Eliminado: api/dist legado');
  } catch (error) {
    console.warn('⚠️  No se pudo limpiar api/dist legado:', error.message);
  }
}

if (!fs.existsSync(sourceDist)) {
  console.warn('⚠️  Advertencia: backend/dist no existe. Asegúrate de que el build del backend se haya completado.');
}

// Copiar frontend/dist a public/ (para que Vercel sirva el frontend)
const sourceFrontendDist = path.join(__dirname, '../frontend/dist');
const destPublic = path.join(__dirname, '../public');

if (!fs.existsSync(destPublic)) {
  fs.mkdirSync(destPublic, { recursive: true });
}

if (fs.existsSync(sourceFrontendDist)) {
  try {
    const files = fs.readdirSync(sourceFrontendDist);
    files.forEach(file => {
      const srcPath = path.join(sourceFrontendDist, file);
      const destPath = path.join(destPublic, file);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        function copyDir(src, dest) {
          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('✅ Copiado: frontend/dist → public/');
  } catch (error) {
    console.error('❌ Error copiando frontend/dist:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Error: frontend/dist no existe. Ejecuta npm run build:frontend primero.');
  process.exit(1);
}

console.log('');
console.log('🎉 Proceso completado exitosamente!');
console.log('📁 Estructura lista para Vercel:');
console.log('   - api/index.js (función serverless del backend)');
console.log('   - backend/dist/ (build del backend incluido en la función)');
console.log('   - public/ (archivos del frontend)');


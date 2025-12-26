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
    fs.copyFileSync(sourceApi, destApi);
    console.log('✅ Copiado: api/index.js');
  } catch (error) {
    console.error('❌ Error copiando api/index.js:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Error: No se encontró backend/api/index.js');
  process.exit(1);
}

// Copiar dist del backend a api/dist (para que la función serverless pueda acceder)
if (fs.existsSync(sourceDist)) {
  try {
    // Copiar todo el contenido de dist
    if (!fs.existsSync(destDist)) {
      fs.mkdirSync(destDist, { recursive: true });
    }
    
    // Copiar archivos recursivamente
    function copyRecursiveSync(src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      
      if (isDirectory) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
          copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursiveSync(sourceDist, destDist);
    console.log('✅ Copiado: backend/dist → api/dist');
  } catch (error) {
    console.error('❌ Error copiando dist:', error.message);
    // No salir con error, puede que no sea crítico
  }
} else {
  console.warn('⚠️  Advertencia: backend/dist no existe. Asegúrate de que el build del backend se haya completado.');
}

// Copiar frontend/dist a la raíz (para que Vercel sirva el frontend)
const sourceFrontendDist = path.join(__dirname, '../frontend/dist');
const destRoot = path.join(__dirname, '..');

if (fs.existsSync(sourceFrontendDist)) {
  try {
    // Copiar archivos del frontend a la raíz
    const files = fs.readdirSync(sourceFrontendDist);
    files.forEach(file => {
      const srcPath = path.join(sourceFrontendDist, file);
      const destPath = path.join(destRoot, file);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        // Copiar recursivamente
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
    console.log('✅ Copiado: frontend/dist → raíz del proyecto');
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
console.log('   - api/dist/ (build del backend)');
console.log('   - index.html y archivos del frontend en la raíz');


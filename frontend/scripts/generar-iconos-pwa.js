/**
 * Script para generar iconos PWA desde el icono principal
 * Genera todos los tamaños necesarios para el manifest.json
 */

const fs = require('fs');
const path = require('path');

// Tamaños requeridos para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Rutas
const inputIcon = path.join(__dirname, '../assets/icono.png');
const outputDir = path.join(__dirname, '../web');

// Verificar que el icono existe
if (!fs.existsSync(inputIcon)) {
  console.error('❌ Error: No se encontró el icono en:', inputIcon);
  console.log('💡 Asegúrate de que existe frontend/assets/icono.png');
  process.exit(1);
}

// Crear directorio web si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Directorio web/ creado');
}

// Intentar usar sharp si está disponible
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp no está instalado. Instalando...');
  console.log('💡 Ejecuta: npm install --save-dev sharp');
  console.log('');
  console.log('📋 Alternativa: Usa una herramienta online:');
  console.log('   1. Ve a https://realfavicongenerator.net/');
  console.log('   2. Sube frontend/assets/icono.png');
  console.log('   3. Descarga los iconos y colócalos en frontend/web/');
  process.exit(1);
}

console.log('🎨 Generando iconos PWA desde:', inputIcon);
console.log('📁 Guardando en:', outputDir);
console.log('');

// Generar cada tamaño
Promise.all(
  sizes.map(size => {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    return sharp(inputIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputFile)
      .then(() => {
        console.log(`✅ Generado: icon-${size}x${size}.png`);
        return outputFile;
      })
      .catch(err => {
        console.error(`❌ Error generando ${size}x${size}:`, err.message);
        throw err;
      });
  })
)
  .then(files => {
    console.log('');
    console.log('🎉 ¡Iconos generados exitosamente!');
    console.log(`📊 Total: ${files.length} iconos creados`);
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('   1. Verifica que los iconos estén en frontend/web/');
    console.log('   2. Ejecuta: npm run build');
    console.log('   3. Verifica en DevTools → Application → Manifest');
  })
  .catch(err => {
    console.error('❌ Error al generar iconos:', err);
    process.exit(1);
  });



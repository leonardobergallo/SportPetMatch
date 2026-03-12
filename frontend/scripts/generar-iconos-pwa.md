# 🎨 Script para Generar Iconos PWA

Este documento explica cómo generar los iconos PWA necesarios desde el icono existente.

## Opción 1: Usar Herramienta Online (Recomendado)

1. Ve a [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) o [RealFaviconGenerator](https://realfavicongenerator.net/)

2. Sube tu icono: `frontend/assets/icono.png`

3. Descarga los iconos generados

4. Colócalos en `frontend/web/` con estos nombres exactos:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

## Opción 2: Usar ImageMagick (Línea de Comandos)

Si tienes ImageMagick instalado:

```bash
cd frontend/web

# Generar todos los tamaños desde el icono original
convert ../assets/icono.png -resize 72x72 icon-72x72.png
convert ../assets/icono.png -resize 96x96 icon-96x96.png
convert ../assets/icono.png -resize 128x128 icon-128x128.png
convert ../assets/icono.png -resize 144x144 icon-144x144.png
convert ../assets/icono.png -resize 152x152 icon-152x152.png
convert ../assets/icono.png -resize 192x192 icon-192x192.png
convert ../assets/icono.png -resize 384x384 icon-384x384.png
convert ../assets/icono.png -resize 512x512 icon-512x512.png
```

## Opción 3: Usar Sharp (Node.js)

Si prefieres usar Node.js:

```bash
npm install --save-dev sharp
```

Luego crea un script `frontend/scripts/generar-iconos.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const input = path.join(__dirname, '../assets/icono.png');
const outputDir = path.join(__dirname, '../web');

// Asegurar que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach(size => {
  sharp(input)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✅ Generado icon-${size}x${size}.png`))
    .catch(err => console.error(`❌ Error generando ${size}x${size}:`, err));
});
```

Ejecuta:
```bash
node frontend/scripts/generar-iconos.js
```

## Verificación

Después de generar los iconos, verifica que:

1. Todos los archivos estén en `frontend/web/`
2. Los nombres sean exactamente como se muestra arriba
3. Los iconos sean cuadrados (mismo ancho y alto)
4. El formato sea PNG

## Próximo Paso

Una vez generados los iconos, ejecuta:

```bash
cd frontend
npm run build
```

Y verifica en DevTools → Application → Manifest que todos los iconos se carguen correctamente.



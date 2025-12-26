# 📱 Guía: PWA (Progressive Web App) - SportPetMatch

Esta guía explica cómo funciona la implementación PWA en SportPetMatch y cómo generar los iconos necesarios.

---

## ✅ Implementación Completada

La app ya está configurada como PWA instalable. Los siguientes archivos han sido creados:

### Archivos Creados:

1. **`frontend/web/manifest.json`** - Manifest de la PWA
2. **`frontend/web/sw.js`** - Service Worker para funcionalidades offline
3. **`frontend/src/utilidades/pwa.ts`** - Utilidades para PWA
4. **`frontend/src/componentes/InstallPrompt.tsx`** - Componente opcional para mostrar banner de instalación

### Archivos Modificados:

1. **`frontend/web/index.html`** - Agregados meta tags PWA
2. **`frontend/app.json`** - Configuración PWA en sección web
3. **`frontend/index.js`** - Registro automático del Service Worker
4. **`frontend/vercel.json`** - Headers para servir archivos PWA correctamente
5. **`frontend/App.tsx`** - Preparado para usar InstallPrompt (opcional)

---

## 🎨 Generar Iconos PWA

Para que la PWA funcione completamente, necesitas generar iconos en diferentes tamaños. Tienes dos opciones:

### Opción A: Usar el Icono Existente

Si ya tienes `frontend/assets/icono.png`, puedes generar los iconos automáticamente:

1. **Usa un generador online:**
   - Ve a [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - O usa [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Sube tu `icono.png` (debe ser cuadrado, mínimo 512x512px)
   - Descarga los iconos generados

2. **Coloca los iconos en `frontend/web/` con estos nombres:**
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

   **Nota:** Los archivos en `frontend/web/` se copian automáticamente a la raíz del build cuando ejecutas `npm run build`. Las rutas en `manifest.json` apuntan a `/icon-*.png` (raíz), que es correcto.

### Opción B: Crear Manualmente

Si prefieres crear los iconos manualmente, necesitas generar imágenes en estos tamaños:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 píxeles

**Recomendación:** Usa el icono existente `frontend/assets/icono.png` como base.

---

## 🚀 Probar la PWA

### 1. Build y Preview Local

```bash
cd frontend
npm run build
npm run web
```

O si usas Expo:

```bash
cd frontend
npx expo export --platform web
npx serve dist
```

### 2. Verificar en DevTools

1. Abre la app en el navegador (debe ser HTTPS o localhost)
2. Abre DevTools (F12)
3. Ve a **Application** → **Manifest**
   - Debe mostrar "Manifest válido"
   - Verifica que todos los iconos estén cargados
4. Ve a **Application** → **Service Workers**
   - Debe mostrar el Service Worker como "activated"

### 3. Probar Instalación

#### En iPhone (Safari):
1. Abre la app en Safari
2. Toca el botón **Compartir** 📤
3. Selecciona **"Agregar a pantalla de inicio"**
4. Toca **"Agregar"**
5. Abre desde el icono en la pantalla de inicio

#### En Android (Chrome):
1. Abre la app en Chrome
2. Aparecerá un banner "Agregar a pantalla de inicio"
3. Toca **"Agregar"**
4. O ve a Menú → **"Agregar a pantalla de inicio"**

#### En Desktop (Chrome/Edge):
1. Aparecerá un icono de instalación en la barra de direcciones
2. Haz clic en el icono
3. Confirma la instalación

---

## 🎯 Activar Banner de Instalación (Opcional)

Si quieres mostrar un banner que invite a instalar la app, descomenta las líneas en `frontend/App.tsx`:

```typescript
// En App.tsx, descomenta estas líneas:

import InstallPrompt from './src/componentes/InstallPrompt';

// Y en el return:
<InstallPrompt />
```

El banner aparecerá automáticamente cuando:
- La app no esté instalada
- El navegador soporte instalación de PWA
- El usuario no haya descartado el prompt recientemente

---

## 📋 Checklist de Verificación

- [ ] Iconos generados y colocados en `frontend/web/`
- [ ] Manifest válido en DevTools
- [ ] Service Worker activado
- [ ] Prueba de instalación exitosa en iOS
- [ ] Prueba de instalación exitosa en Android
- [ ] Prueba de instalación exitosa en Desktop
- [ ] Funcionalidad offline básica funciona

---

## 🐛 Solución de Problemas

### "Manifest no válido"
- Verifica que todos los iconos existan en `frontend/web/`
- Verifica que `manifest.json` tenga sintaxis correcta
- Verifica que las rutas de los iconos sean correctas

### "Service Worker no se registra"
- Verifica que `sw.js` esté en `frontend/web/`
- Verifica que la ruta sea `/sw.js` (no `/public/sw.js`)
- Verifica la consola del navegador para errores

### "No aparece opción de instalar"
- Debe ser HTTPS (Vercel lo tiene automáticamente)
- En iOS, debe ser Safari (no Chrome)
- Verifica que el manifest esté correcto
- Verifica que todos los requisitos PWA estén cumplidos

### "Pantalla en blanco al abrir instalada"
- Limpia el cache del Service Worker en DevTools
- Verifica que el Service Worker no esté bloqueando recursos
- Reinstala la app

### "Los iconos no aparecen"
- Verifica que los archivos estén en `frontend/web/`
- Verifica que las rutas en `manifest.json` sean correctas
- Verifica que los iconos tengan el formato PNG correcto

---

## 📚 Recursos Adicionales

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)

---

## ✅ Estado Actual

✅ Manifest configurado  
✅ Service Worker implementado  
✅ Meta tags PWA agregados  
✅ Configuración Expo para web  
✅ Headers Vercel configurados  
⏳ Iconos PWA (necesitas generarlos)  
⏳ Banner de instalación (opcional, comentado)

---

## 🎉 Próximos Pasos

1. **Genera los iconos** usando tu `icono.png` existente
2. **Prueba la instalación** en diferentes dispositivos
3. **Activa el banner de instalación** si lo deseas (descomenta en App.tsx)
4. **Despliega en Vercel** para probar en producción

¡Tu app ahora es una PWA instalable! 🚀


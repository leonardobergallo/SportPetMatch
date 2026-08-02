# INDIO — Pasos para publicar en Google Play Store

**Fecha:** 5 Julio 2026

---

## PASO 1: Build del APK/AAB con EAS

```bash
cd frontend

# Primero, configurar la URL de producción para el build:
# Editar .env y poner:
# EXPO_PUBLIC_API_URL=https://indio.com.ar/api

# Build preview (APK para probar)
eas build --platform android --profile preview

# Build producción (AAB para Play Store)
eas build --platform android --profile production
```

El build tarda ~15-20 minutos. EAS te da un link para descargar el APK/AAB.

---

## PASO 2: Cuenta de Google Play Console

1. Ir a https://play.google.com/console
2. Crear cuenta de desarrollador
3. Pago único: **USD 25**
4. Completar perfil:
   - Nombre del desarrollador: **IT360** o **Leonardo Bergallo**
   - Email de contacto
   - Teléfono
   - Website: `https://indio.com.ar`

---

## PASO 3: Crear la app en Play Console

1. Botón **"Crear app"**
2. Nombre: **Indio**
3. Idioma: Español (Argentina)
4. ¿Es una app o un juego?: App
5. ¿Es gratuita o paga?: Gratuita

---

## PASO 4: Completar la ficha de Play Store

### Datos obligatorios:

**Descripción corta (80 chars):**
```
Eventos, matching y chat para personas y mascotas.
```

**Descripción larga:**
```
Indio es la app gratuita para conectar personas con mascotas en Santa Fe, 
Paraná y alrededores. Descubrí eventos pet-friendly, encontrá matches 
compatibles y coordiná salidas directamente desde la app.

🎯 Funcionalidades:
- Eventos: encontrá y unite a encuentros pet-friendly
- Matching: conectá con personas y mascotas compatibles
- Chat: coordiná salidas y encuentros
- Mapa: usuarios y eventos cerca tuyo
- Perfil de mascota: mostrá cómo es tu compañero

🐾 Gratis durante la beta. La misma cuenta funciona en web y celular.
```

**Categoría:** Social  
**Etiquetas:** mascotas, eventos, matches, perros  
**Email de contacto:** leonardobergallo@gmail.com  
**Website:** https://indio.com.ar

---

### Capturas de pantalla (obligatorio)
Se necesitan mínimo 2 screenshots por dispositivo:
- **Teléfono:** 1080x1920px (mínimo 2, máximo 8)
- **Tablet 7":** opcional
- **Tablet 10":** opcional

*Las sacás desde el APK preview en un emulador o teléfono.*

---

### Ícono (obligatorio)
- **512x512px** PNG con transparencia
- Ya tenés `icono.png` en `assets/`

### Feature Graphic (opcional pero recomendado)
- **1024x500px** imagen de portada en Play Store

---

## PASO 5: Subir el AAB

1. En Play Console → **Testing** → **Prueba cerrada** o **Producción**
2. Subir el archivo `.aab` generado por EAS
3. Completar clasificación de contenido (cuestionario)
4. Configurar precios y distribución ($0, Argentina + otros países)
5. Aceptar políticas de Google

---

## PASO 6: Revisión y publicación

Google revisa la app (1-7 días). Si es la primera, suele tardar más.

### Para acelerar:
- **Prueba cerrada:** subir el APK a "Prueba cerrada", invitar testers por email. No requiere revisión larga de Google.
- **Producción:** publicar directamente para todos.

---

## PASO 7: Mantener credenciales para submisiones futuras

Ya tenés en `eas.json` la sección `submit`. Completar con datos reales:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-key.json",
      "track": "internal"
    }
  }
}
```

La `google-play-key.json` la descargás desde Google Play Console → Configuración → Cuentas de servicio.

---

## COMANDOS RÁPIDOS

```bash
# Build APK para test (15 min)
eas build --platform android --profile preview

# Build AAB para Play Store (15 min)
eas build --platform android --profile production

# Subir a Play Store
eas submit --platform android --profile production
```

---

## ⚠️ ANTES DE SUBIR

| Tarea | Estado |
|-------|--------|
| Seed en DB de producción | ⚠️ Pendiente |
| VPS con `indio.com.ar` actualizado | ⚠️ Pendiente |
| `EXPO_PUBLIC_API_URL=https://indio.com.ar/api` | ⚠️ Configurar antes del build |
| SMTP para emails (recuperación) | ⚠️ Pendiente |
| Google Maps API Key real | ⚠️ Pendiente (para mapa nativo) |

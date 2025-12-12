# 📱 Generar App Móvil Nativa (Android e iOS)

Esta guía te ayudará a crear la app móvil instalable (APK para Android y IPA para iOS).

## 🚀 Opción 1: Build para Android (APK) - Más Fácil

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
eas login
```
(Necesitas crear una cuenta en [expo.dev](https://expo.dev) si no tienes)

### 3. Configurar el proyecto

```bash
cd frontend
eas build:configure
```

Esto configurará automáticamente `eas.json` y `app.json`.

### 4. Configurar app.json

Verifica que en `app.json` tengas:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "tu-project-id-aqui"
      }
    }
  }
}
```

Si no tienes un `projectId`, ejecuta:
```bash
eas init
```

### 5. Generar build para Android (APK)

**Para probar localmente (APK):**
```bash
cd frontend
eas build --platform android --profile preview
```

Este comando:
- Te pedirá crear una cuenta en Expo si no tienes (es gratis)
- Construirá el APK en la nube de Expo
- Te dará un enlace para descargar el APK cuando termine (15-20 minutos)

**Para producción (AAB - Google Play Store):**
```bash
eas build --platform android --profile production
```

### 6. Descargar el APK

Una vez terminado el build:
1. Ve al enlace que te dio EAS
2. O ve a [expo.dev](https://expo.dev) → Tu proyecto → Builds
3. Descarga el APK
4. Instálalo en tu celular Android

### 7. Instalar en tu celular

**Android:**
1. Descarga el APK en tu celular
2. Permite "Fuentes desconocidas" en configuración
3. Instala el APK
4. ¡Listo! 🎉

---

## 📱 Opción 2: Build para iOS

**Nota:** Para iOS necesitas:
- Una cuenta de desarrollador de Apple ($99/año)
- Una Mac (para subir a App Store)

### 1. Configurar para iOS

```bash
cd frontend
eas build --platform ios --profile preview
```

O para producción (App Store):
```bash
eas build --platform ios --profile production
```

---

## ⚙️ Configurar la URL del Backend en la App Móvil

Cuando generes el build, necesitas configurar la URL del backend.

### Opción A: Variable de entorno en el build

Antes de hacer el build, configura:

```bash
cd frontend
eas build:configure
```

Luego, cuando hagas el build, agrega variables de entorno:

```bash
eas build --platform android --profile preview \
  --env EXPO_PUBLIC_API_URL=https://tu-backend.onrender.com/api
```

### Opción B: Configurar en el código (temporal)

Ya está configurado en `frontend/src/utilidades/config.ts` para usar:
- Variable de entorno `EXPO_PUBLIC_API_URL` si existe
- O la IP local si estás en desarrollo

**Para producción móvil**, necesitas que `EXPO_PUBLIC_API_URL` esté configurada en el build.

---

## 📝 Pasos Rápidos (Resumen)

### Para Android (APK rápido):

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login en Expo
eas login

# 3. Ir al frontend
cd frontend

# 4. Configurar proyecto
eas init

# 5. Generar build APK
eas build --platform android --profile preview --env EXPO_PUBLIC_API_URL=https://tu-backend.onrender.com/api

# 6. Esperar 15-20 minutos
# 7. Descargar APK del enlace
# 8. Instalar en tu celular Android
```

---

## 🔧 Configuración Avanzada

### Actualizar app.json con projectId

Si no tienes `projectId` en `app.json`:

1. Ejecuta `eas init`
2. Esto agregará automáticamente el `projectId` a `app.json`

### Build local (más rápido pero requiere más configuración)

```bash
eas build --platform android --profile preview --local
```

Esto construye en tu máquina (más rápido pero requiere Android SDK).

---

## 📦 Opciones de Build

### Perfiles en eas.json:

- **development**: Para desarrollo con Expo Go
- **preview**: Para APK/IPA de prueba (no requiere cuentas de desarrollador)
- **production**: Para subir a Google Play / App Store (requiere cuentas)

### Tipos de Build Android:

- **APK**: Para instalar directamente en Android (preview)
- **AAB**: Para subir a Google Play Store (production)

---

## 🎯 Flujo Completo

1. ✅ **Frontend desplegado en Vercel** (ya lo tienes)
2. ✅ **Backend desplegado en Render/Vercel** (según lo que elijas)
3. 📱 **App móvil generada con EAS Build**
4. 🔗 **App móvil conectada al backend** (configurando `EXPO_PUBLIC_API_URL`)

---

## ⚠️ Notas Importantes

### URL del Backend:
- La app móvil necesita la URL pública del backend
- Usa `https://tu-backend.onrender.com/api` (no `localhost`)
- Configúrala con `--env EXPO_PUBLIC_API_URL=...` en el build

### Permisos:
- La app ya tiene configurados los permisos de cámara, ubicación, etc.
- Estos se incluyen automáticamente en el build

### Iconos:
- Verifica que `icono.png` y `icono-adaptativo.png` existan
- Estos se usan en la app móvil

---

## 💰 Costos

- **EAS Build**: Gratis para builds públicos
- **Cuenta Expo**: Gratis para desarrollo
- **Google Play**: $25 una vez (para publicar)
- **App Store**: $99/año (para publicar)

---

## 🆘 Problemas Comunes

### "No project ID found"
Ejecuta: `eas init` en el directorio `frontend`

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en [expo.dev](https://expo.dev)

### App no se conecta al backend
- Verifica que `EXPO_PUBLIC_API_URL` esté configurada
- Usa la URL completa: `https://tu-backend.onrender.com/api`
- No uses `localhost` en producción

---

## ✅ Checklist

- [ ] EAS CLI instalado
- [ ] Cuenta Expo creada
- [ ] `eas init` ejecutado
- [ ] `projectId` configurado en `app.json`
- [ ] Backend desplegado y funcionando
- [ ] URL del backend configurada
- [ ] Build generado
- [ ] APK descargado
- [ ] App instalada en celular
- [ ] App funcionando correctamente 🎉






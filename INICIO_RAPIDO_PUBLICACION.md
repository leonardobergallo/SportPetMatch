# 🚀 Inicio Rápido - Publicación de SportPetMatch

Guía rápida para publicar tu app en producción.

## 📋 Checklist Pre-Publicación

- [ ] Backend configurado y probado localmente
- [ ] Base de datos de producción configurada (Neon, Supabase, etc.)
- [ ] Variables de entorno preparadas
- [ ] Iconos y splash screen listos
- [ ] Cuentas creadas:
  - [ ] Vercel (gratis)
  - [ ] Expo (gratis)
  - [ ] Google Play Console ($25 USD)
  - [ ] Apple Developer ($99 USD/año)

---

## 🎯 Pasos Rápidos

### 1️⃣ Publicar Backend (5 minutos)

```powershell
# Opción A: Usar script
.\scripts\publicar-backend-vercel.ps1

# Opción B: Manual
cd backend
npm install -g vercel
vercel login
vercel --prod
```

**Importante:** Después de publicar, copia la URL del backend (ej: `https://sportpetmatch-backend.vercel.app`)

### 2️⃣ Configurar Frontend con URL del Backend

Edita `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
```

### 3️⃣ Inicializar EAS (Solo primera vez)

```powershell
.\scripts\inicializar-eas.ps1
```

Esto creará un `projectId` en `app.json`. **Guárdalo**.

### 4️⃣ Crear Build de Android (APK ejecutable)

```powershell
.\scripts\build-app-android.ps1
# Selecciona opción 1 (Preview/APK)
```

Espera 10-20 minutos. Recibirás un email con el enlace de descarga.

### 5️⃣ Crear Build de iOS (IPA ejecutable)

```powershell
.\scripts\build-app-ios.ps1
# Selecciona opción 1 (Preview/IPA)
```

Espera 10-20 minutos. Recibirás un email con el enlace de descarga.

---

## 📱 Instalar APK en Android

1. Descarga el archivo `.apk` desde el enlace de EAS
2. Transfiere a tu dispositivo Android
3. Habilita "Instalar desde fuentes desconocidas" en configuración
4. Abre el archivo `.apk` e instala

---

## 🍎 Instalar IPA en iOS

1. Descarga el archivo `.ipa` desde el enlace de EAS
2. Usa [AltStore](https://altstore.io) o [Sideloadly](https://sideloadly.io)
3. Sigue las instrucciones de la herramienta

---

## 🏪 Publicar en Tiendas

### Google Play Store

1. Crea cuenta en [play.google.com/console](https://play.google.com/console) ($25)
2. Crea la app en Google Play Console
3. Completa la información (descripción, capturas, etc.)
4. Crea build de producción:
   ```powershell
   .\scripts\build-app-android.ps1
   # Selecciona opción 2 (Production/AAB)
   ```
5. Sube el AAB:
   ```powershell
   .\scripts\submit-google-play.ps1
   ```

### Apple App Store

1. Crea cuenta en [developer.apple.com](https://developer.apple.com) ($99/año)
2. Crea la app en [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
3. Completa la información (descripción, capturas, etc.)
4. Crea build de producción:
   ```powershell
   .\scripts\build-app-ios.ps1
   # Selecciona opción 2 (Production/IPA)
   ```
5. Sube el IPA:
   ```powershell
   .\scripts\submit-app-store.ps1
   ```

---

## 🔄 Actualizar Versión

```powershell
# Actualizar a versión 1.0.1
.\scripts\actualizar-version.ps1 -NuevaVersion "1.0.1"

# O con build number específico
.\scripts\actualizar-version.ps1 -NuevaVersion "1.0.1" -BuildNumber 2
```

Luego crea un nuevo build y súbelo a las tiendas.

---

## 📚 Documentación Completa

Para más detalles, consulta: [GUIA_PUBLICACION_COMPLETA.md](./GUIA_PUBLICACION_COMPLETA.md)

---

## ❓ Problemas Comunes

### Backend no funciona en Vercel
- Verifica variables de entorno en Vercel Dashboard
- Revisa los logs en Vercel

### Build de EAS falla
- Verifica que `app.json` tenga `projectId`
- Asegúrate de estar logueado: `eas login`

### App no se conecta al backend
- Verifica `EXPO_PUBLIC_API_URL` en `frontend/.env`
- Asegúrate de que la URL termine en `/api`

---

¡Listo! 🎉 Tu app está en producción.


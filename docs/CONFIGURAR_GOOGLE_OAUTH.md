# 🔐 Configurar Google OAuth para Registro/Login

Esta guía te ayudará a configurar la autenticación con Google OAuth para que los usuarios puedan registrarse e iniciar sesión con su cuenta de Google.

## 📋 Requisitos Previos

- Cuenta de Google (Gmail)
- Acceso a [Google Cloud Console](https://console.cloud.google.com/)

---

## 🚀 Pasos para Configurar

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Si ya tienes un proyecto (como "My Project 70039"), puedes usarlo o crear uno nuevo
3. Para crear uno nuevo: Clic en el selector de proyecto (arriba a la izquierda) → "Nuevo proyecto"
4. Ingresa un nombre (ej: "SportPetMatch")
5. Clic en "Crear"

### 2. Habilitar Google+ API

1. En el menú lateral (☰), ve a **APIs y servicios** → **Biblioteca**
2. Busca "Google Identity" o "Google+ API"
3. Selecciona "Google Identity Services API" o "Google+ API"
4. Clic en **"Habilitar"** (Enable)

### 3. Crear Credenciales OAuth 2.0

1. En el menú lateral (☰), ve a **APIs y servicios** → **Credenciales**
2. Si es la primera vez, verás un mensaje para configurar la pantalla de consentimiento. Clic en **"Configurar pantalla de consentimiento"**
3. Si ya tienes credenciales, ve directamente al paso 4
4. Configura la pantalla de consentimiento:
   - Tipo de usuario: **External**
   - Nombre de la app: **SportPetMatch**
   - Email de soporte: tu email
   - Dominios autorizados: (opcional)
   - Clic en **Save and Continue**
   - Agrega tu email como test user
   - Clic en **Save and Continue**

5. Crear OAuth Client ID para Web:
   - En la página de Credenciales, clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
   - Tipo de aplicación: **Aplicación web**
   - Nombre: **SportPetMatch Web**
   - Orígenes de JavaScript autorizados (Authorized JavaScript origins):
     - `http://localhost:19006` (para desarrollo)
     - `exp://localhost:8081` (para Expo Go)
     - `https://tu-dominio.vercel.app` (para producción, si aplica)
   - URI de redirección autorizados (Authorized redirect URIs):
     - `http://localhost:19006` (para desarrollo)
     - `exp://localhost:8081` (para Expo Go)
     - `https://tu-dominio.vercel.app` (para producción, si aplica)
   - Clic en **Crear**
   - **¡IMPORTANTE!** Copia el **ID de cliente** (Client ID) - lo necesitarás para las variables de entorno

6. Crear OAuth Client ID para iOS:
   - En la página de Credenciales, clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
   - Tipo de aplicación: **iOS**
   - Nombre: **SportPetMatch iOS**
   - ID del paquete: `com.sportpetmatch.app`
   - Clic en **Crear**
   - **Copia el ID de cliente** (Client ID)

7. Crear OAuth Client ID para Android:
   - En la página de Credenciales, clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
   - Tipo de aplicación: **Android**
   - Nombre: **SportPetMatch Android**
   - Nombre del paquete: `com.sportpetmatch.app`
   - SHA-1 del certificado: (necesitarás obtenerlo - ver paso 4)
   - Clic en **Crear**
   - **Copia el ID de cliente** (Client ID)

### 4. Obtener SHA-1 para Android (Opcional - Solo si vas a publicar en Android)

**En Windows:**
```powershell
cd frontend
cd android
.\gradlew signingReport
```

Busca en la salida:
```
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

**En Mac/Linux:**
```bash
cd frontend/android
./gradlew signingReport
```

### 5. Configurar Variables de Entorno

Edita `frontend/.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu-android-client-id.apps.googleusercontent.com
```

### 6. Actualizar app.json

El `app.json` ya está configurado, pero verifica que tenga:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.sportpetmatch.app"
    },
    "android": {
      "package": "com.sportpetmatch.app"
    }
  }
}
```

---

## ✅ Verificar Configuración

1. Reinicia el servidor de Expo:
```bash
cd frontend
npm start -- --clear
```

2. Prueba el botón "Registrarse con Google" en la pantalla de registro

3. Deberías ver la pantalla de Google para seleccionar tu cuenta

---

## 🐛 Solución de Problemas

### Error: "Google OAuth no está configurado"

**Causa:** Las variables de entorno no están configuradas.

**Solución:**
- Verifica que `frontend/.env` tenga las variables `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`
- Reinicia el servidor de Expo

### Error: "redirect_uri_mismatch"

**Causa:** La URI de redirección no coincide con la configurada en Google Cloud Console.

**Solución:**
- Verifica que las URIs en Google Cloud Console incluyan:
  - `http://localhost:19006` (desarrollo)
  - `exp://localhost:8081` (Expo Go)
  - Tu dominio de producción

### Error en Android: "SHA-1 no coincide"

**Causa:** El SHA-1 del certificado no coincide con el configurado.

**Solución:**
- Obtén el SHA-1 correcto con `gradlew signingReport`
- Actualiza el SHA-1 en Google Cloud Console

### No aparece el botón de Google

**Causa:** El `request` de OAuth no se inicializó correctamente.

**Solución:**
- Verifica que las variables de entorno estén configuradas
- Revisa la consola para ver errores
- Asegúrate de que `expo-auth-session` esté instalado

---

## 📚 Recursos Adicionales

- [Documentación de Expo Auth Session](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## ✅ Checklist

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google+ API habilitada
- [ ] OAuth Client ID creado para Web
- [ ] OAuth Client ID creado para iOS
- [ ] OAuth Client ID creado para Android
- [ ] SHA-1 obtenido y configurado para Android
- [ ] Variables de entorno configuradas en `frontend/.env`
- [ ] Servidor de Expo reiniciado
- [ ] Botón de Google funciona correctamente

---

¡Listo! 🎉 Los usuarios ahora pueden registrarse e iniciar sesión con Google.


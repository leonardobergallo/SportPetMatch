# 🚀 Guía Completa de Publicación - SportPetMatch

Esta guía te llevará paso a paso para publicar tu aplicación en:
- ✅ **Backend en Vercel** (o Railway/Render)
- ✅ **App Android** (APK/AAB ejecutable)
- ✅ **App iOS** (IPA ejecutable)
- ✅ **Google Play Store**
- ✅ **Apple App Store**

---

## 📋 Índice

1. [Preparación Inicial](#1-preparación-inicial)
2. [Publicar Backend en Vercel](#2-publicar-backend-en-vercel)
3. [Configurar EAS Build](#3-configurar-eas-build)
4. [Crear Ejecutables (APK/IPA)](#4-crear-ejecutables-apkipa)
5. [Publicar en Google Play Store](#5-publicar-en-google-play-store)
6. [Publicar en Apple App Store](#6-publicar-en-apple-app-store)
7. [Actualizaciones Futuras](#7-actualizaciones-futuras)

---

## 1. Preparación Inicial

### 1.1 Verificar Requisitos

- ✅ Node.js 18+ instalado
- ✅ Cuenta de GitHub (para Vercel)
- ✅ Cuenta de Expo (gratuita)
- ✅ Cuenta de Google Play Console ($25 USD única vez)
- ✅ Cuenta de Apple Developer ($99 USD/año)

### 1.2 Instalar Herramientas Necesarias

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Verificar instalación
eas --version

# Iniciar sesión en Expo
eas login
```

### 1.3 Configurar Variables de Entorno

**Backend (`backend/config.env`):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=tu_database_url_produccion
JWT_SECRET=tu_secret_muy_seguro_produccion
# ... resto de variables
```

**Frontend (`frontend/.env`):**
```env
EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
```

---

## 2. Publicar Backend en Vercel

### 2.1 Preparar el Backend

1. **Asegúrate de que el build funcione:**
```bash
cd backend
npm install
npm run build
```

2. **Verifica que `backend/vercel.json` esté configurado:**
```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

### 2.2 Desplegar en Vercel

**Opción A: Desde la Web (Recomendado)**

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Agregar Variables de Entorno:**
   - Ve a Settings → Environment Variables
   - Agrega todas las variables de `backend/config.env`:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `RESEND_API_KEY`
     - `MERCADOPAGO_ACCESS_TOKEN`
     - etc.

6. Click en "Deploy"
7. Espera a que termine el deploy
8. **Copia la URL de tu backend** (ej: `https://sportpetmatch-backend.vercel.app`)

**Opción B: Desde la Terminal**

```bash
cd backend
npm install -g vercel
vercel login
vercel
# Sigue las instrucciones interactivas
```

### 2.3 Verificar el Backend

```bash
# Probar el endpoint de salud
curl https://tu-backend.vercel.app/api/salud

# Debe responder:
# {"mensaje":"¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",...}
```

### 2.4 Actualizar Frontend con la URL del Backend

Edita `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
```

---

## 3. Configurar EAS Build

### 3.1 Inicializar EAS en el Proyecto

```bash
cd frontend
eas init
```

Esto creará un `projectId` en `app.json`. **Guarda este ID**, lo necesitarás.

### 3.2 Configurar `eas.json`

El archivo `eas.json` ya está configurado, pero verifica que tenga:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### 3.3 Actualizar `app.json`

Asegúrate de que `app.json` tenga:

```json
{
  "expo": {
    "name": "SportPetMatch",
    "slug": "sportpetmatch",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.sportpetmatch.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.sportpetmatch.app",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "tu-project-id-aqui"
      }
    }
  }
}
```

---

## 4. Crear Ejecutables (APK/IPA)

### 4.1 Build para Android (APK - Ejecutable)

**Para probar localmente (APK):**
```bash
cd frontend
eas build --platform android --profile preview
```

Esto generará un APK que puedes instalar directamente en dispositivos Android.

**Para producción (AAB - Google Play):**
```bash
eas build --platform android --profile production
```

### 4.2 Build para iOS (IPA - Ejecutable)

**Para probar localmente:**
```bash
cd frontend
eas build --platform ios --profile preview
```

**Para producción (App Store):**
```bash
eas build --platform ios --profile production
```

### 4.3 Descargar los Ejecutables

1. EAS te dará un enlace para seguir el progreso del build
2. Cuando termine, recibirás un enlace para descargar:
   - **Android**: Archivo `.apk` o `.aab`
   - **iOS**: Archivo `.ipa`

### 4.4 Instalar APK en Android

```bash
# Conecta tu dispositivo Android por USB
# Habilita "Depuración USB" en opciones de desarrollador
adb install path/to/tu-app.apk
```

O simplemente transfiere el archivo `.apk` a tu dispositivo y ábrelo.

---

## 5. Publicar en Google Play Store

### 5.1 Crear Cuenta de Google Play Console

1. Ve a [play.google.com/console](https://play.google.com/console)
2. Paga la cuota única de $25 USD
3. Crea una cuenta de desarrollador

### 5.2 Crear la Aplicación

1. Click en "Crear aplicación"
2. Completa:
   - **Nombre de la app**: SportPetMatch
   - **Idioma predeterminado**: Español
   - **Tipo de app**: App
   - **Gratis o de pago**: Gratis
   - **Declaración de políticas**: Acepta

### 5.3 Configurar Store Listing

Completa:
- **Descripción corta** (80 caracteres)
- **Descripción completa** (4000 caracteres)
- **Icono de la app** (512x512 px)
- **Capturas de pantalla** (mínimo 2, máximo 8)
- **Categoría**: Deportes / Estilo de vida
- **Contacto**: Email de soporte

### 5.4 Configurar Contenido

1. **Clasificación de contenido**: Completa el cuestionario
2. **Privacidad**: Crea política de privacidad (usa [privacypolicygenerator.info](https://www.privacypolicygenerator.info/))
3. **Datos de la app**: Declara qué datos recopilas

### 5.5 Subir el AAB

1. Ve a "Producción" → "Crear nueva versión"
2. Sube el archivo `.aab` que generaste con EAS
3. Completa las notas de la versión
4. Guarda y revisa

### 5.6 Enviar para Revisión

1. Revisa todos los requisitos
2. Click en "Enviar para revisión"
3. Google revisará tu app (puede tardar 1-7 días)

### 5.7 Usar EAS Submit (Automático)

```bash
cd frontend
eas submit --platform android
```

Esto subirá automáticamente el último build a Google Play.

---

## 6. Publicar en Apple App Store

### 6.1 Crear Cuenta de Apple Developer

1. Ve a [developer.apple.com](https://developer.apple.com)
2. Únete al Apple Developer Program ($99 USD/año)
3. Verifica tu identidad (puede tardar 1-2 días)

### 6.2 Configurar Certificados y Perfiles

EAS puede hacer esto automáticamente, pero necesitas:

1. **Apple ID** con cuenta de desarrollador
2. **App Store Connect** configurado

### 6.3 Crear App en App Store Connect

1. Ve a [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click en "Mis Apps" → "+"
3. Completa:
   - **Nombre**: SportPetMatch
   - **Idioma principal**: Español
   - **Bundle ID**: `com.sportpetmatch.app`
   - **SKU**: `sportpetmatch-001`

### 6.4 Configurar Información de la App

1. **Información de la app**:
   - Descripción
   - Palabras clave
   - URL de soporte
   - URL de marketing

2. **Precio y disponibilidad**: Gratis

3. **Privacidad**: Completa el cuestionario de privacidad

### 6.5 Subir el IPA

**Opción A: Con EAS Submit (Recomendado)**

```bash
cd frontend
eas submit --platform ios
```

**Opción B: Manualmente con Transporter**

1. Descarga [Transporter](https://apps.apple.com/us/app/transporter/id1450874784)
2. Abre Transporter
3. Arrastra el archivo `.ipa`
4. Click en "Entregar"

### 6.6 Configurar Versión en App Store Connect

1. Ve a tu app en App Store Connect
2. Click en "+ Versión o plataforma"
3. Completa:
   - **Versión**: 1.0.0
   - **Notas de la versión**
   - **Capturas de pantalla** (requeridas)
   - **Icono** (1024x1024 px)

### 6.7 Enviar para Revisión

1. Marca "Esta compilación no contiene contenido exportado"
2. Completa la información de exportación (si aplica)
3. Click en "Enviar para revisión"
4. Apple revisará tu app (puede tardar 1-7 días)

---

## 7. Actualizaciones Futuras

### 7.1 Actualizar Versión

**En `app.json`:**
```json
{
  "expo": {
    "version": "1.0.1",  // Incrementa esto
    "ios": {
      "buildNumber": "2"  // Incrementa esto
    },
    "android": {
      "versionCode": 2  // Incrementa esto
    }
  }
}
```

### 7.2 Crear Nuevo Build

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

### 7.3 Subir Actualización

```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios
```

---

## 🔧 Solución de Problemas

### Backend no funciona en Vercel

- ✅ Verifica que todas las variables de entorno estén configuradas
- ✅ Revisa los logs en Vercel Dashboard
- ✅ Asegúrate de que `vercel.json` esté en la raíz de `backend`

### Build de EAS falla

- ✅ Verifica que `app.json` tenga el `projectId` correcto
- ✅ Asegúrate de estar logueado: `eas login`
- ✅ Revisa los logs en [expo.dev](https://expo.dev)

### App no se conecta al backend

- ✅ Verifica que `EXPO_PUBLIC_API_URL` esté configurada
- ✅ Asegúrate de que la URL termine en `/api`
- ✅ Verifica que el backend esté funcionando: `curl https://tu-backend.vercel.app/api/salud`

### Google Play rechaza la app

- ✅ Completa todos los campos requeridos
- ✅ Asegúrate de tener política de privacidad
- ✅ Verifica que las capturas de pantalla sean correctas

### Apple App Store rechaza la app

- ✅ Completa la información de privacidad
- ✅ Asegúrate de tener todas las capturas de pantalla
- ✅ Verifica que el Bundle ID sea único

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de EAS Build](https://docs.expo.dev/build/introduction/)
- [Guía de Google Play](https://support.google.com/googleplay/android-developer)
- [Guía de App Store](https://developer.apple.com/app-store/review/)

---

## ✅ Checklist Final

Antes de publicar, verifica:

- [ ] Backend desplegado y funcionando en Vercel
- [ ] Variables de entorno configuradas correctamente
- [ ] `EXPO_PUBLIC_API_URL` apunta al backend de producción
- [ ] `app.json` tiene `projectId` y versiones correctas
- [ ] Builds de producción creados exitosamente
- [ ] APK/AAB probado en dispositivos reales
- [ ] Política de privacidad creada y publicada
- [ ] Capturas de pantalla preparadas
- [ ] Iconos de la app listos (512x512 y 1024x1024)
- [ ] Descripción de la app escrita
- [ ] Email de soporte configurado

---

¡Felicitaciones! 🎉 Tu app está lista para ser publicada.


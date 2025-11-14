# Guía de Deployment del Backend en Railway

Esta guía te ayudará a desplegar el backend de SportPetMatch en Railway usando tu base de datos Neon (PostgreSQL).

## 📋 Prerrequisitos

1. Una cuenta en [Railway](https://railway.app) (es gratis)
2. Una base de datos Neon PostgreSQL configurada (ya la tienes)
3. Git configurado y el proyecto en GitHub

## 🚀 Paso 1: Preparar el repositorio

Asegúrate de que todos los cambios del backend estén subidos a GitHub.

## 📦 Paso 2: Desplegar en Railway

### Opción A: Desde la Interfaz Web (Recomendado)

1. **Ve a [railway.app](https://railway.app) y haz login**

2. **Crea un nuevo proyecto:**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu cuenta de GitHub si no lo has hecho
   - Selecciona el repositorio `leonardobergallo/SportPetMatch`

3. **Configura el servicio:**
   - Railway detectará automáticamente el directorio
   - Necesitas configurar el Root Directory: `backend`
   - Click en el servicio → Settings → Root Directory → Cambia a `backend`

4. **Configura las Variables de Entorno:**
   - Ve a Variables en el servicio
   - Haz clic en "New Variable"
   - Agrega las siguientes variables:
   
   **Variables Requeridas:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_J0FZ4I1XL6HY@ep-steep-queen-a8xy4xkr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
   ```
   (Reemplaza con tu cadena de conexión de Neon completa)
   
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=tu_secreto_jwt_muy_seguro_genera_uno_aleatorio
   JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro_genera_uno_aleatorio
   CORS_ORIGIN=https://tu-app.vercel.app,https://tu-app-preview.vercel.app
   ```
   (Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel)

   **Variables Opcionales (si las usas):**
   ```
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   GOOGLE_CLIENT_ID=tu_google_client_id
   GOOGLE_CLIENT_SECRET=tu_google_client_secret
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

5. **Configura el Build:**
   - En Settings → Build Command: `npm install && npm run build`
   - En Settings → Start Command: `npm start`

6. **Espera a que se despliegue:**
   - Railway automáticamente hará build y deployment
   - Puedes ver los logs en tiempo real
   - Una vez terminado, verás una URL tipo: `https://sportpetmatch-production.up.railway.app`

7. **Obtén la URL del backend:**
   - En el servicio, ve a Settings → Networking
   - Haz clic en "Generate Domain" si no tienes uno
   - Copia la URL (ejemplo: `https://sportpetmatch-backend.up.railway.app`)

## 🔗 Paso 3: Configurar CORS

Asegúrate de que `CORS_ORIGIN` incluya tu dominio de Vercel:
```
CORS_ORIGIN=https://tu-app.vercel.app,https://tu-app-preview.vercel.app
```

## 📱 Paso 4: Actualizar Vercel con la URL del Backend

1. **Ve a tu proyecto en Vercel**
2. **Settings → Environment Variables**
3. **Actualiza o agrega:**
   - Key: `EXPO_PUBLIC_API_URL`
   - Value: `https://tu-backend.railway.app/api`
   (Reemplaza con la URL real de Railway)
4. **Haz un redeploy** en Vercel

## 🔍 Paso 5: Verificar que funciona

1. **Prueba la URL del backend directamente:**
   ```
   https://tu-backend.railway.app/api
   ```
   Deberías ver un JSON con información de la API

2. **Prueba el endpoint de salud:**
   ```
   https://tu-backend.railway.app/api/salud
   ```
   Deberías ver un mensaje de "Servidor funcionando correctamente"

3. **Prueba tu app en Vercel:**
   - Abre tu app desplegada
   - Debería poder conectarse al backend correctamente

## 🔧 Configuración Avanzada

### Base de Datos Prisma

Railway ejecutará automáticamente `npm run build` que incluye `prisma generate`.

Si necesitas ejecutar migraciones:
```bash
# En Railway, puedes usar el CLI o agregar un script
railway run npm run db:push
```

### Logs

- Ve a tu servicio en Railway
- Click en "Deployments" → Selecciona un deployment → "View Logs"
- Puedes ver todos los logs del backend en tiempo real

### Variables de Entorno Sensibles

⚠️ **IMPORTANTE:** Nunca subas tus variables de entorno a Git. Railway las maneja de forma segura.

### Dominio Personalizado

1. En Settings → Networking
2. Haz clic en "Generate Domain" o "Custom Domain"
3. Railway te dará un dominio HTTPS automático

## 🐛 Solución de Problemas

### El backend no inicia

1. **Verifica los logs en Railway:**
   - Ve a Deployments → Logs
   - Busca errores específicos

2. **Verifica las variables de entorno:**
   - Asegúrate de que `DATABASE_URL` esté correcta
   - Verifica que `JWT_SECRET` esté configurado

3. **Verifica el build:**
   - Asegúrate de que `npm run build` funcione localmente

### Error de conexión a la base de datos

1. **Verifica que la cadena de conexión sea correcta:**
   - Asegúrate de que no tenga `psql` al inicio
   - Debe ser solo: `postgresql://usuario:password@host/db?params`

2. **Verifica que Neon permita conexiones externas:**
   - En Neon, verifica la configuración de firewall

### CORS errors en el frontend

1. **Verifica `CORS_ORIGIN` en Railway:**
   - Debe incluir tu dominio de Vercel
   - Ejemplo: `https://sportpetmatch.vercel.app`

2. **Verifica que la URL del backend sea correcta:**
   - En Vercel, `EXPO_PUBLIC_API_URL` debe ser: `https://tu-backend.railway.app/api`

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de uso
- Alertas (si configuradas)

## 💰 Costos

Railway ofrece un plan gratuito generoso:
- $5 de crédito gratis al mes
- Suficiente para proyectos pequeños/medianos
- Pago por uso si excedes

## 🎉 ¡Listo!

Ahora tienes tu backend desplegado en Railway y tu frontend en Vercel, ambos funcionando juntos en producción.

### Resumen de URLs:

- **Frontend (Vercel):** `https://tu-app.vercel.app`
- **Backend (Railway):** `https://tu-backend.railway.app`
- **API Base URL:** `https://tu-backend.railway.app/api`


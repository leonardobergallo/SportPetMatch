# 🚀 Desplegar Backend + Frontend en un Solo Proyecto Vercel

Esta guía te muestra cómo desplegar tanto el backend como el frontend en **un solo proyecto de Vercel** usando monorepo.

---

## 📋 Prerrequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
2. ✅ Proyecto en GitHub, GitLab o Bitbucket
3. ✅ Base de datos PostgreSQL (Neon, Supabase, Railway, etc.)
4. ✅ Node.js instalado localmente

---

## 🗄️ Paso 1: Configurar Base de Datos

Antes de desplegar, necesitas una base de datos PostgreSQL:

### Opciones Recomendadas:
- **Neon** (gratis): https://neon.tech
- **Supabase** (gratis): https://supabase.com
- **Railway** (gratis): https://railway.app

### Obtener URL de Conexión:
1. Crea una base de datos PostgreSQL
2. Copia la **Connection String** (URL completa)
3. Ejemplo: `postgresql://user:password@host:5432/database?sslmode=require`

---

## 🔧 Paso 2: Configuración del Proyecto

### 2.1 Estructura del Proyecto

El proyecto está configurado como monorepo:
```
SportPetMatch/
├── backend/          # Backend Express
├── frontend/         # Frontend Expo/React Native
├── api/              # (generado automáticamente) Handler para Vercel
├── vercel.json       # Configuración de Vercel
└── package.json      # Scripts de build
```

### 2.2 Archivos de Configuración

✅ **`vercel.json`** (en la raíz) - Ya configurado:
- Rutas `/api/*` → función serverless del backend
- Rutas `/*` → frontend estático
- Headers para PWA

✅ **Scripts de build** - Ya configurados:
- `npm run build:all` - Construye backend y frontend
- `npm run copy:api` - Copia archivos necesarios

---

## 🚀 Paso 3: Desplegar en Vercel

### 3.1 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"** o **"New Project"**
3. Importa tu repositorio de Git
4. Selecciona el repositorio `SportPetMatch`

### 3.2 Configurar el Proyecto

**Configuración:**
- **Framework Preset**: `Other` (Otro)
- **Root Directory**: (deja en blanco - raíz del proyecto) ⚠️ **IMPORTANTE**
- **Build Command**: `npm run vercel-build`
- **Output Directory**: (deja en blanco - se maneja automáticamente)
- **Install Command**: `npm install && cd backend && npm install && cd ../frontend && npm install`

**Nota:** El `vercel.json` en la raíz maneja toda la configuración automáticamente.

### 3.3 Variables de Entorno

Haz clic en **"Environment Variables"** y agrega:

**Obligatorias:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```
(Reemplaza con tu URL de conexión real)

```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_secreto_jwt_muy_seguro_genera_uno_aleatorio
JWT_REFRESH_SECRET=otro_secreto_refresh_muy_seguro
```

**Para generar secretos seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**CORS (importante):**
```
CORS_ORIGIN=https://tu-proyecto.vercel.app
```
(Actualizarás esto después del primer deploy con tu URL real)

**Opcionales (si los usas):**
```
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret
RESEND_API_KEY=tu_resend_api_key
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

**Frontend (si necesitas):**
```
EXPO_PUBLIC_API_URL=/api
```
(Usa `/api` relativo, ya que todo está en el mismo dominio)

### 3.4 Deploy

1. Haz clic en **"Deploy"**
2. Espera 3-7 minutos mientras se construye y despliega:
   - Instala dependencias del root, backend y frontend
   - Construye el backend
   - Construye el frontend
   - Copia archivos necesarios
3. Una vez terminado, verás una URL tipo: `https://sportpetmatch.vercel.app`

### 3.5 Actualizar CORS

Después del primer deploy:

1. Ve a Settings → Environment Variables
2. Actualiza `CORS_ORIGIN` con tu URL real:
   ```
   CORS_ORIGIN=https://tu-proyecto.vercel.app
   ```
3. Haz **Redeploy**

---

## ✅ Paso 4: Verificar que Todo Funciona

### 4.1 Verificar Backend

1. Abre: `https://tu-proyecto.vercel.app/api/salud`
2. Debe responder con un JSON de salud:
   ```json
   {
     "mensaje": "¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",
     ...
   }
   ```

### 4.2 Verificar Frontend

1. Abre la URL principal: `https://tu-proyecto.vercel.app`
2. Debe cargar la app
3. Prueba hacer login con un usuario de prueba
4. Abre DevTools (F12) y verifica:
   - **Application → Manifest**: Debe ser válido
   - **Application → Service Workers**: Debe estar activado
   - **Console**: No debe haber errores de conexión
   - **Network**: Las peticiones a `/api/*` deben funcionar

### 4.3 Probar en Móvil

1. Abre la URL en tu celular
2. La app debería funcionar correctamente
3. Prueba instalar como PWA:
   - **Android (Chrome):** Menú → "Agregar a pantalla de inicio"
   - **iOS (Safari):** Compartir → "Agregar a pantalla de inicio"

---

## 🔄 Paso 5: Actualizaciones Futuras

Cada vez que hagas cambios:

1. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   ```

2. **Vercel desplegará automáticamente** (si tienes auto-deploy activado)

3. O despliega manualmente:
   - Desde la web: Ve al proyecto → "Deployments" → "Redeploy"
   - Desde CLI: `vercel --prod`

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Causa común:** Dependencias no instaladas o script de build fallido.

**Solución:**
1. Verifica que `npm run build:all` funcione localmente
2. Revisa los logs de build en Vercel
3. Asegúrate de que todos los scripts estén en `package.json`

### Error: "Cannot find module" en api/index.js

**Causa común:** El build del backend no se completó o no se copió correctamente.

**Solución:**
1. Verifica que `backend/dist` exista después del build
2. Verifica que el script `copy:api` se ejecute correctamente
3. Revisa los logs de build en Vercel

### Backend no responde en /api/*

**Causa común:** Variables de entorno incorrectas o base de datos no accesible.

**Solución:**
1. Verifica que `DATABASE_URL` sea correcta
2. Verifica que la base de datos permita conexiones externas
3. Revisa los logs en Vercel → Deployments → Logs
4. Prueba el endpoint `/api/salud`

### Frontend no se conecta al backend

**Causa común:** `EXPO_PUBLIC_API_URL` incorrecta o CORS mal configurado.

**Solución:**
1. Verifica que `EXPO_PUBLIC_API_URL` sea `/api` (ruta relativa)
2. Verifica que `CORS_ORIGIN` en las variables de entorno incluya tu URL
3. Haz redeploy

### Error "Function timeout"

**Causa común:** La función serverless tarda más de 10 segundos.

**Solución:**
1. El `vercel.json` ya tiene `maxDuration: 30` configurado
2. Si necesitas más tiempo, actualiza en `vercel.json`:
   ```json
   "functions": {
     "api/index.js": {
       "memory": 1024,
       "maxDuration": 60
     }
   }
   ```

---

## 📊 Cómo Funciona

### Estructura en Vercel:

```
https://tu-proyecto.vercel.app/
├── /api/*          → Función serverless (backend)
│   └── /api/salud  → Backend endpoint
│   └── /api/auth/* → Backend auth routes
│   └── ...
├── /                → Frontend estático
├── /index.html      → Frontend
├── /manifest.json   → PWA manifest
├── /sw.js           → Service Worker
└── /icon-*.png      → PWA icons
```

### Flujo de Build:

1. **Instalar dependencias:**
   - Root: `npm install`
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

2. **Construir backend:**
   - `cd backend && npm run build`
   - Genera `backend/dist/`

3. **Construir frontend:**
   - `cd frontend && npm run build`
   - Genera `frontend/dist/`

4. **Copiar archivos:**
   - `backend/api/index.js` → `api/index.js`
   - `backend/dist/` → `api/dist/`
   - `frontend/dist/*` → raíz del proyecto

5. **Vercel sirve:**
   - `/api/*` → función serverless
   - `/*` → archivos estáticos del frontend

---

## 📚 Variables de Entorno Resumen

### Obligatorias:
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `NODE_ENV=production`
- `JWT_SECRET` - Secreto para tokens JWT
- `JWT_REFRESH_SECRET` - Secreto para refresh tokens
- `CORS_ORIGIN` - URL de tu proyecto (después del deploy)

### Frontend (Opcional):
- `EXPO_PUBLIC_API_URL=/api` - Ruta relativa al backend

---

## ✅ Checklist Final

- [ ] Base de datos PostgreSQL creada
- [ ] Proyecto creado en Vercel
- [ ] Root Directory: (raíz, no subdirectorio)
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Endpoint `/api/salud` funciona
- [ ] App carga correctamente en `/`
- [ ] PWA instalable
- [ ] Login funciona
- [ ] App funciona en móvil

---

## 🎉 ¡Listo!

Tu app completa (backend + frontend) está desplegada en **un solo proyecto de Vercel** y funcionando.

**URL única:** `https://tu-proyecto.vercel.app`

- **Backend:** `https://tu-proyecto.vercel.app/api/*`
- **Frontend:** `https://tu-proyecto.vercel.app/`

¡Comparte la URL con tus usuarios! 🚀


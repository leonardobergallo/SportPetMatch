# 🚀 Guía Completa: Desplegar Backend y Frontend en Vercel

Esta guía te muestra cómo desplegar tanto el backend como el frontend de SportPetMatch en Vercel.

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

## 🔧 Paso 2: Desplegar el Backend en Vercel

### 2.1 Crear Proyecto del Backend

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"** o **"New Project"**
3. Importa tu repositorio de Git
4. Selecciona el repositorio `SportPetMatch`

### 2.2 Configurar el Proyecto del Backend

**Configuración:**
- **Framework Preset**: `Other` (Otro)
- **Root Directory**: `backend` ⚠️ **MUY IMPORTANTE**
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Variables de Entorno del Backend

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

**CORS (importante para el frontend):**
```
CORS_ORIGIN=https://tu-frontend.vercel.app
```
(Actualizarás esto después de desplegar el frontend)

### 2.4 Deploy del Backend

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras se construye y despliega
3. Una vez terminado, verás una URL tipo: `https://sportpetmatch-backend.vercel.app`
4. **Copia esta URL** - la necesitarás para el frontend

### 2.5 Verificar el Backend

1. Abre la URL del backend en tu navegador
2. Deberías ver: `{"mensaje":"Cannot GET /"}`
3. Prueba el endpoint de salud: `https://tu-backend.vercel.app/api/salud`
4. Deberías ver: `{"mensaje":"¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",...}`

---

## 🎨 Paso 3: Desplegar el Frontend en Vercel

### 3.1 Crear Proyecto del Frontend

1. En Vercel, haz clic en **"Add New Project"** nuevamente
2. Importa el mismo repositorio `SportPetMatch`
3. **IMPORTANTE:** Este será un proyecto diferente al backend

### 3.2 Configurar el Proyecto del Frontend

**Configuración:**
- **Framework Preset**: `Other` (Otro)
- **Root Directory**: `frontend` ⚠️ **MUY IMPORTANTE**
- **Build Command**: `npm install && npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Variables de Entorno del Frontend

Haz clic en **"Environment Variables"** y agrega:

**Obligatoria:**
```
EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
```
(Reemplaza `tu-backend.vercel.app` con la URL real de tu backend)

**Opcionales (si los usas):**
```
GOOGLE_WEB_CLIENT_ID=tu_google_web_client_id
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret
```

### 3.4 Deploy del Frontend

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras se construye y despliega
3. Una vez terminado, verás una URL tipo: `https://sportpetmatch.vercel.app`
4. **Copia esta URL** - esta es tu app pública

### 3.5 Actualizar CORS del Backend

Ahora que tienes la URL del frontend:

1. Ve al proyecto del **backend** en Vercel
2. Settings → Environment Variables
3. Actualiza `CORS_ORIGIN` con la URL del frontend:
   ```
   CORS_ORIGIN=https://tu-frontend.vercel.app
   ```
4. Haz **Redeploy** del backend

---

## ✅ Paso 4: Verificar Todo Funciona

### 4.1 Verificar Backend

1. Abre: `https://tu-backend.vercel.app/api/salud`
2. Debe responder con un JSON de salud

### 4.2 Verificar Frontend

1. Abre la URL del frontend
2. Debe cargar la app
3. Prueba hacer login con un usuario de prueba
4. Abre DevTools (F12) y verifica:
   - **Application → Manifest**: Debe ser válido
   - **Application → Service Workers**: Debe estar activado
   - **Console**: No debe haber errores de conexión

### 4.3 Probar en Móvil

1. Abre la URL del frontend en tu celular
2. La app debería funcionar correctamente
3. Prueba instalar como PWA:
   - **Android (Chrome):** Menú → "Agregar a pantalla de inicio"
   - **iOS (Safari):** Compartir → "Agregar a pantalla de inicio"

---

## 🔄 Paso 5: Actualizaciones Futuras

### Backend:
1. Haz cambios en el código
2. Commit y push:
   ```bash
   git add backend/
   git commit -m "Actualizar backend"
   git push
   ```
3. Vercel desplegará automáticamente

### Frontend:
1. Haz cambios en el código
2. Commit y push:
   ```bash
   git add frontend/
   git commit -m "Actualizar frontend"
   git push
   ```
3. Vercel desplegará automáticamente

---

## 🐛 Solución de Problemas

### Backend no responde

**Causa común:** Variables de entorno incorrectas o base de datos no accesible.

**Solución:**
1. Verifica que `DATABASE_URL` sea correcta
2. Verifica que la base de datos permita conexiones externas
3. Revisa los logs en Vercel → Deployments → Logs

### Frontend no se conecta al backend

**Causa común:** `EXPO_PUBLIC_API_URL` incorrecta o CORS mal configurado.

**Solución:**
1. Verifica que `EXPO_PUBLIC_API_URL` apunte al backend correcto
2. Verifica que `CORS_ORIGIN` en el backend incluya la URL del frontend
3. Haz redeploy de ambos proyectos

### Error "Cannot find module"

**Causa común:** Dependencias no instaladas o build fallido.

**Solución:**
1. Verifica que `package.json` tenga todas las dependencias
2. Revisa los logs de build en Vercel
3. Prueba el build localmente primero

### Base de datos no conecta

**Causa común:** URL incorrecta o firewall bloqueando.

**Solución:**
1. Verifica que la URL de conexión sea correcta
2. Asegúrate de que la base de datos permita conexiones desde Vercel
3. Verifica que `sslmode=require` esté en la URL si es necesario

---

## 📊 Estructura de Proyectos en Vercel

Tendrás **2 proyectos separados** en Vercel:

1. **Backend Project:**
   - URL: `https://sportpetmatch-backend.vercel.app`
   - Root: `backend/`
   - Output: `dist/`

2. **Frontend Project:**
   - URL: `https://sportpetmatch.vercel.app`
   - Root: `frontend/`
   - Output: `dist/`

---

## 📚 Variables de Entorno Resumen

### Backend (Obligatorias):
- `DATABASE_URL`
- `NODE_ENV=production`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (después de desplegar frontend)

### Frontend (Obligatorias):
- `EXPO_PUBLIC_API_URL`

---

## ✅ Checklist Final

### Backend:
- [ ] Base de datos PostgreSQL creada
- [ ] Proyecto backend creado en Vercel
- [ ] Root Directory: `backend`
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Endpoint `/api/salud` funciona

### Frontend:
- [ ] Proyecto frontend creado en Vercel
- [ ] Root Directory: `frontend`
- [ ] Variable `EXPO_PUBLIC_API_URL` configurada
- [ ] Deploy exitoso
- [ ] App carga correctamente
- [ ] PWA instalable

### Integración:
- [ ] CORS actualizado en backend con URL del frontend
- [ ] Frontend se conecta al backend
- [ ] Login funciona
- [ ] App funciona en móvil

---

## 🎉 ¡Listo!

Tu app completa (backend + frontend) está desplegada en Vercel y funcionando.

**URLs:**
- **Backend:** `https://tu-backend.vercel.app`
- **Frontend:** `https://tu-frontend.vercel.app`

¡Comparte la URL del frontend con tus usuarios! 🚀



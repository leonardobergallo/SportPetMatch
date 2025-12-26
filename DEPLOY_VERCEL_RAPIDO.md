# ⚡ Desplegar Backend + Frontend en Vercel - Guía Rápida

## 🚀 Pasos Rápidos (15 minutos)

### 1. Base de Datos
- Crea una base de datos PostgreSQL (Neon, Supabase, Railway)
- Copia la Connection String

### 2. Backend en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importa tu repositorio
4. **Configuración:**
   - **Root Directory**: `backend`
   - **Framework**: `Other`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
5. **Variables de Entorno:**
   ```
   DATABASE_URL=tu_connection_string
   NODE_ENV=production
   JWT_SECRET=genera_uno_seguro
   JWT_REFRESH_SECRET=genera_otro_seguro
   ```
6. "Deploy"
7. **Copia la URL del backend** (ej: `https://sportpetmatch-backend.vercel.app`)

### 3. Frontend en Vercel

1. "Add New Project" (nuevo proyecto)
2. Importa el mismo repositorio
3. **Configuración:**
   - **Root Directory**: `frontend`
   - **Framework**: `Other`
   - **Build Command**: `npm install && npm run vercel-build`
   - **Output Directory**: `dist`
4. **Variable de Entorno:**
   ```
   EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
   ```
5. "Deploy"
6. **Copia la URL del frontend**

### 4. Actualizar CORS

1. Ve al proyecto **backend** en Vercel
2. Settings → Environment Variables
3. Agrega/Actualiza:
   ```
   CORS_ORIGIN=https://tu-frontend.vercel.app
   ```
4. Redeploy del backend

### 5. ¡Listo! 🎉

- **Backend:** `https://tu-backend.vercel.app`
- **Frontend:** `https://tu-frontend.vercel.app`

---

## 📖 Guía Completa

Para más detalles, ve a: `docs/DEPLOY_COMPLETO_VERCEL.md`


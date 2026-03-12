# ⚡ Desplegar en Vercel (Monorepo) - Guía Rápida

## 🚀 Pasos Rápidos (10 minutos)

### 1. Base de Datos
- Crea PostgreSQL (Neon, Supabase, Railway)
- Copia la Connection String

### 2. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importa tu repositorio
4. **Configuración:**
   - **Root Directory**: (deja en blanco - raíz)
   - **Framework**: `Other`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: (deja en blanco)
   - **Install Command**: `npm install && cd backend && npm install && cd ../frontend && npm install`
5. **Variables de Entorno:**
   ```
   DATABASE_URL=tu_connection_string
   NODE_ENV=production
   JWT_SECRET=genera_uno_seguro
   JWT_REFRESH_SECRET=genera_otro_seguro
   EXPO_PUBLIC_API_URL=/api
   ```
6. "Deploy"
7. Espera 3-7 minutos
8. **Copia tu URL** (ej: `https://sportpetmatch.vercel.app`)

### 3. Actualizar CORS

1. Ve a Settings → Environment Variables
2. Agrega/Actualiza:
   ```
   CORS_ORIGIN=https://tu-proyecto.vercel.app
   ```
3. Redeploy

### 4. ¡Listo! 🎉

- **App:** `https://tu-proyecto.vercel.app`
- **Backend API:** `https://tu-proyecto.vercel.app/api/*`

---

## 📖 Guía Completa

Para más detalles, ve a: `docs/DEPLOY_MONOREPO_VERCEL.md`



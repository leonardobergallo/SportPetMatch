# ✅ Resumen: Desplegar Backend + Frontend en un Solo Proyecto Vercel

## 🎯 Estado: Listo para Desplegar

Tu proyecto está completamente configurado para desplegarse en **un solo proyecto de Vercel**. Tanto el backend como el frontend funcionarán desde la misma URL.

---

## 📋 Configuración Completada

### ✅ Archivos Creados/Configurados

1. **`vercel.json`** (raíz) ✅
   - Configuración para monorepo
   - Rutas `/api/*` → backend (función serverless)
   - Rutas `/*` → frontend (sitio estático)
   - Headers para PWA

2. **`package.json`** (raíz) ✅
   - Script `vercel-build` configurado
   - Script `build:all` que construye ambos
   - Script `copy:api` que copia archivos necesarios

3. **`scripts/copiar-api.js`** ✅
   - Copia `backend/api/index.js` → `api/index.js`
   - Copia `backend/dist/` → `api/dist/`
   - Copia `frontend/dist/*` → raíz del proyecto

4. **`.gitignore`** ✅
   - Ignora `api/` y archivos de build

5. **`frontend/src/utilidades/config.ts`** ✅
   - Actualizado para soportar rutas relativas (`/api`)

---

## 🚀 Cómo Desplegar (3 Pasos)

### 1. Preparar Base de Datos
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

### 3. Actualizar CORS

Después del deploy:
1. Settings → Environment Variables
2. Agrega: `CORS_ORIGIN=https://tu-proyecto.vercel.app`
3. Redeploy

---

## 📊 Cómo Funciona

### Estructura en Vercel:

```
https://tu-proyecto.vercel.app/
├── /api/*          → Backend (función serverless)
│   └── /api/salud  → Endpoint de salud
│   └── /api/auth/* → Rutas de autenticación
│   └── ...
├── /                → Frontend (sitio estático)
├── /index.html      → App React
├── /manifest.json   → PWA manifest
├── /sw.js           → Service Worker
└── /icon-*.png      → Iconos PWA
```

### Flujo de Build:

1. Instala dependencias (root, backend, frontend)
2. Construye backend → `backend/dist/`
3. Construye frontend → `frontend/dist/`
4. Copia archivos:
   - `backend/api/index.js` → `api/index.js`
   - `backend/dist/` → `api/dist/`
   - `frontend/dist/*` → raíz
5. Vercel sirve:
   - `/api/*` → función serverless
   - `/*` → archivos estáticos

---

## ✅ Checklist Pre-Deploy

- [x] `vercel.json` configurado en la raíz
- [x] Scripts de build configurados
- [x] Script `copy:api.js` creado
- [x] Frontend actualizado para rutas relativas
- [x] Build funciona localmente (`npm run build:all`)
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno preparadas
- [ ] Código subido a Git

---

## 📚 Documentación

- **Guía completa**: `docs/DEPLOY_MONOREPO_VERCEL.md`
- **Guía rápida**: `DEPLOY_VERCEL_MONOREPO_RAPIDO.md`

---

## 🎉 ¡Listo!

Tu app está completamente preparada para desplegarse en **un solo proyecto de Vercel**.

**URL única:** `https://tu-proyecto.vercel.app`
- **Backend:** `https://tu-proyecto.vercel.app/api/*`
- **Frontend:** `https://tu-proyecto.vercel.app/`

¡Solo necesitas seguir los pasos de deploy! 🚀


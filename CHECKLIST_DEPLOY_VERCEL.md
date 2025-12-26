# ✅ Checklist: Deploy en Vercel - Todo Listo

## 🎯 Estado: Listo para Desplegar

Tu proyecto está **completamente configurado** para funcionar en Vercel con backend y frontend en el mismo proyecto.

---

## ✅ Configuración Verificada

### ✅ Archivos de Configuración
- [x] `vercel.json` en la raíz - Configurado para monorepo
- [x] `package.json` - Scripts de build configurados
- [x] `scripts/copiar-api.js` - Copia archivos correctamente
- [x] `backend/api/index.js` - Handler para Vercel
- [x] `frontend/src/utilidades/config.ts` - Detección automática de `/api`

### ✅ Funcionalidades
- [x] Backend se construye correctamente
- [x] Frontend se construye correctamente
- [x] Archivos se copian a la estructura correcta
- [x] Rutas `/api/*` → Backend (función serverless)
- [x] Rutas `/*` → Frontend (sitio estático)
- [x] PWA configurada (manifest, service worker, iconos)

---

## 🚀 Cómo Desplegar (Paso a Paso)

### 1. Ve a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Si ya tienes un proyecto, ve a **Settings**
3. Si es nuevo, haz clic en **"Add New Project"**

### 2. Configuración del Proyecto

**IMPORTANTE:** Si ya tienes un proyecto, verifica estas configuraciones:

- **Root Directory**: (deja en blanco - raíz del proyecto) ⚠️
- **Framework**: `Other`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: (deja en blanco)
- **Install Command**: `npm install && cd backend && npm install && cd ../frontend && npm install`

### 3. Variables de Entorno

Ve a **Settings** → **Environment Variables** y verifica:

**Obligatorias:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_refresh_secret
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

**Frontend (Opcional - se detecta automáticamente):**
```
EXPO_PUBLIC_API_URL=/api
```

**⚠️ IMPORTANTE:** 
- `DATABASE_URL` es para el backend (PostgreSQL)
- `EXPO_PUBLIC_API_URL` es para el frontend (URL del API)
- **NO confundas estas dos variables**

### 4. Deploy

1. Si es proyecto nuevo: Haz clic en **"Deploy"**
2. Si es proyecto existente: Ve a **Deployments** → **Redeploy**
3. Espera 3-7 minutos mientras se construye

---

## ✅ Verificar que Funciona

### 1. Backend

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/salud
```

**Deberías ver:**
```json
{
  "mensaje": "¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",
  "version": "1.0.0",
  ...
}
```

### 2. Frontend

Abre:
```
https://tu-proyecto.vercel.app
```

**Deberías ver:**
- La app cargando
- Sin errores en la consola (F12)
- Poder hacer login

### 3. Login

Prueba hacer login con:
- Email: `maria.gonzalez@sportpetmatch.com`
- Password: `123456`

**Debería funcionar sin errores.**

---

## 📊 Estructura en Vercel

Después del deploy, tendrás:

```
https://tu-proyecto.vercel.app/
├── /api/*          → Backend (función serverless)
│   ├── /api/salud  → ✅ Funciona
│   ├── /api/auth/login → ✅ Funciona (POST)
│   └── ...
├── /                → Frontend (sitio estático)
├── /index.html      → App React
├── /manifest.json   → PWA manifest
└── /sw.js           → Service Worker
```

---

## 🐛 Si Algo No Funciona

### Error 405 en /api/auth/login

**Causa:** El backend no está cargando correctamente.

**Solución:**
1. Revisa los logs en Vercel → Deployments → Function Logs
2. Verifica que `api/dist/` exista después del build
3. Haz redeploy completo

### Error "Cannot find module"

**Causa:** El build del backend no se completó.

**Solución:**
1. Revisa los logs del build en Vercel
2. Verifica que `backend/dist/` se haya creado
3. Verifica que el script `copy:api` se ejecutó

### Frontend no se conecta al backend

**Causa:** Variable `EXPO_PUBLIC_API_URL` incorrecta o no configurada.

**Solución:**
- La app detecta automáticamente `/api` en producción
- O configura `EXPO_PUBLIC_API_URL=/api` en Vercel

---

## ✅ Checklist Final

Antes de desplegar, verifica:

- [ ] Código subido a Git
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno preparadas
- [ ] Build funciona localmente (`npm run build:all`)
- [ ] Proyecto configurado en Vercel
- [ ] Root Directory: (raíz, no subdirectorio)

---

## 🎉 Resultado Esperado

Después del deploy exitoso:

✅ **Una sola URL** para todo:
- App: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-proyecto.vercel.app/api/*`

✅ **Todo funciona:**
- Backend responde en `/api/salud`
- Login funciona en `/api/auth/login`
- Frontend carga correctamente
- PWA instalable

---

## 📚 Documentación

- **Guía completa**: `docs/DEPLOY_MONOREPO_VERCEL.md`
- **Guía rápida**: `DEPLOY_VERCEL_MONOREPO_RAPIDO.md`
- **Solución errores**: `SOLUCION_ERROR_405_VERCEL.md`

---

## 🚀 ¡Listo para Desplegar!

Todo está configurado. Solo necesitas:

1. **Ir a Vercel**
2. **Configurar variables de entorno** (si no lo has hecho)
3. **Hacer Deploy**
4. **¡Listo!** 🎉



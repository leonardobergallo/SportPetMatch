# 🔧 Solución: Error EXPO_PUBLIC_API_URL en Vercel

## ❌ Error que estás viendo:

```
❌ EXPO_PUBLIC_API_URL contiene una cadena de conexión de base de datos, no una URL del API.
❌ Debe ser algo como: https://tu-backend.render.com/api o /api
❌ No debe ser: postgresql://... o psql '...'
```

---

## ✅ Solución: Configurar Correctamente en Vercel

### Si tienes un MONOREPO (backend + frontend en el mismo proyecto):

**La variable debe ser:**
```
EXPO_PUBLIC_API_URL=/api
```

**NO debe ser:**
- ❌ `postgresql://...` (cadena de conexión de base de datos)
- ❌ `https://sport-pet-match-backend.vercel.app/api` (URL completa)
- ✅ `/api` (ruta relativa - correcto para monorepo)

---

## 🔧 Cómo Corregirlo en Vercel

### Paso 1: Ir a Variables de Entorno

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Busca `EXPO_PUBLIC_API_URL`

### Paso 2: Eliminar la Variable Incorrecta

1. Si existe `EXPO_PUBLIC_API_URL` con un valor incorrecto (como `postgresql://...`), **elimínala**
2. Haz clic en el icono de eliminar (🗑️) junto a la variable

### Paso 3: Agregar la Variable Correcta

1. Haz clic en **"Add New"**
2. **Key**: `EXPO_PUBLIC_API_URL`
3. **Value**: `/api` (solo esto, sin comillas)
4. **Environment**: Selecciona:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

### Paso 4: Redeploy

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el deploy

---

## 📋 Variables de Entorno Correctas para Monorepo

### Backend (Obligatorias):
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=otro_secreto
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

### Frontend (Obligatoria):
```
EXPO_PUBLIC_API_URL=/api
```

**⚠️ IMPORTANTE:** 
- `DATABASE_URL` es para el backend (conexión a PostgreSQL)
- `EXPO_PUBLIC_API_URL` es para el frontend (URL del API)
- **NO confundas estas dos variables**

---

## 🔍 Verificar que Funciona

Después del redeploy:

1. Abre tu app en Vercel
2. Abre la consola del navegador (F12)
3. No deberías ver el error de `EXPO_PUBLIC_API_URL`
4. Intenta hacer login
5. Debería conectarse correctamente a `/api`

---

## 🐛 Si Aún No Funciona

### Verificar que el Backend Funciona:

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/salud
```

Deberías ver un JSON. Si no funciona, el backend no está desplegado correctamente.

### Verificar Variables en Vercel:

1. Ve a Settings → Environment Variables
2. Verifica que:
   - `EXPO_PUBLIC_API_URL` = `/api` (sin comillas)
   - `DATABASE_URL` = tu cadena de conexión de PostgreSQL
   - NO hay duplicados

### Verificar el Build:

1. Ve a Deployments → Último deployment
2. Revisa los logs del build
3. Verifica que no haya errores

---

## ✅ Resumen

**Para monorepo en Vercel:**
- ✅ `EXPO_PUBLIC_API_URL=/api` (ruta relativa)
- ❌ NO uses URL completa como `https://...`
- ❌ NO uses la cadena de conexión de base de datos

**Después de corregir:**
1. Guarda la variable
2. Haz redeploy
3. Prueba la app



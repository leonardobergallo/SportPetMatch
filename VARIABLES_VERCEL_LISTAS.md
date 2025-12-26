# 🔐 Variables de Entorno para Vercel - Listas para Copiar

## 📋 Copia y Pega en Vercel

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables** → **"Add New"**

Agrega estas variables **una por una**:

---

## ✅ Variables Obligatorias

### 1. DATABASE_URL
**Key:** `DATABASE_URL`  
**Value:** 
```
postgresql://neondb_owner:npg_JOFZ4IlXL6HY@ep-steep-queen-a8xy4xkr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. NODE_ENV
**Key:** `NODE_ENV`  
**Value:** `production`  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. JWT_SECRET
**Key:** `JWT_SECRET`  
**Value:** 
```
21bdc0f3b89d6295fa4b4c7d43d02eba994cd993467b2d990ae719c27a8d4bbc
```
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 4. JWT_REFRESH_SECRET
**Key:** `JWT_REFRESH_SECRET`  
**Value:** 
```
03e0df7fc0304ec282cb0e511f2174be6fd31fb818ff228f3b657332e62d68ee
```
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 5. CORS_ORIGIN
**Key:** `CORS_ORIGIN`  
**Value:** `https://tu-proyecto.vercel.app`  
⚠️ **Actualiza esto después del primer deploy con tu URL real**  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

## 🔄 Opcional (Frontend)

### 6. EXPO_PUBLIC_API_URL (Opcional)
**Key:** `EXPO_PUBLIC_API_URL`  
**Value:** `/api`  
**Nota:** Se detecta automáticamente, pero puedes configurarla explícitamente  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

## 📝 Resumen Rápido

Copia estas 5 variables a Vercel:

1. ✅ `DATABASE_URL` = `postgresql://neondb_owner:npg_JOFZ4IlXL6HY@ep-steep-queen-a8xy4xkr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require`
2. ✅ `NODE_ENV` = `production`
3. ✅ `JWT_SECRET` = `21bdc0f3b89d6295fa4b4c7d43d02eba994cd993467b2d990ae719c27a8d4bbc`
4. ✅ `JWT_REFRESH_SECRET` = `03e0df7fc0304ec282cb0e511f2174be6fd31fb818ff228f3b657332e62d68ee`
5. ✅ `CORS_ORIGIN` = `https://tu-proyecto.vercel.app` (actualiza después del deploy)

---

## 🚀 Después de Configurar

1. **Haz redeploy** en Vercel
2. **Crea las tablas** en la base de datos:
   ```bash
   cd backend
   npm run db:push
   ```
3. **Pobla con datos de ejemplo** (opcional):
   ```bash
   npm run db:seed
   ```
4. **Verifica** que funciona:
   - Abre: `https://tu-proyecto.vercel.app/api/salud`
   - Deberías ver: `"baseDatos": "Conectada ✅"`

---

## ✅ ¡Listo!

Una vez configuradas estas variables y creadas las tablas, tu app funcionará completamente en Vercel.


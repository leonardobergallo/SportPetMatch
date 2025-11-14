# 🚀 Desplegar Backend en Render (Súper Fácil)

## Pasos Rápidos (5 minutos)

### 1. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en "Get Started for Free"
3. Registrate con GitHub (igual que Vercel)

### 2. Crear nuevo servicio
1. En el Dashboard, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub si no lo has hecho
4. Selecciona el repositorio: `leonardobergallo/SportPetMatch`

### 3. Configurar el servicio
Llena estos campos:

**Información básica:**
- **Name**: `sportpetmatch-backend` (o el que prefieras)
- **Region**: Elige el más cercano (US, EU, etc.)
- **Branch**: `main`

**Configuración de Build:**
- **Root Directory**: `backend` ⚠️ **IMPORTANTE: Solo esto**
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Variables de Entorno
Haz clic en **"Advanced"** y agrega estas variables:

**Obligatorias:**
```
DATABASE_URL=postgresql://neondb_owner:npg_JOFZ4IlXL6HY@ep-steep-queen-a8xy4xkr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
(Pega tu cadena de conexión de Neon completa, SIN el `psql` ni las comillas)

```
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui_genera_uno_aleatorio
JWT_REFRESH_SECRET=otro_secreto_refresh_super_seguro_aqui
```

**CORS (IMPORTANTE):**
```
CORS_ORIGIN=https://tu-app.vercel.app
```
(Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel)

**Opcionales (si las usas):**
```
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### 5. Crear el servicio
1. Haz clic en **"Create Web Service"**
2. Render empezará a construir y desplegar automáticamente
3. Espera 2-5 minutos mientras se despliega
4. Verás logs en tiempo real

### 6. Obtener la URL
Una vez desplegado:
1. Verás una URL tipo: `https://sportpetmatch-backend.onrender.com`
2. **Copia esa URL** ✅

### 7. Probar que funciona
Abre en tu navegador:
```
https://tu-backend.onrender.com/api
```
Deberías ver un JSON con información de la API.

Prueba también:
```
https://tu-backend.onrender.com/api/salud
```
Deberías ver "Servidor funcionando correctamente".

## 🔗 Conectar con Vercel

### 1. En Vercel
1. Ve a tu proyecto del frontend
2. **Settings** → **Environment Variables**
3. Haz clic en **"Add New"**
4. Agrega:
   - **Key**: `EXPO_PUBLIC_API_URL`
   - **Value**: `https://tu-backend.onrender.com/api`
   (Reemplaza con tu URL real de Render)
5. Marca todas las opciones (Production, Preview, Development)
6. Haz clic en **"Save"**

### 2. Redeploy en Vercel
1. Ve a **Deployments**
2. Haz clic en los 3 puntos del último deployment
3. Selecciona **"Redeploy"**
4. ¡Listo! 🎉

## ⚠️ Notas Importantes

### Puerto
- Render usa el puerto `10000` por defecto
- Tu backend debe usar `process.env.PORT` (que ya lo hace)
- No cambies el puerto manualmente

### Base de datos
- Tu cadena de conexión de Neon ya está lista
- Solo cópiala y pégala en `DATABASE_URL` (sin `psql`)

### CORS
- **MUY IMPORTANTE**: Configura `CORS_ORIGIN` con tu dominio de Vercel
- Ejemplo: `https://sportpetmatch.vercel.app`
- Si tienes múltiples, sepáralas con coma: `https://app.vercel.app,https://preview.vercel.app`

### Despliegues automáticos
- Cada vez que hagas `git push` al repositorio
- Render automáticamente hará redeploy
- Igual que Vercel ✨

## 💰 Costos

**Render Free Tier:**
- ✅ Gratis para siempre
- ✅ Backend siempre activo (no se duerme)
- ✅ HTTPS automático
- ✅ Dominio gratuito: `tu-app.onrender.com`

## 🐛 Solución de Problemas

### El build falla
- Verifica que el Root Directory sea exactamente: `backend`
- Asegúrate de que `npm run build` funcione localmente

### Error de conexión a la base de datos
- Verifica que la cadena `DATABASE_URL` esté completa
- Asegúrate de que no tenga `psql` al inicio
- Debe empezar con: `postgresql://`

### Error de CORS en el frontend
- Verifica que `CORS_ORIGIN` incluya tu dominio de Vercel exacto
- Incluye `https://` al inicio
- No incluyas `/api` al final, solo el dominio

### El backend no responde
- Espera 1-2 minutos después del primer deploy
- Verifica los logs en Render
- Prueba la URL directamente en el navegador

## ✅ Checklist Final

- [ ] Backend desplegado en Render
- [ ] URL del backend funcionando (`/api` responde)
- [ ] Variable `EXPO_PUBLIC_API_URL` configurada en Vercel
- [ ] Frontend redeployed en Vercel
- [ ] App funcionando correctamente 🎉

## 🎉 ¡Listo!

Ahora tienes:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.onrender.com`
- Todo funcionando juntos ✨


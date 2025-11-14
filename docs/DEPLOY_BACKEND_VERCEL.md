# 🚀 Desplegar Backend en Vercel (Todo en Vercel)

¡Perfecto! Si quieres tener todo en Vercel, aquí está la guía.

## 📋 Pasos

### 1. Crear proyecto del backend en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Conecta tu repositorio de GitHub si no lo has hecho
4. Selecciona: `leonardobergallo/SportPetMatch`

### 2. Configurar el proyecto del backend

**Configuración del proyecto:**
- **Framework Preset**: Otro (Other)
- **Root Directory**: `backend` ⚠️ **MUY IMPORTANTE**
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Variables de Entorno

Haz clic en **"Environment Variables"** y agrega:

**Obligatorias:**
```
DATABASE_URL=postgresql://neondb_owner:npg_JOFZ4IlXL6HY@ep-steep-queen-a8xy4xkr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
```
(Pega tu cadena de Neon completa, SIN `psql` ni comillas)

```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_secreto_jwt_muy_seguro_genera_uno_aleatorio
JWT_REFRESH_SECRET=otro_secreto_refresh_muy_seguro
CORS_ORIGIN=https://tu-frontend.vercel.app
```
(Reemplaza con tu dominio de Vercel del frontend)

### 4. Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras se despliega
3. Una vez terminado, verás una URL tipo: `https://sportpetmatch-backend.vercel.app`

### 5. Conectar Frontend con Backend

1. **Ve a tu proyecto del frontend en Vercel**
2. **Settings** → **Environment Variables**
3. Agrega:
   - **Key**: `EXPO_PUBLIC_API_URL`
   - **Value**: `https://tu-backend.vercel.app/api`
   (Reemplaza con la URL real del backend que acabas de desplegar)
4. Haz redeploy del frontend

## ⚠️ Notas Importantes

### Vercel Serverless
- Vercel usa funciones serverless, no un servidor 24/7
- La primera petición puede tardar un poco (cold start)
- Después las peticiones son rápidas

### Base de datos
- Tu cadena de conexión de Neon funciona perfectamente
- Asegúrate de que sea la cadena completa
- NO debe tener `psql` al inicio

### CORS
- Configura `CORS_ORIGIN` con tu dominio del frontend
- Ejemplo: `https://sportpetmatch.vercel.app`

## 🎉 ¡Listo!

Ahora tienes todo en Vercel:
- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend**: `https://tu-backend.vercel.app`

Todo en un solo lugar ✨


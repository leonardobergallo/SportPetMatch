# 🚀 Inicio Rápido: Desplegar en Vercel

## Pasos Rápidos

### 1. Asegúrate de que el build funciona localmente

```bash
cd frontend
npm install
npm run build
```

Esto debería crear una carpeta `dist` con los archivos estáticos.

### 2. Sube tu código a GitHub/GitLab/Bitbucket

Si aún no lo has hecho, crea un repositorio y sube tu código.

### 3. Despliega en Vercel

**Opción más fácil - Desde el navegador:**

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en "Add New Project"
3. Importa tu repositorio de Git
4. Configura el proyecto:
   - **Root Directory**: Deja en blanco
   - **Framework Preset**: Otro (Other)  
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd frontend && npm install`
5. Agrega Variable de Entorno:
   - `EXPO_PUBLIC_API_URL` = `https://tu-backend-url.com/api`
   (Reemplaza con la URL real de tu backend desplegado)
6. Haz clic en "Deploy"

### 4. Ver la app en tu celular

Una vez desplegado, recibirás una URL como:
```
https://sportpetmatch-xxxx.vercel.app
```

**Para verla en tu celular:**
1. Abre el navegador en tu celular (Chrome, Safari, etc.)
2. Ve a esa URL
3. ¡La app se verá como una app móvil!

**Para acceso rápido:**
- **Android**: Menú (3 puntos) → "Agregar a pantalla de inicio"
- **iOS**: Botón compartir → "Agregar a pantalla de inicio"

## ⚠️ Importante: Backend

Necesitas tener el backend desplegado en algún servicio:
- **Railway** (recomendado): https://railway.app
- **Render**: https://render.com
- Otro servicio que soporte Node.js

El backend debe estar accesible públicamente con HTTPS.

## 📖 Documentación Completa

Para más detalles, ve a: `docs/DEPLOY_VERCEL.md`


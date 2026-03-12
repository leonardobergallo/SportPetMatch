# ⚡ Publicar en Vercel - Guía Rápida

## 🚀 Pasos Rápidos (5 minutos)

### 1. Verificar Build Local
```bash
cd frontend
npm run build
```

### 2. Subir a Git (si no lo has hecho)
```bash
git add .
git commit -m "Preparar para Vercel"
git push
```

### 3. Desplegar en Vercel

**Opción A: Web (Más fácil)**
1. Ve a [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importa tu repositorio
4. Configuración:
   - **Root Directory**: `frontend`
   - **Framework**: `Other`
   - **Build Command**: `npm install && npm run vercel-build`
   - **Output Directory**: `dist`
5. Variables de Entorno:
   - `EXPO_PUBLIC_API_URL` = `https://tu-backend.com/api`
6. "Deploy"

**Opción B: CLI**
```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

### 4. ¡Listo! 🎉

Tu app estará en: `https://tu-proyecto.vercel.app`

---

## ⚠️ Importante

- **Backend debe estar desplegado** (Railway, Render, etc.)
- **Variable `EXPO_PUBLIC_API_URL`** debe apuntar a tu backend
- **Root Directory** debe ser `frontend`

---

## 📖 Guía Completa

Para más detalles, ve a: `docs/PUBLICAR_VERCEL.md`



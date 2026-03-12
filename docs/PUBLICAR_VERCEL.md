# 🚀 Guía Completa: Publicar SportPetMatch en Vercel

Esta guía describe cómo publicar **backend y frontend juntos** en un solo proyecto de Vercel (monorepo).

---

## 📋 Prerrequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
2. ✅ Proyecto en GitHub, GitLab o Bitbucket
3. ✅ Base de datos PostgreSQL (Neon, Supabase, Railway, etc.)
4. ✅ Node.js instalado localmente

---

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Verificar que el build funciona localmente

Desde la **raíz del proyecto** (no dentro de `frontend`):

```bash
npm run vercel-build
```

Esto ejecuta: build del backend → build del frontend → copia de `api/` y archivos a la raíz. Si termina sin errores, estás listo para desplegar.

### 1.2 Iconos PWA (opcional)

Si faltan iconos PWA:

```bash
cd frontend
npm run generate:pwa-icons
```

---

## 📦 Paso 2: Subir Código a Git

```bash
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

---

## 🌐 Paso 3: Desplegar en Vercel

### Opción A: Desde la interfaz web (recomendado)

#### 3.1 Crear proyecto en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión.
2. **Add New Project** / **New Project**.
3. Conecta el repositorio `SportPetMatch`.

#### 3.2 Configurar el proyecto

Usa **un solo proyecto** para backend + frontend:

- **Framework Preset**: `Other`
- **Root Directory**: **(dejar en blanco – raíz del proyecto)** ⚠️ Importante
- **Build Command**: `npm run vercel-build`
- **Output Directory**: **(dejar en blanco)** – lo define `vercel.json`
- **Install Command**: `npm install`

El `vercel.json` en la raíz ya define rewrites y funciones.

#### 3.3 Variables de entorno

En **Environment Variables** agrega:

**Obligatorias (backend):**

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
JWT_SECRET=tu_secreto_jwt_largo_y_aleatorio
JWT_REFRESH_SECRET=otro_secreto_diferente
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

**Opcional (frontend):**

```
EXPO_PUBLIC_API_URL=/api
```

En producción web la app usa `/api` por defecto; esta variable es opcional.

Generar secretos JWT:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecútalo dos veces para `JWT_SECRET` y `JWT_REFRESH_SECRET`.

#### 3.4 Deploy

1. **Deploy**.
2. Espera 3–7 minutos (build backend + frontend).
3. URL resultante tipo: `https://sport-pet-match-backend-xxxx.vercel.app`

---

### Opción B: Desde la terminal (CLI)

```bash
npm install -g vercel
vercel login
```

En la **raíz del proyecto**:

```bash
vercel
```

Luego en el dashboard agrega las variables de entorno y haz **Redeploy** si hace falta.

---

## ✅ Paso 4: Verificar el deploy

### Backend

- `https://tu-proyecto.vercel.app/api/salud` → debe devolver JSON de salud.

### Frontend

- `https://tu-proyecto.vercel.app` → debe cargar la app.
- Login: por ejemplo `maria.gonzalez@sportpetmatch.com` / `123456`.

### PWA

- DevTools → **Application** → **Manifest** y **Service Workers** correctos.
- En móvil: “Agregar a pantalla de inicio” (Chrome Android o Safari iOS).

---

## 🔄 Paso 5: Actualizaciones

1. `git add .` → `git commit -m "..."` → `git push`
2. Vercel despliega solo si el repo está conectado.
3. O **Redeploy** manual desde el dashboard.

---

## 🐛 Solución de problemas

### Build falla

- Revisar logs en Vercel.
- Probar localmente: `npm run vercel-build` en la raíz.
- Revisar que existan `backend/api/index.js`, `scripts/copiar-api.js` y que el build de backend y frontend termine bien.

### Error 405 en `/api/auth/login`

- CORS y OPTIONS ya están configurados en el backend (`app.options('*', cors(...))`).
- Revisar en Vercel → **Functions** → `api/index.js` que no haya errores de carga (p. ej. `Cannot find module`).
- Confirmar que las variables de entorno estén en el proyecto correcto y que hayas hecho redeploy después de cambiarlas.

### “API URL not found” / no conecta al backend

- En producción web se usa la ruta relativa `/api`; no hace falta `EXPO_PUBLIC_API_URL` para la web.
- Si usas variable, que sea `/api` (ruta relativa) y no una URL de otro dominio salvo que tengas front y backend en dominios distintos.

### Pantalla en blanco

- DevTools → **Console** y **Network**.
- Comprobar que `/api/salud` responda y que no haya bloqueos CORS en las peticiones a `/api/*`.

---

## 📊 Cómo quedó el proyecto

- **Un solo proyecto** en Vercel (monorepo).
- **Raíz**: `vercel.json`, `package.json`, `scripts/copiar-api.js`; tras el build se generan `api/`, `index.html`, assets del frontend, etc.
- **Rewrites**: `/api/(.*)` → `/api/index.js` (backend); el resto → frontend (p. ej. `/index.html`).
- **Variables**: sobre todo `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`; opcional `EXPO_PUBLIC_API_URL=/api`.

Para más detalle del flujo monorepo: `docs/DEPLOY_MONOREPO_VERCEL.md`.  
Para variables listas para copiar: `VARIABLES_VERCEL_LISTAS.md`.

---

## ✅ Checklist

- [ ] Build local OK: `npm run vercel-build` en la raíz
- [ ] Código en Git
- [ ] Proyecto en Vercel con **Root Directory en blanco**
- [ ] Variables de entorno (sobre todo `DATABASE_URL`, JWT, `CORS_ORIGIN`)
- [ ] Deploy exitoso
- [ ] `/api/salud` responde
- [ ] App carga en `/` y login funciona
- [ ] PWA instalable

---

## 🎉 Listo

Una sola URL para todo:

- **App**: `https://tu-proyecto.vercel.app`
- **API**: `https://tu-proyecto.vercel.app/api/*`

Comparte la URL de la app con tus usuarios.

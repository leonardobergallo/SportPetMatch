# 🚀 Guía Completa: Publicar SportPetMatch en Vercel

Esta guía te muestra paso a paso cómo publicar tu app SportPetMatch en Vercel para que esté disponible en internet.

---

## 📋 Prerrequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
2. ✅ Proyecto en GitHub, GitLab o Bitbucket
3. ✅ Backend desplegado (Railway, Render, Vercel, etc.)
4. ✅ Node.js instalado localmente

---

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Verificar que el build funciona localmente

```bash
cd frontend
npm install
npm run build
```

Esto debería crear una carpeta `dist` con los archivos estáticos. El script `postbuild` copiará automáticamente los archivos PWA (manifest.json, sw.js, iconos) desde `web/` a `dist/`. Si funciona, estás listo para desplegar.

### 1.2 Asegúrate de tener los iconos PWA

Si aún no los tienes, genera los iconos:

```bash
cd frontend
npm run generate:pwa-icons
```

---

## 📦 Paso 2: Subir Código a Git

Si aún no has subido tu código:

```bash
# En la raíz del proyecto
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

---

## 🌐 Paso 3: Desplegar en Vercel

### Opción A: Desde la Interfaz Web (Recomendado)

#### 3.1 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"** o **"New Project"**
3. Conecta tu repositorio:
   - Si es la primera vez, conecta tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio `SportPetMatch`

#### 3.2 Configurar el Proyecto

En la configuración del proyecto, usa estos valores:

- **Framework Preset**: `Other` (Otro)
- **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
- **Build Command**: `npm install && npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Nota:** El `vercel.json` ya está configurado en `frontend/`, así que Vercel debería detectarlo automáticamente.

#### 3.3 Configurar Variables de Entorno

Antes de hacer deploy, agrega las variables de entorno:

1. Haz clic en **"Environment Variables"**
2. Agrega las siguientes variables:

**Obligatoria:**
```
EXPO_PUBLIC_API_URL=https://tu-backend-url.com/api
```
(Reemplaza con la URL real de tu backend desplegado)

**Opcionales (si las usas):**
```
GOOGLE_WEB_CLIENT_ID=tu_google_web_client_id
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret
```

3. Selecciona los entornos donde aplicar (Production, Preview, Development)

#### 3.4 Hacer Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras se construye y despliega
3. Una vez terminado, verás una URL tipo: `https://sportpetmatch-xxxx.vercel.app`

---

### Opción B: Desde la Terminal (CLI)

#### 3.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login en Vercel

```bash
vercel login
```

#### 3.3 Desplegar

```bash
cd frontend
vercel
```

Sigue las instrucciones:
- **Set up and deploy?** → `Y`
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → `N` (primera vez) o `Y` (si ya existe)
- **Project name:** → `sportpetmatch` (o el que prefieras)
- **Directory:** → `./dist` (o deja en blanco si está en vercel.json)
- **Override settings?** → `N` (usa el vercel.json existente)

#### 3.4 Agregar Variables de Entorno

```bash
vercel env add EXPO_PUBLIC_API_URL
# Ingresa: https://tu-backend-url.com/api
# Selecciona: Production, Preview, Development
```

#### 3.5 Deploy a Producción

```bash
vercel --prod
```

---

## ✅ Paso 4: Verificar el Deploy

### 4.1 Verificar que la App Funciona

1. Abre la URL de Vercel en tu navegador
2. Deberías ver la app funcionando
3. Abre DevTools (F12) y verifica:
   - **Application → Manifest**: Debe ser válido
   - **Application → Service Workers**: Debe estar activado
   - **Console**: No debe haber errores críticos

### 4.2 Probar en Móvil

1. Abre la URL en tu celular
2. La app debería verse como una app móvil
3. Prueba instalar como PWA:
   - **Android (Chrome):** Menú → "Agregar a pantalla de inicio"
   - **iOS (Safari):** Compartir → "Agregar a pantalla de inicio"

---

## 🔄 Paso 5: Actualizaciones Futuras

Cada vez que hagas cambios:

1. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```

2. **Vercel desplegará automáticamente** (si tienes auto-deploy activado)

3. O despliega manualmente:
   - Desde la web: Ve al proyecto → "Deployments" → "Redeploy"
   - Desde CLI: `vercel --prod`

---

## 🐛 Solución de Problemas

### Error: "Build failed"

**Causa común:** Falta alguna dependencia o el build command está mal.

**Solución:**
1. Verifica que `npm run build` funcione localmente
2. Revisa los logs de build en Vercel
3. Asegúrate de que `vercel-build` esté en `package.json`

### Error: "Cannot find module"

**Causa común:** Dependencias no instaladas correctamente.

**Solución:**
1. Verifica que `package.json` tenga todas las dependencias
2. Ejecuta `npm install` localmente y verifica que no haya errores
3. Asegúrate de que `node_modules` esté en `.gitignore`

### Error: "API URL not found"

**Causa común:** Variable de entorno no configurada.

**Solución:**
1. Ve a Settings → Environment Variables
2. Verifica que `EXPO_PUBLIC_API_URL` esté configurada
3. Haz redeploy después de agregar variables

### La app muestra pantalla en blanco

**Causa común:** Error de JavaScript o problema con rutas.

**Solución:**
1. Abre DevTools → Console y revisa errores
2. Verifica que el backend esté accesible
3. Verifica que las rutas en `vercel.json` estén correctas

### Service Worker no funciona

**Causa común:** Headers incorrectos o ruta mal configurada.

**Solución:**
1. Verifica que `sw.js` esté en `dist/` después del build
2. Verifica los headers en `vercel.json`
3. Limpia el cache del navegador

---

## 📊 Configuración Recomendada

### Dominio Personalizado (Opcional)

1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

### Variables de Entorno por Entorno

Puedes tener diferentes valores según el entorno:
- **Production**: URL del backend de producción
- **Preview**: URL del backend de staging
- **Development**: URL local (para desarrollo)

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Expo en Vercel](https://docs.expo.dev/distribution/publishing-websites/)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Checklist Final

- [ ] Build funciona localmente (`npm run build`)
- [ ] Código subido a Git
- [ ] Proyecto creado en Vercel
- [ ] Root Directory configurado como `frontend`
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] App funciona en la URL de Vercel
- [ ] PWA instalable en móvil
- [ ] Service Worker activado

---

## 🎉 ¡Listo!

Tu app ahora está disponible en internet. Cada vez que hagas push a tu repositorio, Vercel desplegará automáticamente una nueva versión.

**URL de tu app:** `https://tu-proyecto.vercel.app`

¡Comparte la URL con tus usuarios! 🚀


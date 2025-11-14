# Guía de Deployment en Vercel

Esta guía te ayudará a desplegar SportPetMatch en Vercel para poder ver la app en tu celular sin usar Expo Go ni códigos QR.

## 📋 Prerrequisitos

1. Una cuenta en [Vercel](https://vercel.com) (es gratis)
2. Git configurado y el proyecto en GitHub, GitLab o Bitbucket
3. El backend desplegado en algún servicio (Railway, Render, etc.) o usar Vercel Functions

## 🚀 Paso 1: Preparar el proyecto

### 1.1 Asegúrate de que el build funciona localmente

```bash
cd frontend
npm install
npm run build
```

Esto debería crear una carpeta `dist` con los archivos estáticos.

### 1.2 Verificar configuración del backend

Asegúrate de que tu backend esté desplegado y accesible públicamente. Necesitarás la URL del backend para configurar las variables de entorno.

**Opciones para desplegar el backend:**
- **Railway** (recomendado): https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **Heroku**: https://heroku.com

## 📦 Paso 2: Desplegar en Vercel

### Opción A: Desde la Interfaz Web de Vercel (Recomendado)

1. **Ve a [vercel.com](https://vercel.com) y haz login**

2. **Haz clic en "Add New Project"**

3. **Importa tu repositorio de Git**
   - Conecta tu cuenta de GitHub/GitLab/Bitbucket si no lo has hecho
   - Selecciona el repositorio de SportPetMatch

4. **Configura el proyecto:**
   - **Framework Preset**: Otro (Other)
   - **Root Directory**: Deja en blanco o usa `/` (raíz del proyecto)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd frontend && npm install`

5. **Configura las Variables de Entorno:**
   - Haz clic en "Environment Variables"
   - Agrega las siguientes variables:
     ```
     EXPO_PUBLIC_API_URL=https://tu-backend-url.railway.app/api
     ```
     (Reemplaza `https://tu-backend-url.railway.app/api` con la URL real de tu backend)

6. **Haz clic en "Deploy"**

7. **Espera a que termine el deployment** (toma unos minutos)

8. **Una vez terminado, verás una URL** tipo: `https://sportpetmatch-xxxx.vercel.app`

### Opción B: Desde la CLI de Vercel

1. **Instala Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel:**
   ```bash
   vercel login
   ```

3. **En la raíz del proyecto, ejecuta:**
   ```bash
   vercel
   ```

4. **Sigue las instrucciones** y responde las preguntas:
   - Link to existing project? No (la primera vez)
   - Project name: sportpetmatch (o el que prefieras)
   - Directory: `frontend/dist`
   - Override settings? Yes

5. **Agrega las variables de entorno:**
   ```bash
   vercel env add EXPO_PUBLIC_API_URL
   # Ingresa: https://tu-backend-url.railway.app/api
   ```

6. **Redeploy con las nuevas variables:**
   ```bash
   vercel --prod
   ```

## 📱 Paso 3: Ver la app en tu celular

Una vez desplegado, puedes ver la app en tu celular de estas formas:

### Método 1: Desde el navegador del celular (Más fácil)

1. **Abre el navegador en tu celular** (Chrome, Safari, etc.)

2. **Ve a la URL de Vercel** que recibiste, por ejemplo:
   ```
   https://sportpetmatch-xxxx.vercel.app
   ```

3. **La app se abrirá y se verá como una app móvil** adaptada a la pantalla de tu celular

4. **Para acceso rápido**, agrega un icono a la pantalla de inicio:
   - **Android (Chrome):**
     - Menú (3 puntos) → "Agregar a pantalla de inicio"
   - **iOS (Safari):**
     - Botón compartir → "Agregar a pantalla de inicio"

### Método 2: Modo de desarrollo (Opcional)

Si quieres probar cambios locales en tu celular sin desplegar:

1. **Asegúrate de que tu computadora y celular estén en la misma red WiFi**

2. **Encuentra la IP local de tu computadora:**
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` (busca inet)

3. **En el frontend, ejecuta:**
   ```bash
   cd frontend
   npm start
   ```

4. **En tu celular, abre el navegador** y ve a:
   ```
   http://TU_IP_LOCAL:8081
   ```
   (Expo te mostrará la IP correcta cuando inicies)

## 🔧 Configuración Avanzada

### Variables de Entorno en Vercel

Puedes configurar variables de entorno diferentes para desarrollo y producción:

1. **Ve a tu proyecto en Vercel**
2. **Settings → Environment Variables**
3. **Agrega variables:**
   - `EXPO_PUBLIC_API_URL` para Production, Preview, y Development

### Dominio Personalizado

1. **Ve a tu proyecto en Vercel**
2. **Settings → Domains**
3. **Agrega tu dominio personalizado** (opcional, solo si tienes uno)

### Headers y CORS

Si tu backend está en un dominio diferente, asegúrate de configurar CORS correctamente en el backend para permitir requests desde tu dominio de Vercel.

Ejemplo para el backend (si usas Express):
```javascript
app.use(cors({
  origin: [
    'https://tu-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

## 🐛 Solución de Problemas

### La app no se conecta al backend

1. **Verifica que el backend esté funcionando:**
   - Abre la URL del backend en tu navegador
   - Deberías ver una respuesta JSON o una página de bienvenida

2. **Verifica las variables de entorno:**
   - En Vercel, ve a Settings → Environment Variables
   - Asegúrate de que `EXPO_PUBLIC_API_URL` esté configurada correctamente
   - El formato debe ser: `https://tu-backend.com/api` (sin barra al final de `/api`)

3. **Verifica CORS en el backend:**
   - El backend debe permitir requests desde tu dominio de Vercel

### El build falla en Vercel

1. **Verifica los logs de build en Vercel**
2. **Asegúrate de que el comando de build funcione localmente:**
   ```bash
   cd frontend
   npm run build
   ```
3. **Verifica que todas las dependencias estén en `package.json`**

### La app se ve mal en el celular

1. **Verifica que el viewport esté configurado** en `web/index.html`
2. **Limpia la caché del navegador** en tu celular
3. **Prueba en modo incógnito** para evitar problemas de caché

## 📝 Notas Importantes

1. **Backend separado**: El backend debe estar desplegado en un servicio separado. Vercel puede servir el frontend, pero necesitas otro servicio para el backend Node.js.

2. **Variables de entorno**: Las variables que empiezan con `EXPO_PUBLIC_` son las que se exponen al cliente. Nunca pongas secretos ahí.

3. **HTTPS**: Vercel siempre sirve sobre HTTPS, así que asegúrate de que tu backend también soporte HTTPS o configure CORS correctamente.

4. **Build automático**: Cada vez que hagas push a tu repositorio, Vercel automáticamente hará un nuevo deploy (si tienes GitHub/GitLab integrado).

## 🎉 ¡Listo!

Ahora tienes tu app desplegada en Vercel y puedes acceder a ella desde cualquier celular con internet, sin necesidad de Expo Go ni códigos QR.

Para probar cambios:
1. Haz cambios en tu código local
2. Haz commit y push a tu repositorio
3. Vercel automáticamente desplegará la nueva versión (en unos minutos)


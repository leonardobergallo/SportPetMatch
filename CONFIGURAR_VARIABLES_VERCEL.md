# 🔐 Configurar Variables de Entorno en Vercel

## ✅ Sí, Necesitas Configurar Variables de Entorno

Para que tu app funcione en Vercel, necesitas configurar las variables de entorno, especialmente **`DATABASE_URL`** para conectar con la base de datos.

---

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

Si aún no tienes una base de datos, crea una:

### Opción 1: Neon (Recomendado - Gratis)
1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Copia la **Connection String**
   - Ejemplo: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Opción 2: Supabase (Gratis)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la **Connection String**

### Opción 3: Railway (Gratis)
1. Ve a [railway.app](https://railway.app)
2. Crea un proyecto
3. Agrega PostgreSQL
4. Copia la **Connection String**

---

## 🔧 Paso 2: Configurar Variables en Vercel

### 2.1 Ir a Variables de Entorno

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Haz clic en **"Add New"**

### 2.2 Variables Obligatorias

Agrega estas variables **una por una**:

#### 1. DATABASE_URL (MUY IMPORTANTE)
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://user:password@host:5432/database?sslmode=require`
  - (Pega tu Connection String completa aquí)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 2. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 3. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: (Genera uno seguro - ver abajo)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 4. JWT_REFRESH_SECRET
- **Key**: `JWT_REFRESH_SECRET`
- **Value**: (Genera otro secreto diferente)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 5. CORS_ORIGIN
- **Key**: `CORS_ORIGIN`
- **Value**: `https://tu-proyecto.vercel.app`
  - (Actualiza con tu URL real después del primer deploy)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

---

## 🔑 Generar Secretos Seguros

Para generar `JWT_SECRET` y `JWT_REFRESH_SECRET`, puedes usar:

### Opción 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecuta esto **dos veces** para generar dos secretos diferentes.

### Opción 2: Online
- Ve a [randomkeygen.com](https://randomkeygen.com)
- Usa "CodeIgniter Encryption Keys" (64 caracteres)
- Genera dos diferentes

### Opción 3: PowerShell
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

---

## 📋 Lista Completa de Variables

### Backend (Obligatorias):
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
JWT_SECRET=tu_secreto_de_64_caracteres_aqui
JWT_REFRESH_SECRET=otro_secreto_diferente_de_64_caracteres
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

### Backend (Opcionales - si los usas):
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
RESEND_API_KEY=tu_resend_key
MERCADOPAGO_ACCESS_TOKEN=tu_token
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

### Frontend (Opcional - se detecta automáticamente):
```
EXPO_PUBLIC_API_URL=/api
```

---

## ⚠️ IMPORTANTE: No Confundir Variables

**DATABASE_URL** vs **EXPO_PUBLIC_API_URL**:

- ❌ **NO pongas** `DATABASE_URL` en `EXPO_PUBLIC_API_URL`
- ✅ **DATABASE_URL** = Cadena de conexión de PostgreSQL (para el backend)
- ✅ **EXPO_PUBLIC_API_URL** = URL del API (para el frontend) = `/api`

---

## 🔄 Paso 3: Aplicar Migraciones de Base de Datos

Después de configurar `DATABASE_URL`, necesitas crear las tablas:

### Opción A: Desde Vercel (Recomendado)

1. Ve a **Deployments** → Último deployment
2. Haz clic en **"View Function Logs"**
3. Busca errores relacionados con Prisma

### Opción B: Desde Local (Más fácil)

1. Configura `DATABASE_URL` localmente en `backend/config.env`
2. Ejecuta:
   ```bash
   cd backend
   npm run db:push
   ```
3. Esto creará las tablas en tu base de datos

### Opción C: Usar Prisma Studio

```bash
cd backend
npm run db:studio
```

Esto abrirá una interfaz web para ver y editar la base de datos.

---

## ✅ Paso 4: Verificar que Funciona

### 1. Verificar Backend

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/salud
```

Deberías ver:
```json
{
  "mensaje": "¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",
  "baseDatos": "Conectada ✅"
}
```

Si dice "Conectada ✅", la base de datos está funcionando.

### 2. Verificar Login

Intenta hacer login en la app. Si funciona, todo está correcto.

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"

**Causa:** `DATABASE_URL` incorrecta o base de datos no accesible.

**Solución:**
1. Verifica que la Connection String sea correcta
2. Verifica que la base de datos permita conexiones externas
3. Verifica que `sslmode=require` esté en la URL

### Error: "relation does not exist"

**Causa:** Las tablas no se han creado en la base de datos.

**Solución:**
1. Ejecuta `npm run db:push` localmente
2. O ejecuta las migraciones de Prisma

### Error: "Connection timeout"

**Causa:** Firewall o configuración de red.

**Solución:**
1. Verifica que la base de datos permita conexiones desde Vercel
2. Algunos servicios (como Neon) requieren configuración adicional

---

## 📝 Resumen Rápido

1. ✅ Crea base de datos PostgreSQL (Neon, Supabase, Railway)
2. ✅ Copia la Connection String
3. ✅ Ve a Vercel → Settings → Environment Variables
4. ✅ Agrega `DATABASE_URL` con tu Connection String
5. ✅ Agrega `JWT_SECRET` y `JWT_REFRESH_SECRET` (genera secretos)
6. ✅ Agrega `NODE_ENV=production`
7. ✅ Agrega `CORS_ORIGIN` (después del deploy con tu URL)
8. ✅ Haz redeploy
9. ✅ Ejecuta migraciones de base de datos (`npm run db:push`)

---

## 🎉 ¡Listo!

Una vez configuradas las variables y aplicadas las migraciones, tu app debería funcionar completamente en Vercel.



# 🔧 Solución: Error 405 en Vercel

## ❌ Error que estás viendo:

```
/api/auth/login: Failed to load resource: the server responded with a status of 405
```

**405 = Method Not Allowed** - El método HTTP (POST) no está permitido o la ruta no está configurada correctamente.

---

## ✅ Soluciones

### 1. Verificar que el Backend Esté Desplegado Correctamente

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/salud
```

**Si funciona:** Deberías ver un JSON con información del servidor.  
**Si no funciona:** El backend no está desplegado correctamente.

### 2. Verificar las Rutas en el Backend

El backend debe tener las rutas configuradas así:
- `/api/auth/login` (POST)
- `/api/auth/registro` (POST)
- etc.

### 3. Verificar el Build

El error puede ser que el build del backend no se completó correctamente.

**En Vercel:**
1. Ve a **Deployments**
2. Revisa los **logs del build**
3. Verifica que no haya errores en el build del backend

### 4. Redeploy Completo

1. Ve a **Settings** → **Environment Variables**
2. Verifica que todas las variables estén correctas
3. Ve a **Deployments**
4. Haz clic en los **3 puntos** (⋯) → **Redeploy**
5. Espera a que termine completamente

### 5. Verificar que api/dist Existe

El build debe crear:
- `api/index.js` (handler)
- `api/dist/` (código compilado del backend)

Si falta `api/dist/`, el backend no se puede cargar.

---

## 🔍 Debugging

### Ver Logs en Vercel

1. Ve a **Deployments** → Último deployment
2. Haz clic en **"View Function Logs"**
3. Busca errores relacionados con:
   - "Error al cargar la app"
   - "Cannot find module"
   - "dist/index.js"

### Probar Endpoints Manualmente

Usa curl o Postman para probar:

```bash
# GET (debería funcionar)
curl https://tu-proyecto.vercel.app/api/salud

# POST (puede fallar con 405)
curl -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 🐛 Problemas Comunes

### Problema 1: Build del Backend Falla

**Solución:**
- Verifica que `backend/package.json` tenga el script `build`
- Verifica que TypeScript compile correctamente
- Revisa los logs de build en Vercel

### Problema 2: api/dist No Existe

**Solución:**
- El script `copy:api` debe copiar `backend/dist/` → `api/dist/`
- Verifica que el build del backend se complete antes de copiar
- Revisa los logs del script `copy:api`

### Problema 3: Rutas No Coinciden

**Solución:**
- El backend espera rutas con prefijo `/api`
- Vercel enruta `/api/*` a `/api/index.js`
- La app Express debe manejar rutas que empiecen con `/api`

---

## ✅ Verificación Final

Después de hacer los cambios:

1. ✅ Backend responde en `/api/salud` (GET)
2. ✅ Backend acepta POST en `/api/auth/login`
3. ✅ No hay errores en los logs de Vercel
4. ✅ El build se completa sin errores

---

## 📝 Nota Importante

Si después de todos estos pasos sigue fallando, puede ser que:

1. **Vercel necesita un tiempo** para propagar los cambios (espera 2-3 minutos)
2. **El cache del navegador** puede estar causando problemas (limpia el cache)
3. **Las variables de entorno** no se aplicaron correctamente (haz redeploy)

---

## 🚀 Próximos Pasos

1. Espera a que Vercel haga redeploy automático (2-5 minutos)
2. O haz redeploy manual desde Vercel
3. Prueba de nuevo después del deploy

Los cambios ya están en Git y Vercel los desplegará automáticamente.



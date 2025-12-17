# 🔐 Configurar Variables de Entorno en EAS Build

Las variables de entorno son importantes para que tu app funcione correctamente en producción.

## 📋 Variables Necesarias

### Obligatorias
- `EXPO_PUBLIC_API_URL` - URL del backend (ej: `https://tu-backend.vercel.app/api`)

### Opcionales (según funcionalidades)
- `GOOGLE_MAPS_API_KEY` - Para mapas
- `CLOUDINARY_CLOUD_NAME` - Para imágenes
- `CLOUDINARY_API_KEY` - Para imágenes
- `CLOUDINARY_API_SECRET` - Para imágenes
- `MERCADOPAGO_PUBLIC_KEY` - Para pagos

---

## 🔧 Método 1: Archivo .env (Recomendado)

1. Crea o edita `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

2. Las variables con prefijo `EXPO_PUBLIC_` se incluyen automáticamente en el build.

3. **Importante:** No subas `.env` a Git. Asegúrate de que esté en `.gitignore`.

---

## 🔧 Método 2: EAS Secrets (Para Producción)

Si quieres configurar variables directamente en EAS:

```bash
cd frontend

# Configurar una variable
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://tu-backend.vercel.app/api"

# Ver todas las variables
eas secret:list

# Eliminar una variable
eas secret:delete --name EXPO_PUBLIC_API_URL
```

**Ventajas:**
- No se incluyen en el código
- Más seguro para producción
- Fácil de actualizar sin cambiar código

---

## 🔧 Método 3: eas.json con env

Puedes configurar variables específicas por perfil en `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://tu-backend.vercel.app/api"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://tu-backend-staging.vercel.app/api"
      }
    }
  }
}
```

---

## ✅ Verificar Variables en el Build

Después de crear un build, puedes verificar que las variables estén incluidas:

1. Descarga el build
2. Instala la app
3. Revisa los logs de la app
4. Deberías ver la URL del API en los logs

O agrega esto temporalmente en tu código para debug:

```typescript
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
```

---

## 🚨 Problemas Comunes

### La app no se conecta al backend

**Causa:** `EXPO_PUBLIC_API_URL` no está configurada o es incorrecta.

**Solución:**
1. Verifica que la variable esté en `frontend/.env`
2. Asegúrate de que la URL termine en `/api`
3. Verifica que el backend esté funcionando: `curl https://tu-backend.vercel.app/api/salud`

### Variables no se incluyen en el build

**Causa:** El prefijo `EXPO_PUBLIC_` está mal escrito o falta.

**Solución:**
- Las variables deben empezar con `EXPO_PUBLIC_`
- Ejemplo: `EXPO_PUBLIC_API_URL` ✅
- Ejemplo: `API_URL` ❌ (no se incluirá)

### Variables diferentes en desarrollo y producción

**Solución:** Usa diferentes archivos `.env`:
- `frontend/.env` - Desarrollo
- `frontend/.env.production` - Producción (no se usa automáticamente, cópialo a `.env` antes del build)

O usa EAS Secrets para producción.

---

## 📚 Más Información

- [Documentación de Expo sobre Variables de Entorno](https://docs.expo.dev/guides/environment-variables/)
- [Documentación de EAS Secrets](https://docs.expo.dev/build-reference/variables/)


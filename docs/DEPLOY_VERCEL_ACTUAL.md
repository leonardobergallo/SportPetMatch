# DEPLOY VERCEL -SPORTPETMATCH

## URLs Deployadas
- Frontend: https://sport-pet-match-web.vercel.app
- Backend: https://sport-pet-match-backend2.vercel.app

## PROBLEMA: "Sin API en este sitio"

### Solución 1: Agregar meta tag al HTML

En el frontend, agregar en el HTML:
```html
<meta name="indio-api-base" content="https://sport-pet-match-backend2.vercel.app/api">
```

### Solución 2: Variables de entorno

**Frontend (Vercel) - Settings → Environment Variables:**
- `EXPO_PUBLIC_API_URL` = https://sport-pet-match-backend2.vercel.app/api

**Backend (Vercel) - Settings → Environment Variables:**
- `DATABASE_URL` = tu connection string de Neon/Postgres
- `JWT_SECRET` = generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CORS_ORIGIN` = *

### Después de agregar variables:
- Hacer REDEPLOY en ambos proyectos

## Testing
1. Backend: https://sport-pet-match-backend2.vercel.app/api/salud
2. Frontend: https://sport-pet-match-web.vercel.app

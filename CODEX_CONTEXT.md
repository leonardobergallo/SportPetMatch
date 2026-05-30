# SportPetMatch / Indio: Contexto Rapido

Este archivo resume el contexto operativo del repo para retomar trabajo rapido sin releer todo.

## Estado actual

- Rama principal de trabajo: `main`
- Remote que se usa para publicar: `marketsantafe`
- Proyecto Vercel del frontend principal: `sport-pet-match3`
- Backend publico separado activo: `https://sport-pet-match-backend2.vercel.app`
- API publica activa: `https://sport-pet-match-backend2.vercel.app/api`

## Situacion de deploy

- El proyecto `sport-pet-match3` compila y deploya bien.
- Ese proyecto esta protegido por `Vercel Authentication`, por eso `GET /` y `GET /api/*` pueden devolver `401` si se consulta desde afuera.
- Para evitar ese bloqueo, la web se volvio a cablear para usar el backend publico separado.

## Como esta resuelto hoy

- La landing web usa `meta name="indio-api-base"` apuntando a:
  - `https://sport-pet-match-backend2.vercel.app/api`
- La app web React tambien respeta:
  1. `EXPO_PUBLIC_API_URL`
  2. `meta[name="indio-api-base"]`
  3. `/api` como fallback

## Archivos clave

- Frontend web config: [frontend/src/utilidades/config.ts](./frontend/src/utilidades/config.ts)
- Landing web: [frontend/web/multiverse/index.html](./frontend/web/multiverse/index.html)
- HTML base web: [frontend/web/index.html](./frontend/web/index.html)
- Build root para Vercel: [scripts/vercel-build.js](./scripts/vercel-build.js)
- Handler serverless root: [api/index.js](./api/index.js)
- Backend Express principal: [backend/src/index.ts](./backend/src/index.ts)
- Config backend-only Vercel: [backend/vercel.json](./backend/vercel.json)

## Comandos utiles

- Build completo Vercel desde raiz:
  - `npm run vercel-build`
- Build backend:
  - `npm run --prefix backend build`
- Desarrollo local backend:
  - `npm run --prefix backend dev`
- Ver deploys Vercel:
  - `vercel ls sport-pet-match3`

## Cosas a no romper

- No commitear:
  - `.env`
  - `backend/config.env`
- `frontend/public/` tiene archivos generados/copiados; la fuente real vive en `frontend/web/`
- Si Prisma falla en Windows con `EPERM rename`, revisar si quedo algun `node` viejo corriendo

## Ultimos cambios importantes

- `42129f3` Fix monorepo Vercel build and Prisma runtime
- `f61785c` Remove backend self-link dependency
- `d2d8d1b` Point web app to public backend deployment

## Regla practica para retomar rapido

1. Leer este archivo
2. Ver `git status --short --branch`
3. Si el problema es web publica, asumir primero que puede ser proteccion de Vercel
4. Si el problema es login/fetch, verificar antes que nada:
   - `https://sport-pet-match-backend2.vercel.app/api/salud`


# Informe de Deploy — Indio (28/09/2026)

## Arquitectura real de producción

```
GitHub (marketsantafeoficial-a11y/SportPetMatch2, rama main)
   │  push
   ▼
Coolify (VPS Hostinger 69.62.64.252:8000)
   │  build nixpacks → imagen Docker
   ▼
Contenedor: djy0oa0nqb3409yv1j6j14s9-<timestamp>
   │  puerto interno 3016 (Express sirve API + web)
   ▼
Traefik (coolify-proxy) → https://indio.com.ar (vía Cloudflare)
```

- **App en Coolify:** uuid `djy0oa0nqb3409yv1j6j14s9` ("sport-pet-match")
- **Base de datos:** Postgres local en contenedor `uljf9ph3yio5lqpotbqbl9m0`
- **Deploy:** automático al hacer push a `main` (webhook GitHub App `git-hub-leo2`)

## ⚠️ Problema encontrado (y resuelto)

Coolify tenía configurado en **pre-deploy Y post-deploy**:

```
npm run db:seed --prefix backend
```

Ese seed (`backend/prisma/seed.ts`) **borra toda la base** (`deleteMany` de usuarios,
mascotas, eventos, matches...) y la recrea con 13 usuarios de ejemplo.
Resultado: **cada deploy borraba todas las cuentas reales** (testers, registros nuevos).

### Solución aplicada (28/09)

| Comando | Antes | Ahora |
|---------|-------|-------|
| Pre-deploy | `npm run db:seed --prefix backend` | *(vacío)* |
| Post-deploy | `npm run db:seed --prefix backend` | `INDIO_API_URL=http://127.0.0.1:3016/api node scripts/semilla_usuarios_demo.mjs \|\| true` |

- El nuevo post-deploy usa el script **idempotente** `scripts/semilla_usuarios_demo.mjs`:
  - No borra nada.
  - Crea/actualiza 8 usuarios de ejemplo si faltan.
  - No duplica mascotas.
  - Espera a que la API responda y nunca marca el deploy como fallido.

## Usuarios de ejemplo

- Script: `scripts/semilla_usuarios_demo.mjs` (soporta `--dry-run`)
- Emails estilo personal (@gmail.com) + avatar + ubicación en Santa Fe/Paraná.
- Contraseña de las cuentas demo: `IndioComunidad2026!`
- También se actualizó `backend/prisma/seed.ts` para usar los tipos de usuario
  modernos (`dueno` / `familia` / `cuidador`), porque con los valores viejos
  (`con_mascota`, `solo`, `ambos`) los usuarios **no aparecían en Matching**.

## Cómo deployar

```bash
git push  # a marketsantafeoficial-a11y/SportPetMatch2, rama main
# Coolify construye y despliega automáticamente (~13 min)
```

Verificar estado:

```bash
ssh root@69.62.64.252
docker exec coolify-db psql -U coolify -d coolify -c \
  "SELECT deployment_uuid, status, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 3;"
```

## Pendientes / recomendaciones

1. **No volver a poner el seed destructivo** como comando de deploy.
   Para datos de demo usar siempre `scripts/semilla_usuarios_demo.mjs`.
2. Si hace falta resetear la base a propósito (entorno de pruebas), correr el seed
   **manualmente**: `npm run db:seed --prefix backend`.
3. Configurar cuenta de servicio de Google Play para automatizar los envíos del AAB.
4. Backups: verificar que el contenedor Postgres tenga dumps periódicos
   (hay `/root/db-backups` y `/root/backups_sql` en el VPS).

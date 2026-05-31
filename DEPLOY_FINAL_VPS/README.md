# Deploy final VPS

Carpeta para retomar el despliegue final sin Vercel.

## Objetivo

Usar SportPetMatch como proyecto modelo para migrar despues Market Santa Fe y otros proyectos al VPS.

## Documentos

- `SPORTPETMATCH_CONTEXTO_DEPLOY_VPS_2026-05-30.md`: estado puntual de SportPetMatch, cambios hechos y proximo diagnostico.
- `CONTEXTO_VPS_MULTI_PROYECTO_2026-05-30.md`: contexto reutilizable para Market Santa Fe y otros proyectos.
- `MARKETSANTAFE_DOMINIO_CLOUDFLARE_NIC_RUNBOOK.md`: pasos para configurar dominio de Market Santa Fe con Cloudflare, NIC Argentina y Coolify/VPS.
- `COMO_DEPLOYAR_CAMBIOS_INDIO_COOLIFY.md`: flujo para editar Indio, pushear a GitHub y redeployar en Coolify.

## Estado actual corto

- SportPetMatch ya tiene scripts para VPS:
  - `npm run vps-build`
  - `npm run vps-start`
- Coolify debe correr la imagen Docker del repo raiz, no el backend solo.
- El build VPS local ya fue validado correctamente.
- El servidor VPS local ya fue probado:
  - `GET /api/salud` respondio `200`
  - `GET /` respondio `200`
- Deploy VPS final probado desde el servidor:
  - `GET /` respondio `200` con `text/html`
  - `GET /app.html` respondio `200` con `text/html`
  - `GET /api/salud` respondio `200`
  - `POST /api/auth/login` con usuario de prueba respondio `200`
  - `meta[name="indio-api-base"]` quedo en `/api`
  - Imagen Docker activa esperada: `djy0oa0nqb3409yv1j6j14s9:6258122`

## Dominio indio.com.ar

En NIC Argentina, "Delegaciones" son servidores DNS, no la IP del VPS.

Opcion simple si el dominio sigue delegado a Vercel:

1. Dejar `ns1.vercel-dns.com` y `ns2.vercel-dns.com` en NIC.
2. Entrar al DNS del dominio en Vercel.
3. Crear/modificar:
   - `A` para `@` apuntando a `69.62.64.252`
   - `A` para `www` apuntando a `69.62.64.252`, o `CNAME www -> indio.com.ar`
4. En Coolify agregar los dominios de SportPetMatch:
   - `http://indio.com.ar`
   - `http://www.indio.com.ar`

Opcion recomendada para salir de Vercel tambien como DNS:

1. Agregar `indio.com.ar` en Cloudflare.
2. Copiar los 2 nameservers que Cloudflare entregue.
3. En NIC, reemplazar `ns1.vercel-dns.com` y `ns2.vercel-dns.com` por esos 2 nameservers.
4. En Cloudflare DNS crear:
   - `A @ -> 69.62.64.252`
   - `A www -> 69.62.64.252`
5. En Coolify agregar `http://indio.com.ar` y `http://www.indio.com.ar`.

`cloudflared` no hace falta para este caso base. Sirve para tuneles, pero si el VPS tiene IP publica y Coolify/Traefik escucha en 80/443, DNS directo es mas simple.

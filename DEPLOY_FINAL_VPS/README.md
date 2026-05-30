# Deploy final VPS

Carpeta para retomar el despliegue final sin Vercel.

## Objetivo

Usar SportPetMatch como proyecto modelo para migrar despues Market Santa Fe y otros proyectos al VPS.

## Documentos

- `SPORTPETMATCH_CONTEXTO_DEPLOY_VPS_2026-05-30.md`: estado puntual de SportPetMatch, cambios hechos y proximo diagnostico.
- `CONTEXTO_VPS_MULTI_PROYECTO_2026-05-30.md`: contexto reutilizable para Market Santa Fe y otros proyectos.

## Estado actual corto

- SportPetMatch ya tiene scripts para VPS:
  - `npm run vps-build`
  - `npm run vps-start`
- Coolify/Nixpacks queda preparado con `nixpacks.toml`.
- El build VPS local ya fue validado correctamente.
- El servidor VPS local ya fue probado:
  - `GET /api/salud` respondio `200`
  - `GET /` respondio `200`
- El VPS `69.62.64.252` no respondia en `22`, `80` ni `8000` al momento de la verificacion.

## Cuando el VPS vuelva

1. Entrar a Coolify o SSH.
2. Confirmar que el proyecto SportPetMatch use el repo/branch correcto.
3. Configurar variables de entorno.
4. Deployar con Nixpacks.
5. Probar `http://sportpetmatch.69.62.64.252.sslip.io`.
6. Usar este mismo patron para Market Santa Fe.

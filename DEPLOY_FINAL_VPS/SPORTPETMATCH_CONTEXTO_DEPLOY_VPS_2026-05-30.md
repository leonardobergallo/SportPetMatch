# SportPetMatch - Contexto deploy VPS - 2026-05-30

Este documento resume el estado real del deploy VPS para retomar rapido sin volver a rastrear carpetas.

## Fuente de verdad

- Repo local de trabajo: `C:\Users\leona\Desktop\Proyectos\APPS\SportPetMatch`
- Documentacion VPS encontrada: `C:\Users\leona\Desktop\Proyectos\PRUEBAS\App de Citas con deporte y mascotas\VPS_DEPLOY_DOCS`
- Runbook raiz con datos sensibles: `C:\Users\leona\Desktop\Proyectos\PRUEBAS\App de Citas con deporte y mascotas\[2026-05-30]_RUNBOOK_VPS_DEPLOY_SIN_VERCEL.md`
- No usar Vercel para este flujo.

## Flujo correcto

Produccion debe ir por VPS + Coolify/PM2/PostgreSQL local.

URL esperada:

```text
http://sportpetmatch.69.62.64.252.sslip.io
```

Coolify esperado:

```text
http://69.62.64.252:8000/
```

## Estado confirmado en esta sesion

- `git status` del repo SportPetMatch esta limpio.
- Build local de Vercel/Expo/backend corrio completo y termino OK, pero ese no es el flujo de produccion deseado.
- `main` local esta en commit `2962ee4` (`Simplify install instructions and add donation support`).
- `marketsantafe/main` tambien esta en `2962ee4`.
- `origin/main` esta 38 commits atras.
- Intento de `git push origin main` fallo con 403 porque la credencial activa de GitHub es `marketsantafeoficial-a11y` y `origin` apunta a `leonardobergallo/SportPetMatch.git`.
- El dominio del VPS no responde desde esta maquina:
  - `http://sportpetmatch.69.62.64.252.sslip.io`
  - `http://69.62.64.252:8000/`
  - `http://status.69.62.64.252.sslip.io/`
- Puertos probados sin respuesta: `22`, `80`, `443`, `8000`.

## Interpretacion

Los cambios de SportPetMatch si estan subidos al remote `marketsantafe`, pero no a `origin`.

Si Coolify esta conectado a `marketsantafeoficial-a11y/SportPetMatch2`, el codigo ya esta en el commit correcto. Si Coolify esta conectado a `origin`, no puede ver los ultimos 38 commits hasta resolver permisos o cambiar el remote configurado.

El bloqueo principal actual no parece ser el codigo: el VPS completo no responde en SSH ni en HTTP/Coolify. Puede estar apagado, con firewall bloqueando, con red/proveedor caido, o con reglas de acceso que impiden entrar desde esta maquina.

## Proximo diagnostico cuando el VPS responda

Entrar al VPS y ejecutar:

```bash
cd /root/projects/sportpetmatch
git status --short --branch
git rev-parse --short HEAD
git remote -v
pm2 list
pm2 logs sportpetmatch --lines 50 --nostream
nginx -t
systemctl status nginx --no-pager
ss -tulpn
```

Luego, si el repo del VPS esta atras:

```bash
git pull origin main
npm install
npm run build
pm2 restart sportpetmatch
pm2 save
nginx -t && systemctl reload nginx
```

## Preparacion agregada al repo para VPS

SportPetMatch ahora queda como proyecto ejemplo para deploy sin Vercel:

- `nixpacks.toml`: Coolify/Nixpacks usa `npm run vps-build` y `npm run vps-start`.
- `.dockerignore`: excluye dependencias, builds, caches y secretos.
- `scripts/vps-build.js`: build productivo backend + frontend y copia frontend a `public/`.
- `scripts/vps-server.js`: servidor unico para produccion:
  - `/api/*` responde con el backend Express compilado.
  - el resto sirve la web estatica desde `public/`.
- `backend/src/index.ts`: el 404 del backend queda limitado a `/api/*` para no interceptar rutas web.

Comandos locales/de VPS:

```bash
npm run vps-build
npm run vps-start
```

Validacion local realizada:

```text
npm run vps-build: OK
npm run vps-start: OK
GET http://127.0.0.1:3000/api/salud: 200
GET http://127.0.0.1:3000/: 200
```

En Coolify:

```text
Build Pack: Nixpacks
Port: 3000
Start command: npm run vps-start
```

## Pendiente critico del runbook

La guia ya anotaba este pendiente:

```text
Resolver proxy: nginx del VPS puede bloquear puerto 80; si aplica, parar nginx para que Traefik (Coolify) tome el flujo publico.
```

Primero hay que recuperar acceso al VPS/Coolify. Despues se decide si manda Nginx o Traefik/Coolify en el puerto 80.

## Carpetas de documentacion VPS

- `VPS_DEPLOY_DOCS\runbooks`: procedimientos cortos de deploy.
- `VPS_DEPLOY_DOCS\guias`: guia pgAdmin/PostgreSQL y notas largas.
- `VPS_DEPLOY_DOCS\infra`: estructura esperada de infraestructura.
- `VPS_DEPLOY_DOCS\seguridad`: placeholders/recordatorios de secretos.

## Seguridad

No copiar secretos a este repo. El archivo con credenciales reales queda fuera del repo de SportPetMatch y debe mantenerse local.

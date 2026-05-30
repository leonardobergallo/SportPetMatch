# Contexto VPS multi-proyecto - 2026-05-30

Documento base para retomar migraciones al VPS: SportPetMatch, Market Santa Fe y otros proyectos.

## Objetivo

Centralizar produccion en el VPS y dejar de depender de Vercel para estos proyectos.

Stack operativo esperado:

- VPS Hostinger Ubuntu
- Coolify para deploys desde GitHub
- Docker/Traefik cuando el deploy lo maneje Coolify
- PM2/Nginx cuando el deploy sea manual
- PostgreSQL local en VPS para reemplazar bases externas cuando corresponda

## VPS

- IP: `69.62.64.252`
- Dominio temporal base: `*.69.62.64.252.sslip.io`
- Coolify esperado: `http://69.62.64.252:8000/`
- Credenciales reales: guardadas fuera de este repo, en la carpeta local de documentacion VPS. No copiarlas aca.

## Carpeta local de documentacion

Ruta encontrada:

```text
C:\Users\leona\Desktop\Proyectos\PRUEBAS\App de Citas con deporte y mascotas\VPS_DEPLOY_DOCS
```

Estructura:

- `runbooks`: pasos cortos de deploy y operacion.
- `guias`: guias largas, pgAdmin, PostgreSQL y notas historicas.
- `infra`: infraestructura, dominios, rutas y servicios.
- `seguridad`: placeholders y recordatorios de secretos.

Ademas hay un runbook raiz fuera de `VPS_DEPLOY_DOCS` con datos sensibles:

```text
C:\Users\leona\Desktop\Proyectos\PRUEBAS\App de Citas con deporte y mascotas\[2026-05-30]_RUNBOOK_VPS_DEPLOY_SIN_VERCEL.md
```

## Servicios y dominios previstos

- SportPetMatch: `http://sportpetmatch.69.62.64.252.sslip.io`
- Market Santa Fe: `http://marketsantafe.69.62.64.252.sslip.io`
- IT360: `http://it360-soluciones.69.62.64.252.sslip.io`
- CRM Inmobiliaria: `http://crminmobiliaria.69.62.64.252.sslip.io`
- Gastos Personales: `http://gastospersonales.69.62.64.252.sslip.io`
- FileBrowser: `http://files.69.62.64.252.sslip.io`
- Uptime Kuma: `http://status.69.62.64.252.sslip.io`
- pgAdmin: `http://db.69.62.64.252.sslip.io`

## Estado confirmado el 2026-05-30

Desde esta maquina, el VPS no responde en:

- SSH `22`
- HTTP `80`
- HTTPS `443`
- Coolify `8000`

Tambien fallaron:

- `http://sportpetmatch.69.62.64.252.sslip.io`
- `http://69.62.64.252:8000/`
- `http://status.69.62.64.252.sslip.io/`

Interpretacion: antes de migrar Market Santa Fe u otros proyectos hay que recuperar acceso al VPS o revisar estado/firewall desde Hostinger.

## Estado SportPetMatch

- Repo local: `C:\Users\leona\Desktop\Proyectos\APPS\SportPetMatch`
- Branch: `main`
- Commit local actual: `2962ee4`
- `marketsantafe/main` esta en el mismo commit.
- `origin/main` quedo 38 commits atras.
- `git push origin main` fallo por permisos: la credencial activa no tiene permiso sobre `leonardobergallo/SportPetMatch.git`.
- Build local completo: OK.
- Produccion VPS: no verificable porque el VPS no responde.

Decision para Coolify:

- Si Coolify usa `marketsantafeoficial-a11y/SportPetMatch2`, ya tiene el commit correcto.
- Si Coolify usa `leonardobergallo/SportPetMatch`, hay que resolver permisos o cambiar el source del proyecto.

## Checklist para migrar cada proyecto

1. Confirmar repo correcto en GitHub.
2. Confirmar branch de produccion.
3. Confirmar puerto interno de la app.
4. Confirmar comando de build.
5. Confirmar comando de start.
6. Crear o validar base PostgreSQL local si aplica.
7. Cargar variables en Coolify o `.env` del VPS.
8. Deploy con Coolify o PM2.
9. Probar dominio `sslip.io`.
10. Probar endpoint de salud/API.
11. Probar login y flujo principal.
12. Documentar commit desplegado.

## Patron recomendado a partir de SportPetMatch

SportPetMatch queda preparado como proyecto ejemplo para VPS/Coolify sin Vercel.

Archivos/piezas modelo:

- `nixpacks.toml`: define install, build y start para Coolify.
- `.dockerignore`: evita subir caches, dependencias locales, builds y secretos al build Docker.
- `scripts/vps-build.js`: instala backend/frontend, compila backend, exporta frontend y deja `public/` listo.
- `scripts/vps-server.js`: levanta un unico proceso Node que sirve:
  - `/api/*` desde Express backend compilado.
  - frontend estatico desde `public/`.
  - fallback SPA/landing con `index.html`.
- `package.json`:
  - `npm run vps-build`
  - `npm run vps-start`

Validacion hecha en SportPetMatch:

```text
Build VPS completo: OK
Servidor local VPS: OK
/api/salud: 200
/: 200
```

Configuracion Coolify esperada:

```text
Build Pack: Nixpacks
Branch: main
Port: 3000
Build command: tomado de nixpacks.toml
Start command: tomado de nixpacks.toml
```

Variables minimas por proyecto:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://proyecto.69.62.64.252.sslip.io
```

Para Market Santa Fe, replicar primero este patron y ajustar:

- nombre del proceso/app
- puerto si no usa `3000`
- script de build real
- carpeta de salida frontend
- ruta/API backend
- variables de entorno propias

## Comandos base cuando vuelva el acceso SSH

```bash
hostname
docker ps
pm2 list
ss -tulpn
df -h
free -m
systemctl status nginx --no-pager
nginx -t
```

Para SportPetMatch:

```bash
cd /root/projects/sportpetmatch
git status --short --branch
git rev-parse --short HEAD
git remote -v
pm2 logs sportpetmatch --lines 50 --nostream
```

Para Market Santa Fe, validar primero la carpeta real en `/root/projects` y repetir el mismo patron.

## Pendiente tecnico principal

La guia larga ya dejaba anotado:

```text
Resolver proxy: nginx del VPS puede bloquear puerto 80; si aplica, parar nginx para que Traefik (Coolify) tome el flujo publico.
```

Ese pendiente sigue siendo clave, pero ahora el primer bloqueo es mas bajo: el servidor no acepta conexiones desde aca.

## Regla de seguridad

No copiar passwords, tokens ni cadenas de conexion reales a repositorios. Mantenerlos solo en los archivos locales de secretos y en Coolify/entorno del VPS.

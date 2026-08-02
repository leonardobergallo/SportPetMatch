# Informe limpieza VPS Hostinger - 2026-06-01

## Estado inicial

- Disco VPS: 96 GB
- Usado: 72 GB
- Libre: 25 GB
- Uso: 75%

El problema principal detectado no eran los correos. Los volumenes de Mailcow ocupaban poco comparado con proyectos antiguos, caches de Node/NPM y builds.

## Mantener

- SportPetMatch
- Market Santa Fe
- Coolify
- Mailcow/correos
- Base de datos de SportPetMatch
- Volumenes de correo

## Limpieza segura sugerida

- `/root/.npm`: cache NPM, regenerable.
- `/root/.cache`: cache de herramientas, regenerable.
- `/root/.pm2/logs/*.log`: logs antiguos de PM2.
- Moodle apagado y sin uso:
  - contenedor `moodle-tsmmybk9xxdz33qzj0mwgib4`
  - contenedor/base `postgresql-tsmmybk9xxdz33qzj0mwgib4`
  - volumenes `tsmmybk9xxdz33qzj0mwgib4_moodle-*`

## Proyectos solicitados para eliminar ahora

- `/var/www/todogomasantafe`
- `/var/www/whatsappSystem`
- `/var/www/ImportaPro`

## No tocar en esta limpieza

- `/var/www/SportPetMatch`
- `/var/www/marketsantafe`
- `/opt/mailcow-dockerized`
- volumenes `mailcowdockerized_*`
- volumen `postgres-data-uljf9ph3yio5lqpotbqbl9m0`
- volumenes `coolify-*`

## Resultado

Limpieza ejecutada.

Estado final medido:

- Disco usado despues: 65 GB
- Libre despues: 31 GB
- Uso despues: 68%

Espacio liberado aproximado:

- Antes: 72 GB usados / 25 GB libres
- Despues: 65 GB usados / 31 GB libres
- Liberado: aprox. 6-7 GB

Eliminado o limpiado:

- `/root/.npm`
- `/root/.cache`
- logs de `/root/.pm2/logs`
- `/var/www/todogomasantafe`
- `/var/www/whatsappSystem`
- `/var/www/ImportaPro`
- contenedores Moodle apagados
- volumenes Moodle `tsmmybk9xxdz33qzj0mwgib4_moodle-*`

Verificacion posterior:

- SportPetMatch responde correctamente.
- Coolify responde correctamente.
- No se tocaron carpetas de SportPetMatch, Market Santa Fe ni volumenes de Mailcow/correos.

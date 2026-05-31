# Market Santa Fe - Runbook dominio Cloudflare + NIC + VPS

Guia para migrar el dominio de Market Santa Fe a Cloudflare y apuntarlo al VPS.

## Objetivo

Dejar el dominio publico de Market Santa Fe usando:

- Cloudflare como DNS.
- NIC Argentina como registrador/delegacion.
- VPS Hostinger como servidor origen.
- Coolify como panel de deploy/ruteo.

## Datos base

Completar antes de empezar:

```text
Dominio real Market Santa Fe: PENDIENTE
VPS IP: 69.62.64.252
URL temporal esperada: http://marketsantafe.69.62.64.252.sslip.io
Panel Coolify: http://69.62.64.252:8000/
Cloudflare account: marketsantafeoficial@gmail.com
```

Referencia de SportPetMatch ya hecha:

```text
Dominio: indio.com.ar
Cloudflare nameservers asignados:
- barbara.ns.cloudflare.com
- cash.ns.cloudflare.com
Registros:
- A @ -> 69.62.64.252
- A www -> 69.62.64.252
```

Nota: cada dominio puede recibir nameservers distintos en Cloudflare. No asumir que Market Santa Fe usara los mismos que `indio.com.ar`; copiarlos desde la pantalla del dominio nuevo.

## Paso 1 - Confirmar que el VPS responde

Antes de tocar DNS, probar:

```powershell
Test-NetConnection 69.62.64.252 -Port 80
Test-NetConnection 69.62.64.252 -Port 443
Test-NetConnection 69.62.64.252 -Port 8000
```

Probar tambien:

```text
http://69.62.64.252:8000/
http://marketsantafe.69.62.64.252.sslip.io
```

Si Coolify o el dominio temporal no responden, resolver primero VPS/Coolify antes de cambiar delegaciones.

## Paso 2 - Agregar dominio en Cloudflare

1. Entrar a Cloudflare.
2. Ir a `Domains` -> `Add domain`.
3. Cargar el dominio real de Market Santa Fe.
4. Elegir plan `Free`.
5. Revisar si Cloudflare importa registros viejos.
6. Continuar hasta la pantalla que muestra los nameservers asignados.
7. Copiar los 2 nameservers exactos.

Guardar aca:

```text
Nameserver 1: PENDIENTE
Nameserver 2: PENDIENTE
```

## Paso 3 - Crear registros DNS en Cloudflare

En `DNS` -> `Records`, crear como minimo:

```text
Tipo: A
Nombre: @
Contenido: 69.62.64.252
Proxy: DNS only al principio
TTL: Auto
```

```text
Tipo: A
Nombre: www
Contenido: 69.62.64.252
Proxy: DNS only al principio
TTL: Auto
```

Usar `DNS only` inicialmente para que Coolify/Traefik pueda validar el origen y emitir certificados sin interferencia. Cuando el sitio ya este estable con HTTPS, evaluar activar proxy de Cloudflare.

## Paso 4 - Cambiar delegacion en NIC Argentina

En NIC, "Delegaciones" son servidores DNS, no la IP del VPS.

1. Entrar a NIC Argentina con CUIT/CUIL y Clave Fiscal.
2. Buscar el dominio real de Market Santa Fe.
3. Ir a `Delegaciones`.
4. Reemplazar los nameservers actuales por los 2 de Cloudflare.
5. Dejar `IPv4` e `IPv6` vacios para delegaciones normales.
6. Guardar cada fila.

Si no permite editar:

1. Borrar las delegaciones actuales.
2. Usar `Agregar una nueva delegacion`.
3. Cargar los 2 hosts de Cloudflare.
4. Guardar.

## Paso 5 - Verificar propagacion

En Cloudflare:

1. Entrar al dominio.
2. Click en `Check nameservers now`.
3. Esperar. Puede tardar de 1 a 24 horas.

Desde terminal:

```powershell
nslookup -type=NS DOMINIO_REAL 1.1.1.1
nslookup -type=NS DOMINIO_REAL 8.8.8.8
nslookup DOMINIO_REAL 1.1.1.1
nslookup www.DOMINIO_REAL 1.1.1.1
```

Esperado:

```text
NS -> los 2 nameservers de Cloudflare
A  -> 69.62.64.252
```

## Paso 6 - Configurar dominio en Coolify

Cuando Cloudflare ya resuelva:

1. Entrar a Coolify: `http://69.62.64.252:8000/`.
2. Abrir el recurso/proyecto de Market Santa Fe.
3. Agregar dominios:

```text
http://DOMINIO_REAL
http://www.DOMINIO_REAL
```

4. Confirmar puerto interno de la app.
5. Redeploy si Coolify lo pide.
6. Verificar logs y estado de Traefik.

Si Coolify esta usando HTTPS automatico, despues de la primera validacion deberia quedar disponible:

```text
https://DOMINIO_REAL
https://www.DOMINIO_REAL
```

## Paso 7 - Pruebas finales

Probar:

```text
http://DOMINIO_REAL
http://www.DOMINIO_REAL
https://DOMINIO_REAL
https://www.DOMINIO_REAL
```

Si la app tiene API:

```text
https://DOMINIO_REAL/api/salud
```

Checklist:

- El dominio raiz carga la app correcta.
- `www` carga o redirige correctamente.
- No queda apuntando a Vercel.
- Cloudflare muestra el dominio como activo.
- Coolify muestra deploy saludable.
- Los logs no muestran errores de host, CORS o certificado.

## Problemas comunes

### Cloudflare sigue en pending

Esperar y volver a tocar `Check nameservers now`. Revisar en NIC que los hosts esten escritos exactos y sin IP.

### DNS resuelve a IP vieja

Puede ser cache. Probar con `1.1.1.1`, `8.8.8.8` y despues esperar TTL.

### El dominio apunta al VPS pero no carga la app

Revisar en Coolify que el dominio este agregado al recurso correcto y que el puerto interno sea el correcto.

### Error HTTPS

Dejar Cloudflare en `DNS only`, esperar que Coolify/Traefik emita certificado, y despues probar de nuevo.

### La app carga pero la API falla

Revisar variables:

```text
CORS_ORIGIN=https://DOMINIO_REAL
PUBLIC_API_URL o equivalente segun proyecto
```

## Cierre esperado

Documentar el resultado:

```text
Fecha:
Dominio:
Nameservers Cloudflare:
Registros DNS:
Proyecto Coolify:
Commit desplegado:
Resultado pruebas:
Pendientes:
```

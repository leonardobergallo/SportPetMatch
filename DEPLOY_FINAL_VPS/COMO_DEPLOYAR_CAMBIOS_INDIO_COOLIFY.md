# Como deployar un cambio de Indio a indio.com.ar

Guia corta para repetir el flujo: editar en Visual Studio Code, subir a GitHub y desplegar en Coolify/VPS.

## Caso de prueba

Ejemplo de cambio pedido:

- Cambiar links viejos de Vercel:

```text
sport-pet-match3.vercel.app
```

por:

```text
indio.com.ar
```

- Revisar la seccion de donacion y decidir que datos mostrar.

Archivo donde esta ese texto:

```text
frontend/web/multiverse/index.html
```

Bloques a buscar:

```text
iPhone (Safari)
Android
DONACION
CBU
Cuenta
Titular
CUIT
```

## Paso 1 - Editar en Visual Studio Code

Abrir el proyecto:

```text
C:\Users\leona\Desktop\Proyectos\APPS\SportPetMatch
```

Archivo principal para la landing de Indio:

```text
frontend/web/multiverse/index.html
```

Para el link de instalacion, dejar algo asi:

```html
<li>Abrí este link con <strong>Safari</strong>: <a href="https://indio.com.ar/" target="_blank" rel="noopener noreferrer">indio.com.ar</a></li>
```

Y en Android:

```html
<li>Abrí este link con <strong>Chrome</strong>: <a href="https://indio.com.ar/" target="_blank" rel="noopener noreferrer">indio.com.ar</a></li>
```

Para donaciones, si queres mostrar solamente alias y titular, dejar la lista parecida a:

```html
<li>&#10003; Alias: <strong>IT360.SOLUCIONES</strong></li>
<li>&#10003; Banco Santander</li>
<li>&#10003; Titular: ANIBAL LEONARDO BERGALLO</li>
```

Si queres mostrar todos los datos, mantener tambien:

```html
<li>&#10003; CBU: 0720156788000001781072</li>
<li>&#10003; Cuenta: CAJA DE AHORRO EN PESOS 156-017810/7</li>
<li>&#10003; CUIT: 23-27487833-9</li>
```

## Paso 2 - Probar localmente

Desde PowerShell, dentro del proyecto:

```powershell
cd C:\Users\leona\Desktop\Proyectos\APPS\SportPetMatch
npm run vps-build
npm run vps-start
```

Abrir:

```text
http://127.0.0.1:3000/
```

Verificar:

- La pagina carga.
- El link dice `indio.com.ar`.
- No queda texto viejo de Vercel.
- La seccion de donacion muestra solo los datos que queres publicar.

Para cortar el servidor local:

```text
Ctrl + C
```

## Paso 3 - Revisar cambios con Git

```powershell
git status --short
git diff
```

Confirmar que aparecen solamente los archivos que quisiste modificar.

## Paso 4 - Commit

```powershell
git add frontend/web/multiverse/index.html
git commit -m "Update Indio public links"
```

Si tambien modificaste documentacion:

```powershell
git add DEPLOY_FINAL_VPS/COMO_DEPLOYAR_CAMBIOS_INDIO_COOLIFY.md
git commit -m "Document Indio Coolify deploy flow"
```

## Paso 5 - Push al repo que usa Coolify

En esta maquina hay dos remotos:

```text
marketsantafe -> https://github.com/marketsantafeoficial-a11y/SportPetMatch2
origin        -> https://github.com/leonardobergallo/SportPetMatch.git
```

Para este deploy, usar `marketsantafe`:

```powershell
git push marketsantafe main
```

Si empuja a `origin`, puede fallar por permisos o no actualizar el repo que esta conectado a Coolify.

## Paso 6 - Deploy en Coolify

Abrir:

```text
http://69.62.64.252:8000/
```

Pasos generales:

1. Entrar a Coolify.
2. Abrir el proyecto/recurso de SportPetMatch o Indio.
3. Confirmar que el source sea:

```text
marketsantafeoficial-a11y/SportPetMatch2
branch main
```

4. Click en `Deploy` o `Redeploy`.
5. Esperar que termine el build.
6. Ver logs si falla.

Pantalla exacta vista en Coolify para SportPetMatch:

```text
Proyecto: sportpetmatch
Environment: production
Aplicacion: sport-pet-match:main-gskyjuthpl5eoe2br74zjxi2
Estado: Running
Menu: Actions -> Redeploy
Repo visible: marketsantafeoficial-a11y/SportPetMatch2
Commit visible: 6258122...
Dominio actual visible: http://sportpetmatch.69.62.64.252.sslip.io
```

Advertencia importante: en la pantalla actual se vio:

```text
Base Directory: /backend
Ports Exposes: 3016
```

Para probar cambios de la landing en:

```text
frontend/web/multiverse/index.html
```

Coolify tiene que desplegar el repo raiz o un build que incluya frontend. Si queda apuntando solo a `/backend`, el cambio visual puede no aparecer aunque el deploy termine bien. Antes de usar este flujo como definitivo, revisar si esta aplicacion de Coolify ya fue corregida al modo VPS monorepo esperado.

Configuracion esperada:

```text
Build Pack: Nixpacks
Build command: npm run vps-build
Start command: npm run vps-start
Port: 3000
Base Directory: /
```

## Paso 7 - Verificar produccion

Cuando termine Coolify, abrir:

```text
https://indio.com.ar/
https://www.indio.com.ar/
```

Si HTTPS todavia no esta listo, probar temporalmente:

```text
http://indio.com.ar/
http://www.indio.com.ar/
```

Tambien probar salud de API:

```text
https://indio.com.ar/api/salud
```

Checklist:

- Carga la web nueva.
- Ya no aparece `sport-pet-match3.vercel.app`.
- Los datos de donacion estan como queres.
- Login/API siguen funcionando.

## Si el cambio no aparece

1. Confirmar que el commit esta en GitHub:

```powershell
git log --oneline -5
```

2. Confirmar que el push fue a `marketsantafe`:

```powershell
git remote -v
```

3. En Coolify, confirmar que redeployo el ultimo commit.
4. Refrescar navegador con `Ctrl + F5`.
5. Si Cloudflare esta proxied en el futuro, purgar cache.

## Resumen rapido

```powershell
cd C:\Users\leona\Desktop\Proyectos\APPS\SportPetMatch
git status --short
npm run vps-build
git add frontend/web/multiverse/index.html
git commit -m "Update Indio public links"
git push marketsantafe main
```

Despues:

```text
Coolify -> proyecto -> Deploy/Redeploy -> verificar https://indio.com.ar/
```

# Descarga directa del APK de Indio

La landing ofrece `/indio-1.0.1.apk` para instalar Indio sin pasar por Google Play
(la ficha pública da 404 mientras la app sigue en prueba cerrada).

## Cómo se publica

- El repositorio guarda `frontend/web/indio-1.0.1.apk.gz` (~46 MB), no el APK
  entero (~109 MB), para no superar el límite de 100 MB por archivo de GitHub.
- `frontend/scripts/copiar-pwa.js` lo descomprime a `dist/indio-1.0.1.apk`
  durante `npm run build` (frontend). `vps-build.js` copia `dist/` a `public/`,
  que es lo que sirve el VPS.
- `frontend/scripts/sync-web-public.js` hace lo mismo para desarrollo local.
- El enlace está en `frontend/web/multiverse/index.html` (sección INSTALACIÓN).

## Origen del APK

- Bundle: `builds/indio-1.0.1-v7.aab` (versionCode 7, versionName 1.0.1,
  `com.it360.indio`), el mismo subido a Play.
- Se genera un APK universal con bundletool 1.18.1 y se firma con la **clave de
  subida** indicada en `frontend/credentials.json` (archivo ignorado por Git).

```powershell
java -jar bundletool-all-1.18.1.jar build-apks `
  --bundle=builds/indio-1.0.1-v7.aab `
  --output=indio-v7.apks `
  --mode=universal `
  --ks=frontend/android/keystores/indio-play-upload.jks `
  --ks-pass=pass:<keystorePassword> `
  --ks-key-alias=<keyAlias> `
  --key-pass=pass:<keyPassword>
```

Del `.apks` (ZIP) se extrae `universal.apk`, se comprime con gzip y se copia a
`frontend/web/indio-1.0.1.apk.gz`. Verificar siempre la firma antes de
publicar: el APK debe dar `v2=true` y `v3=true`.

## Al cambiar de versión

1. Actualizar el nombre del archivo en `copiar-pwa.js`, `sync-web-public.js` y
   `frontend/web/multiverse/index.html`.
2. Regenerar el `.gz` desde el AAB nuevo.
3. Ajustar `ANDROID_MIN_VERSION_CODE` / `ANDROID_LATEST_VERSION_CODE` en el
   backend para que el control de versión siga coincidiendo.

## Limitaciones

- El APK universal incluye las cuatro ABI (por eso pesa ~109 MB); Play entrega
  un APK más chico porque parte el bundle por dispositivo.
- Está firmado con la clave de subida, no con la firma de Play App Signing.
  Quien ya tenga instalada la beta de Play debe desinstalarla antes de instalar
  este APK.
- Android pide habilitar «Instalar apps desconocidas» y Play Protect puede
  mostrar una advertencia.

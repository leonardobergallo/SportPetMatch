# Descarga directa del APK de Indio

La landing ofrece dos APK para instalar Indio sin pasar por Google Play
(la ficha pública da 404 mientras la app sigue en prueba cerrada):

| Archivo | Peso | Para quién |
| --- | --- | --- |
| `/indio-1.0.1-arm64.apk` | ≈ 40 MB | Celulares Android modernos (64 bits). Es la descarga recomendada. |
| `/indio-1.0.1.apk` | ≈ 109 MB | Respaldo universal para equipos de 32 bits o emuladores. |

## Cómo se publican

- El repositorio guarda las versiones comprimidas:
  - `frontend/web/indio-1.0.1-arm64.apk.gz` (~23 MB)
  - `frontend/web/indio-1.0.1.apk.gz` (~46 MB)
- Así ningún binario supera el límite de 100 MB por archivo de GitHub.
- `frontend/scripts/copiar-pwa.js` los descomprime a `dist/indio-1.0.1-arm64.apk`
  y `dist/indio-1.0.1.apk` durante `npm run build`. `vps-build.js` copia
  `dist/` a `public/`, que es lo que sirve el VPS.
- `frontend/scripts/sync-web-public.js` hace lo mismo para desarrollo local.
- Los enlaces están en `frontend/web/multiverse/index.html` (sección INSTALACIÓN).

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

Del `.apks` (ZIP) se extrae `universal.apk`. Ese es el APK universal.

### APK liviano (arm64)

Al universal se le quitan las librerías de procesadores que los celulares no
usan (`lib/x86`, `lib/x86_64`, `lib/armeabi-v7a`) con un script de Python que
copia las entradas del ZIP. Después:

```powershell
zipalign -P 16 -f 4 indio-arm64-unsigned.apk indio-arm64-aligned.apk
apksigner sign --ks <keystore> --ks-pass pass:<password> `
  --ks-key-alias <alias> --key-pass pass:<keyPassword> `
  --out indio-1.0.1-arm64.apk indio-arm64-aligned.apk
```

Verificar siempre antes de publicar:

```powershell
apksigner verify --verbose --print-certs indio-1.0.1-arm64.apk
aapt dump badging indio-1.0.1-arm64.apk
zipalign -P 16 -c 4 indio-1.0.1-arm64.apk
```

Debe dar `v2=true`, `v3=true`, `versionCode 7`, `versionName 1.0.1` y
`native-code: 'arm64-v8a'`.

Finalmente, comprimir cada APK con gzip y copiarlo a `frontend/web/` con el
nombre que esperan los scripts.

## Al cambiar de versión

1. Actualizar los nombres de archivo en `copiar-pwa.js`, `sync-web-public.js` y
   `frontend/web/multiverse/index.html`.
2. Regenerar los `.gz` desde el AAB nuevo.
3. Ajustar `ANDROID_MIN_VERSION_CODE` / `ANDROID_LATEST_VERSION_CODE` en el
   backend para que el control de versión siga coincidiendo.

## Limitaciones

- El APK universal incluye las cuatro ABI (por eso pesa ~109 MB); Play entrega
  un APK más chico porque parte el bundle por dispositivo.
- Los APK están firmados con la clave de subida, no con la firma de Play App
  Signing. Quien ya tenga instalada la beta de Play debe desinstalarla antes de
  instalar estos APK.
- Android pide habilitar «Instalar apps desconocidas» y Play Protect puede
  mostrar una advertencia.

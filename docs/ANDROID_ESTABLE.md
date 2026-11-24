# Android estable + web

## Arquitectura actual

La app Android es un contenedor WebView. No contiene las pantallas de producto:
carga la web publicada en:

```text
https://indio.com.ar/app.html?app=1
```

Archivos principales:

- `frontend/App.tsx`: en Android devuelve `IndioWebAndroid`.
- `frontend/src/componentes/IndioWebAndroid.tsx`: WebView, chequeo de versión y fallback.

Consecuencia: **todo cambio de UI, configuración, textos o flujos se publica en la web**
y llega a Android sin pasar por Play Store.

## Cuándo hace falta una versión nueva en Play Store

Solo cuando cambia algo nativo:

- Permisos (cámara, ubicación, micrófono, notificaciones).
- SDK de Android, React Native o Expo.
- Icono, splash, nombre o firma.
- Comportamiento del WebView, deep links o integración nativa.
- Requisito de seguridad o política de Google Play.

## Versión mínima y actualización forzada

El backend expone:

```text
GET /api/app/version?platform=android&versionCode=7
```

Variables:

```env
ANDROID_MIN_VERSION_CODE=6
ANDROID_LATEST_VERSION_CODE=7
ANDROID_UPDATE_URL=https://play.google.com/store/apps/details?id=com.it360.indio
ANDROID_UPDATE_MESSAGE=Actualizá Indio para seguir usando la app.
```

`ANDROID_MIN_VERSION_CODE` es el `versionCode` mínimo aceptado.

**Importante:** subir ese valor solo después de que la nueva versión esté publicada
y disponible en Play Store. Si se sube antes, los usuarios de la versión anterior
quedan bloqueados con un botón que todavía no encuentra la actualización.

## Build 1.0.1 (versionCode 7)

Incluye:

- Chequeo de versión mínima al arrancar (si la API no responde, deja entrar).
- Pantalla de actualización obligatoria con botón a Play Store.
- Botón “Usar la versión web” como respaldo.
- Botón “Abrir en el navegador” si el WebView falla.

Artefactos locales:

```text
frontend/android/app/build/outputs/bundle/release/app-release.aab
frontend/android/app/build/outputs/apk/release/app-release.apk
```

## Regla de trabajo

1. Cambio de producto/configuración → deploy web.
2. Cambio nativo → build Android + subir a Play Store.
3. Recién después de publicar, subir `ANDROID_MIN_VERSION_CODE`.
4. Evitar tocar el APK por cambios que ya se resuelven en la web.

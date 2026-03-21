# Instalar Indio sin tiendas

Esta guia permite instalar `Indio` sin publicar en App Store o Play Store.

## Opcion A (recomendada): PWA

No requiere tiendas ni archivos APK/IPA.

### Android (Chrome)
1. Abre la URL de la app en Chrome.
2. Toca el menu (tres puntos).
3. Elige `Agregar a pantalla de inicio` o `Instalar app`.
4. Confirma.

### iPhone (Safari)
1. Abre la URL de la app en Safari.
2. Toca el boton compartir.
3. Elige `Agregar a inicio`.
4. Confirma.

Resultado: se instala como app con icono y abre en modo pantalla completa.

## Opcion B: APK Android (sin Play Store)

Usa EAS Build para generar un APK instalable.

### Generar APK
Desde la raiz del proyecto:

```powershell
.\scripts\build-app-android.ps1
```

En el asistente, selecciona perfil `preview` (APK).

### Instalar APK en Android
1. Descarga el APK generado.
2. En el telefono, habilita `Instalar apps desconocidas` para el navegador o gestor de archivos.
3. Abre el APK y confirma instalacion.

## Requisito de backend

La app web en produccion usa `/api` en el mismo dominio (monorepo Vercel), definido en:
- `frontend/src/utilidades/config.ts`

Si pruebas APK en build de produccion, configura:
- `EXPO_PUBLIC_API_URL=https://tu-dominio/api`


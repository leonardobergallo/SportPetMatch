# Monetización con publicidad (AdMob)

La app está preparada para mostrar banners de Google AdMob y seguir siendo gratuita.

## Estado actual

- **Componente:** `frontend/src/componentes/AdBanner.tsx` — se puede colocar en pantallas (Inicio, Eventos, etc.). Por ahora muestra un bloque de “Espacio publicitario” para no romper el diseño.
- **Expo Go:** Las librerías nativas de AdMob no funcionan en Expo Go. Hace falta un **development build** (EAS Build o `expo prebuild`).

## Cómo activar publicidad real

1. **Cuenta AdMob**  
   Crea una en [admob.google.com](https://admob.google.com) y registra tu app (iOS y Android). Obtén:
   - App ID (formato `ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy`)
   - Ad unit ID para banner (formato `ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz`).

2. **Instalar la librería**  
   En la carpeta `frontend`:
   ```bash
   npx expo install react-native-google-mobile-ads
   ```

3. **Configurar `app.json`**  
   Añade en la raíz de `expo` (o donde indique la doc de la librería):
   ```json
   "plugins": [
     [
       "react-native-google-mobile-ads",
       {
         "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy",
         "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
       }
     ]
   ]
   ```

4. **Variable de entorno**  
   En `.env` o en EAS Secrets:
   ```
   EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz
   ```

5. **Development build**  
   Genera un build nativo (no uses solo Expo Go):
   ```bash
   eas build --profile development --platform all
   ```
   O para producción:
   ```bash
   eas build --profile production --platform all
   ```

6. **Usar el banner en pantallas**  
   Donde quieras mostrar el anuncio:
   ```tsx
   import AdBanner from '../componentes/AdBanner';
   // ...
   <AdBanner minHeight={50} />
   ```
   Cuando `EXPO_PUBLIC_ADMOB_BANNER_ID` esté definido y la librería instalada, en `AdBanner.tsx` sustituye el placeholder por el componente `BannerAd` de `react-native-google-mobile-ads`.

## Buenas prácticas

- Usa **IDs de prueba** mientras desarrollas para no incumplir políticas de AdMob.
- Coloca banners en sitios visibles pero no invasivos (pie de listas, entre secciones).
- Si tienes usuarios en UE, valora mostrar un consentimiento (GDPR) antes de cargar anuncios.

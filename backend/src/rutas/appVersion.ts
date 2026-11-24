// Configuración remota de versión para el contenedor Android.
// Permite forzar una actualización solo cuando hay un cambio nativo necesario.
import express from 'express';

const router = express.Router();

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.it360.indio';
const WEB_APP_URL = 'https://indio.com.ar/app.html?app=1';
const MENSAJE_POR_DEFECTO = 'Actualizá Indio para seguir usando la app.';

function enteroPositivo(valor: string | undefined, defecto: number): number {
  const numero = Number.parseInt(valor || '', 10);
  return Number.isFinite(numero) && numero > 0 ? numero : defecto;
}

router.get('/version', (req, res) => {
  const minVersionCode = enteroPositivo(process.env.ANDROID_MIN_VERSION_CODE, 6);
  const latestVersionCode = enteroPositivo(
    process.env.ANDROID_LATEST_VERSION_CODE,
    Math.max(minVersionCode, 7)
  );
  const versionCode = Math.max(
    0,
    Number.parseInt(String(req.query.versionCode || '0'), 10) || 0
  );

  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    android: {
      minVersionCode,
      latestVersionCode,
      updateUrl: process.env.ANDROID_UPDATE_URL?.trim() || PLAY_STORE_URL,
      webUrl: process.env.ANDROID_WEB_URL?.trim() || WEB_APP_URL,
      message: process.env.ANDROID_UPDATE_MESSAGE?.trim() || MENSAJE_POR_DEFECTO,
      debeActualizar: versionCode > 0 && versionCode < minVersionCode,
    },
  });
});

export default router;

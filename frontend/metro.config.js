// Configuración de Metro para SportPetMatch
// Bundler de React Native para Expo

const path = require('path');

// Evitar que Metro use la raíz del workspace (monorepo); así ./index se resuelve desde frontend
process.env.EXPO_NO_METRO_WORKSPACE_ROOT = '1';

const { getDefaultConfig } = require('expo/metro-config');

// Raíz del proyecto Expo (siempre la carpeta frontend)
const projectRoot = path.resolve(__dirname);
const config = getDefaultConfig(projectRoot);

// Fijar projectRoot para que Metro resuelva ./index y todo desde frontend, no desde la raíz del repo
config.projectRoot = projectRoot;

// Monorepo: vigilar solo la carpeta frontend para evitar ENOENT al vigilar
// node_modules de la raíz (ej. @tybys/wasm-util/lib/mjs que no existe)
config.watchFolders = [projectRoot];

// Configuración personalizada para el proyecto
config.resolver.alias = {
  // Alias para importaciones más fáciles
  '@': './src',
  '@/componentes': './src/componentes',
  '@/pantallas': './src/pantallas',
  '@/navegacion': './src/navegacion',
  '@/servicios': './src/servicios',
  '@/almacen': './src/almacen',
  '@/hooks': './src/hooks',
  '@/utilidades': './src/utilidades',
  '@/tipos': './src/tipos',
  '@/constantes': './src/constantes',
};

// Configuración de transformación
config.transformer.minifierConfig = {
  // Configuración del minificador
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Configuraciones del servidor
config.server = {
  ...config.server,
  port: 8081,
  // Solo reescribir /frontend/ → / para peticiones del bundle nativo (iOS/Android).
  // No tocar la web (platform=web) para no romper localhost:8081.
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url || '';
      const isNativeBundle = url.startsWith('/frontend/') && (url.includes('platform=ios') || url.includes('platform=android'));
      if (isNativeBundle) {
        const rewritten = url.replace(/^\/frontend\//, '/');
        req.url = rewritten;
        req.originalUrl = rewritten;
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return middleware(req, res, next);
    };
  },
};

// Configuración de caché - deshabilitar caché problemática pero mantener estabilidad
// config.cacheStores = []; // Comentado para evitar problemas de reconexión

// Configuración de resolución de archivos
config.resolver.sourceExts = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'cjs',
];

// Configuración de plataformas
config.resolver.platforms = [
  'ios',
  'android',
  'native',
  'web',
];

module.exports = config;

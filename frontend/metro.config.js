// Configuración de Metro para SportPetMatch
// Bundler de React Native para Expo

const { getDefaultConfig } = require('expo/metro-config');

// Obtener configuración por defecto de Expo
const config = getDefaultConfig(__dirname);

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
  // Configurar para aceptar conexiones desde la red local
  port: 8081,
  // Mejorar estabilidad de conexiones y evitar problemas de caché
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Agregar headers para evitar problemas de caché en el cliente
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

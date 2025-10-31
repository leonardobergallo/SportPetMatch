// Configuración de Babel para SportPetMatch
// Transpilador de JavaScript/TypeScript

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      // Preset de Babel para React Native
      'babel-preset-expo',
    ],
    plugins: [
      // Plugin para importaciones con alias
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
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
          },
        },
      ],
      
      // Plugin para React Native Reanimated (debe ser el último)
      'react-native-reanimated/plugin',
    ],
  };
};

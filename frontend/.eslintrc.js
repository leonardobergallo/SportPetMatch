// Configuración de ESLint para SportPetMatch
// Linter para mantener código limpio y consistente

module.exports = {
  extends: [
    'expo',
    '@react-native',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Reglas personalizadas para el proyecto
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-native/no-single-element-style-arrays': 'warn',
    
    // Reglas de TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    
    // Reglas generales
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  settings: {
    'import/resolver': {
      'babel-plugin-module-resolver': {
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
    },
  },
};

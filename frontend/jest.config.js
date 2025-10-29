// Configuración de Jest para SportPetMatch
// Framework de testing para React Native

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
    '<rootDir>/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|@react-navigation|@expo|expo|@unimodules|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/componentes/(.*)$': '<rootDir>/src/componentes/$1',
    '^@/pantallas/(.*)$': '<rootDir>/src/pantallas/$1',
    '^@/navegacion/(.*)$': '<rootDir>/src/navegacion/$1',
    '^@/servicios/(.*)$': '<rootDir>/src/servicios/$1',
    '^@/almacen/(.*)$': '<rootDir>/src/almacen/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/utilidades/(.*)$': '<rootDir>/src/utilidades/$1',
    '^@/tipos/(.*)$': '<rootDir>/src/tipos/$1',
    '^@/constantes/(.*)$': '<rootDir>/src/constantes/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'jsdom',
};

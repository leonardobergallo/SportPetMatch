// Archivo principal de SportPetMatch
// Aplicación principal con contexto de autenticación, ubicación y navegación

import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Importar contextos, navegación y error boundary
import { ProveedorAuth } from './src/contextos/ContextoAuth';
import { ProveedorUbicacion } from './src/contextos/ContextoUbicacion';
import NavegacionPrincipal from './src/navegacion/NavegacionPrincipal';
import ErrorBoundary from './src/componentes/ErrorBoundary';

// Componente opcional para mostrar prompt de instalación PWA
// Descomenta la siguiente línea si quieres mostrar el banner de instalación:
// import InstallPrompt from './src/componentes/InstallPrompt';

// Configurar tema personalizado
const tema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ea',
    secondary: '#03dac6',
    tertiary: '#018786',
    surface: '#ffffff',
    background: '#f5f5f5',
    error: '#b00020',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onTertiary: '#ffffff',
    onSurface: '#000000',
    onBackground: '#000000',
    onError: '#ffffff',
  },
};

export default function App() {
  return (
    <PaperProvider theme={tema}>
      <ErrorBoundary>
        <ProveedorAuth>
          <ProveedorUbicacion>
            <StatusBar style="auto" />
            <NavegacionPrincipal />
            {/* Descomenta la siguiente línea para mostrar el banner de instalación PWA: */}
            {/* <InstallPrompt /> */}
          </ProveedorUbicacion>
        </ProveedorAuth>
      </ErrorBoundary>
    </PaperProvider>
  );
}
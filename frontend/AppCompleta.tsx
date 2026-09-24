import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { ProveedorAuth } from './src/contextos/ContextoAuth';
import { ProveedorUbicacion } from './src/contextos/ContextoUbicacion';
import NavegacionPrincipal from './src/navegacion/NavegacionPrincipal';
import ErrorBoundary from './src/componentes/ErrorBoundary';
import InstallPrompt from './src/componentes/InstallPrompt';

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

export default function AppCompleta() {
  return (
    <PaperProvider theme={tema}>
      <ErrorBoundary>
        <ProveedorAuth>
          <ProveedorUbicacion>
            <StatusBar style="auto" />
            <NavegacionPrincipal />
            <InstallPrompt />
          </ProveedorUbicacion>
        </ProveedorAuth>
      </ErrorBoundary>
    </PaperProvider>
  );
}

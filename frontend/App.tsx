// Archivo principal de la aplicación móvil SportPetMatch
// Configuración de la app con React Native, Expo y TypeScript

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importar navegación principal
import NavegacionPrincipal from './src/navegacion/NavegacionPrincipal';

// Importar tema personalizado
import { temaApp } from './src/constantes/tema';

// Configurar React Query para manejo de estado del servidor
const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para las consultas
      staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
      cacheTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché
      retry: 3, // Reintentar 3 veces en caso de error
      refetchOnWindowFocus: false, // No refetch al enfocar la app
    },
    mutations: {
      // Configuración por defecto para las mutaciones
      retry: 1, // Reintentar 1 vez en caso de error
    },
  },
});

/**
 * Componente principal de la aplicación SportPetMatch
 * 
 * Este componente configura todos los providers necesarios:
 * - SafeAreaProvider: Para manejar áreas seguras en diferentes dispositivos
 * - PaperProvider: Para el sistema de diseño de React Native Paper
 * - QueryClientProvider: Para el manejo de estado del servidor con React Query
 * - GestureHandlerRootView: Para el manejo de gestos táctiles
 * 
 * @returns JSX.Element - La aplicación completa renderizada
 */
export default function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={clienteQuery}>
          <PaperProvider theme={temaApp}>
            {/* Configuración de la barra de estado */}
            <StatusBar 
              style="dark" 
              backgroundColor="#ffffff" 
              translucent={false}
            />
            
            {/* Navegación principal de la aplicación */}
            <NavegacionPrincipal />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

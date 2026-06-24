// Configuracion centralizada para SportPetMatch
// Maneja la configuracion de la URL de la API segun el entorno

import { Platform } from 'react-native';

// IP local para desarrollo (movil/Expo Go). Opcional: EXPO_PUBLIC_LOCAL_IP en .env
// Para encontrar tu IP: Windows: ipconfig | findstr IPv4 | Mac/Linux: ifconfig | grep "inet "
export const LOCAL_IP =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_LOCAL_IP?.trim()) || '192.168.0.174';

// Puerto del backend
export const API_PORT = 3000;

// Detectar si estamos en un dispositivo movil (Expo Go)
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

function normalizeApiUrl(apiUrl: string): string {
  const trimmed = apiUrl.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('postgresql://') || trimmed.includes('psql')) {
    console.warn('EXPO_PUBLIC_API_URL contiene una cadena de conexion de base de datos.');
    console.warn('Ignorando variable y usando deteccion automatica.');
    return '';
  }

  if (trimmed.startsWith('/')) {
    return trimmed.replace(/\/+$/, '');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (isMobile && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
      return trimmed.replace(/localhost|127\.0\.0\.1/g, LOCAL_IP).replace(/\/+$/, '');
    }

    return trimmed.replace(/\/+$/, '');
  }

  return `/${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

/**
 * Obtener la URL base de la API segun el entorno
 */
export function getAPIBaseURL(): string {
  const envApiUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL || '');

  // Si estamos en web
  if (isWeb) {
    // En web, verificar si estamos en produccion o desarrollo
    if (typeof window !== 'undefined') {
      const metaApiUrl = normalizeApiUrl(
        document.querySelector('meta[name="indio-api-base"]')?.getAttribute('content') || ''
      );

      const isProduction =
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.includes('192.168') &&
        !window.location.hostname.includes('172.');

      if (isProduction) {
        if (metaApiUrl) {
          console.log('Produccion detectada: usando indio-api-base');
          return metaApiUrl;
        }

        if (envApiUrl) {
          console.log('Produccion detectada: usando EXPO_PUBLIC_API_URL');
          return envApiUrl;
        }

        console.log('Produccion detectada: usando ruta relativa /api');
        return '/api';
      }

      if (envApiUrl) {
        return envApiUrl;
      }

      if (metaApiUrl && !metaApiUrl.startsWith('/')) {
        return metaApiUrl;
      }
    }

    // En desarrollo web local
    return `http://localhost:${API_PORT}/api`;
  }

  // Si hay una variable de entorno, validarla primero (solo para movil)
  if (envApiUrl) {
    return envApiUrl;
  }

  // Si estamos en movil
  if (isMobile) {
    // En produccion (builds de EAS), siempre usar variable de entorno
    // Si no esta configurada, mostrar error claro
    if (__DEV__) {
      // En desarrollo con Expo Go, usar IP local
      return `http://${LOCAL_IP}:${API_PORT}/api`;
    }

    // En produccion, la variable EXPO_PUBLIC_API_URL debe estar configurada
    console.error('EXPO_PUBLIC_API_URL no esta configurada. Configurala antes de crear el build.');
    console.error('Ejemplo: EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api');
    return '';
  }

  // Por defecto, usar IP local para desarrollo
  return `http://${LOCAL_IP}:${API_PORT}/api`;
}

/**
 * Obtener informacion de configuracion para debugging
 */
export function getConfigInfo() {
  return {
    platform: Platform.OS,
    isMobile,
    isWeb,
    apiURL: getAPIBaseURL(),
    localIP: LOCAL_IP,
    port: API_PORT,
  };
}

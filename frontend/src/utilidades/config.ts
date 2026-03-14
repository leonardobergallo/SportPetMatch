// Configuración centralizada para SportPetMatch
// Maneja la configuración de la URL de la API según el entorno

import { Platform } from 'react-native';

// IP local para desarrollo (móvil/Expo Go). Opcional: EXPO_PUBLIC_LOCAL_IP en .env
// Para encontrar tu IP: Windows: ipconfig | findstr IPv4 | Mac/Linux: ifconfig | grep "inet "
export const LOCAL_IP =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_LOCAL_IP?.trim()) || '192.168.0.174';

// Puerto del backend
export const API_PORT = 3000;

// Detectar si estamos en un dispositivo móvil (Expo Go)
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * Obtener la URL base de la API según el entorno
 */
export function getAPIBaseURL(): string {
  // Si estamos en web
  if (isWeb) {
    // En web, verificar si estamos en producción o desarrollo
    if (typeof window !== 'undefined') {
      // Detectar si estamos en producción (Vercel)
      const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' &&
                           !window.location.hostname.includes('192.168') &&
                           !window.location.hostname.includes('172.');
      
      if (isProduction) {
        // En producción (Vercel), SIEMPRE usar ruta relativa /api
        // Esto funciona para monorepo donde backend y frontend están en el mismo dominio
        // Ignorar cualquier variable de entorno que pueda tener una URL completa
        console.log('🌐 Producción detectada: usando ruta relativa /api');
        return '/api';
      }
    }
    
    // En desarrollo web local
    return `http://localhost:${API_PORT}/api`;
  }

  // Si hay una variable de entorno, validarla primero (solo para móvil)
  if (process.env.EXPO_PUBLIC_API_URL) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL.trim();
    
    // Validar que sea una URL HTTP/HTTPS válida o una ruta relativa (para monorepo)
    // Si contiene "postgresql://" o "psql", no es una URL válida del API
    // En este caso, ignorar la variable y usar la detección automática
    if (apiUrl.includes('postgresql://') || apiUrl.includes('psql')) {
      console.warn('⚠️ EXPO_PUBLIC_API_URL contiene una cadena de conexión de base de datos.');
      console.warn('⚠️ Ignorando variable y usando detección automática.');
      // Continuar con la lógica de detección automática en lugar de retornar vacío
    } else {
      // Si es una ruta relativa (empieza con /), usarla directamente
      if (apiUrl.startsWith('/')) {
        return apiUrl;
      }
      
      // Si es una URL completa (http/https), validarla y usarla (solo para móvil)
      if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
        // En móvil, localhost no funciona (apunta al teléfono). Usar IP de la PC.
        if (isMobile && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
          return apiUrl.replace(/localhost|127\.0\.0\.1/g, LOCAL_IP);
        }
        return apiUrl;
      }
      
      // Si no es ni ruta relativa ni URL completa, asumir que es relativa
      return apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`;
    }
    
  }

  // Si estamos en móvil
  if (isMobile) {
    // En producción (builds de EAS), siempre usar variable de entorno
    // Si no está configurada, mostrar error claro
    if (__DEV__) {
      // En desarrollo con Expo Go, usar IP local
      return `http://${LOCAL_IP}:${API_PORT}/api`;
    } else {
      // En producción, la variable EXPO_PUBLIC_API_URL debe estar configurada
      console.error('❌ EXPO_PUBLIC_API_URL no está configurada. Configúrala antes de crear el build.');
      console.error('❌ Ejemplo: EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app/api');
      return ''; // Retornar vacío para que la app maneje esto gracefully
    }
  }

  // Por defecto, usar IP local para desarrollo
  return `http://${LOCAL_IP}:${API_PORT}/api`;
}

/**
 * Obtener información de configuración para debugging
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



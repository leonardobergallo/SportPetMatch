// Configuración centralizada para SportPetMatch
// Maneja la configuración de la URL de la API según el entorno

import { Platform } from 'react-native';

// IP local de tu computadora
// IMPORTANTE: Cambia esto por la IP local de tu computadora
// Para encontrar tu IP: Windows: ipconfig | findstr IPv4
//                        Mac/Linux: ifconfig | grep "inet "
export const LOCAL_IP = '172.20.10.3';

// Puerto del backend
export const API_PORT = 3000;

// Detectar si estamos en un dispositivo móvil (Expo Go)
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * Obtener la URL base de la API según el entorno
 */
export function getAPIBaseURL(): string {
  // Si hay una variable de entorno, validarla primero
  if (process.env.EXPO_PUBLIC_API_URL) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL.trim();
    
    // Validar que sea una URL HTTP/HTTPS válida (no una cadena de conexión de base de datos)
    // Si contiene "postgresql://" o "psql", no es una URL válida del API
    if (apiUrl.includes('postgresql://') || apiUrl.includes('psql') || !apiUrl.startsWith('http')) {
      console.error('❌ EXPO_PUBLIC_API_URL contiene una cadena de conexión de base de datos, no una URL del API.');
      console.error('❌ Debe ser algo como: https://tu-backend.render.com/api');
      console.error('❌ No debe ser: postgresql://... o psql \'...\'');
      return ''; // Retornar vacío para que funcione sin backend
    }
    
    return apiUrl;
  }

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
        // En producción, si no hay variable de entorno configurada,
        // mostrar un mensaje de error claro en lugar de intentar conectar a un endpoint inexistente
        // El usuario debe configurar EXPO_PUBLIC_API_URL en Vercel
        console.warn('⚠️ EXPO_PUBLIC_API_URL no está configurada en Vercel. La app funcionará en modo offline.');
        // Retornar null o una URL vacía para que la app maneje esto gracefully
        return '';
      }
    }
    
    // En desarrollo web local
    return `http://localhost:${API_PORT}/api`;
  }

  // Si estamos en móvil, usar IP local
  if (isMobile) {
    return `http://${LOCAL_IP}:${API_PORT}/api`;
  }

  // Por defecto, usar IP local para Expo Go
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



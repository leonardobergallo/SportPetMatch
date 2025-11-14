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
  // Si hay una variable de entorno, usarla (prioridad para producción)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
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
        // En producción, intentar usar el mismo dominio con /api
        // O puedes configurar esto como variable de entorno en Vercel
        return `${window.location.protocol}//${window.location.hostname}/api`;
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



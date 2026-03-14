// Cliente API centralizado para SportPetMatch
// Maneja todas las peticiones HTTP con interceptores y manejo de tokens

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPIBaseURL, getConfigInfo, isMobile } from '../utilidades/config';
import { getOnUnauthorized } from '../utilidades/onUnauthorized';

// URL base de la API (se obtiene de la configuración centralizada)
const API_BASE_URL = getAPIBaseURL();
const TOKEN_KEY = '@SportPetMatch:token';

// Log para debugging
if (__DEV__) {
  const configInfo = getConfigInfo();
  console.log('🌐 Configuración de API:');
  console.log('  - URL:', configInfo.apiURL);
  console.log('  - Platform:', configInfo.platform);
  console.log('  - Is Mobile:', configInfo.isMobile);
  console.log('  - Is Web:', configInfo.isWeb);
  console.log('  - Local IP:', configInfo.localIP);
  console.log('  - Port:', configInfo.port);
}

// Validar que la URL esté configurada
if (!API_BASE_URL || API_BASE_URL === '') {
  console.warn('⚠️ API_BASE_URL no está configurada. Las peticiones al backend fallarán.');
}

/**
 * Crear instancia de Axios con configuración
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api', // Fallback para evitar errores
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token a las peticiones
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Si no hay URL configurada, rechazar la petición inmediatamente
    if (!API_BASE_URL || API_BASE_URL === '') {
      const error = new Error('Backend no configurado. Por favor, configura EXPO_PUBLIC_API_URL en Vercel.');
      console.warn('⚠️', error.message);
      return Promise.reject(error);
    }
    
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar respuestas y errores
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token inválido o expirado: limpiar storage y notificar al contexto para mostrar Login
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem('@SportPetMatch:user');
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }
      getOnUnauthorized()?.();
    }

    // Manejar errores de red
    if (!error.response) {
      const configInfo = getConfigInfo();
      
      // Si no hay URL configurada en producción, mostrar mensaje claro
      if (!configInfo.apiURL || configInfo.apiURL === '') {
        const errorMessage = 'Backend no configurado. Por favor, configura EXPO_PUBLIC_API_URL en Vercel.';
        console.warn('⚠️', errorMessage);
        throw new Error(errorMessage);
      }
      
      const errorMessage = isMobile
        ? `Error de conexión. Verifica que:\n1. El backend esté corriendo en ${configInfo.apiURL}\n2. Tu dispositivo y computadora estén en la misma red WiFi\n3. El firewall no esté bloqueando el puerto ${configInfo.port}\n4. La IP local (${configInfo.localIP}) sea correcta`
        : `Error de conexión. Verifica que:\n1. El backend esté corriendo en ${configInfo.apiURL}\n2. Tu conexión a internet funcione\n3. El backend esté desplegado y accesible`;
      throw new Error(errorMessage);
    }

    // Retornar error con mensaje del servidor
    const errorMessage =
      (error.response.data as any)?.message ||
      (error.response.data as any)?.error ||
      'Ha ocurrido un error';

    throw new Error(errorMessage);
  }
);

export default apiClient;

// Cliente API centralizado para SportPetMatch
// Maneja todas las peticiones HTTP con interceptores y manejo de tokens

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAPIBaseURL, getConfigInfo, isMobile } from '../utilidades/config';
import { getOnUnauthorized } from '../utilidades/onUnauthorized';

// URL base de la API (se obtiene de la configuracion centralizada)
const API_BASE_URL = getAPIBaseURL();
const TOKEN_KEY = '@SportPetMatch:token';
const USER_KEY = '@SportPetMatch:user';

// Log para debugging solo en desarrollo web para no ensuciar la consola del celular
if (__DEV__ && !isMobile) {
  const configInfo = getConfigInfo();
  console.log('Configuracion de API:');
  console.log('  - URL:', configInfo.apiURL);
  console.log('  - Platform:', configInfo.platform);
  console.log('  - Is Mobile:', configInfo.isMobile);
  console.log('  - Is Web:', configInfo.isWeb);
  console.log('  - Local IP:', configInfo.localIP);
  console.log('  - Port:', configInfo.port);
}

// Validar que la URL este configurada
if (!API_BASE_URL || API_BASE_URL === '') {
  console.warn('API_BASE_URL no esta configurada. Las peticiones al backend fallaran.');
}

/**
 * Crear instancia de Axios con configuracion
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token a las peticiones
 */
apiClient.interceptors.request.use(
  async (config) => {
    if (!API_BASE_URL || API_BASE_URL === '') {
      const error = new Error('Backend no configurado. Por favor, configura EXPO_PUBLIC_API_URL en Vercel.');
      console.warn(error.message);
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
  (error) => Promise.reject(error)
);

/**
 * Interceptor para manejar respuestas y errores
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const responseStatus = error.response?.status;
    const responseMessage =
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      '';
    const sessionMismatch =
      responseStatus === 404 &&
      responseMessage === 'El usuario autenticado no existe en la base de datos actual. Inicia sesión nuevamente.';

    if (responseStatus === 401 || sessionMismatch) {
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }

      getOnUnauthorized()?.();
    }

    if (!error.response) {
      const configInfo = getConfigInfo();

      if (!configInfo.apiURL || configInfo.apiURL === '') {
        const errorMessage = 'Backend no configurado. Por favor, configura EXPO_PUBLIC_API_URL en Vercel.';
        console.warn(errorMessage);
        throw new Error(errorMessage);
      }

      const errorMessage = isMobile
        ? `Error de conexion. Verifica que:\n1. El backend este corriendo en ${configInfo.apiURL}\n2. Tu dispositivo y computadora esten en la misma red WiFi\n3. El firewall no este bloqueando el puerto ${configInfo.port}\n4. La IP local (${configInfo.localIP}) sea correcta`
        : `Error de conexion. Verifica que:\n1. El backend este corriendo en ${configInfo.apiURL}\n2. Tu conexion a internet funcione\n3. El backend este desplegado y accesible`;
      throw new Error(errorMessage);
    }

    throw new Error(responseMessage || 'Ha ocurrido un error');
  }
);

export default apiClient;

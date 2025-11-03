// Cliente API centralizado para SportPetMatch
// Maneja todas las peticiones HTTP con interceptores y manejo de tokens

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base de la API
// En Expo, las variables de entorno deben tener el prefijo EXPO_PUBLIC_
// Si no está definida, usar localhost por defecto
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = '@SportPetMatch:token';

/**
 * Crear instancia de Axios con configuración
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
      // Token inválido o expirado
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem('@SportPetMatch:user');
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }
      
      // Podrías redirigir al login aquí si es necesario
      // navigationRef.navigate('Login');
    }

    // Manejar errores de red
    if (!error.response) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
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


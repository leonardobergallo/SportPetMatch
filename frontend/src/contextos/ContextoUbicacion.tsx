// Contexto de Geolocalización para SportPetMatch
// Maneja la ubicación del usuario y cálculos de distancia

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Tipos para la ubicación
export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface UbicacionCompleta extends Coordenadas {
  ciudad?: string;
  provincia?: string;
  pais?: string;
  codigoPostal?: string;
  direccion?: string;
}

// Tipo para el contexto
interface ContextoUbicacionType {
  ubicacionActual: UbicacionCompleta | null;
  coordenadas: Coordenadas | null;
  cargandoUbicacion: boolean;
  permisoUbicacion: boolean;
  errorUbicacion: string | null;
  solicitarPermisos: () => Promise<boolean>;
  obtenerUbicacion: () => Promise<UbicacionCompleta | null>;
  calcularDistancia: (coordenadas1: Coordenadas, coordenadas2: Coordenadas) => number;
  actualizarUbicacion: () => Promise<void>;
}

// Crear el contexto
const ContextoUbicacion = createContext<ContextoUbicacionType | null>(null);

// Proveedor del contexto de ubicación
export function ProveedorUbicacion({ children }: { children: ReactNode }) {
  const [ubicacionActual, setUbicacionActual] = useState<UbicacionCompleta | null>(null);
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

  // Verificar permisos al cargar el contexto e inicializar ubicación por defecto
  useEffect(() => {
    // Establecer ubicación por defecto inmediatamente
    const ubicacionPorDefecto: UbicacionCompleta = {
      latitud: -31.6333,
      longitud: -60.7,
      ciudad: 'Santa Fe',
      provincia: 'Santa Fe',
      pais: 'Argentina',
    };
    
    setUbicacionActual(ubicacionPorDefecto);
    setCoordenadas({
      latitud: ubicacionPorDefecto.latitud,
      longitud: ubicacionPorDefecto.longitud
    });
    
    // Luego intentar obtener la ubicación real
    verificarPermisos();
  }, []);

  /**
   * Verificar permisos de ubicación existentes
   */
  const verificarPermisos = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermisoUbicacion(status === 'granted');
      
      if (status === 'granted') {
        // Si ya tenemos permisos, obtener ubicación inicial
        await obtenerUbicacionInicial();
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setErrorUbicacion('Error verificando permisos de ubicación');
    }
  };

  /**
   * Solicitar permisos de ubicación
   */
  const solicitarPermisos = async (): Promise<boolean> => {
    try {
      setCargandoUbicacion(true);
      setErrorUbicacion(null);

      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Ubicación',
          'SportPetMatch necesita acceso a tu ubicación para mostrarte eventos cercanos y conectar con personas de tu zona.',
          [
            { 
              text: 'Configurar', 
              onPress: () => {
                // En una app real, abriríamos la configuración
                Alert.alert('Configuración', 'Ve a Configuración > Privacidad > Ubicación para habilitar los permisos');
              }
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        setPermisoUbicacion(false);
        return false;
      }

      setPermisoUbicacion(true);
      
      // Obtener ubicación inicial después de obtener permisos
      await obtenerUbicacionInicial();
      
      return true;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      setErrorUbicacion('Error solicitando permisos de ubicación');
      return false;
    } finally {
      setCargandoUbicacion(false);
    }
  };

  /**
   * Obtener ubicación inicial
   */
  const obtenerUbicacionInicial = async () => {
    try {
      setCargandoUbicacion(true);
      
      // Intentar obtener ubicación real
      const location = await obtenerUbicacion();
      if (location) {
        setUbicacionActual(location);
        setCoordenadas({
          latitud: location.latitud,
          longitud: location.longitud
        });
        console.log('Ubicación obtenida:', location.ciudad);
      }
    } catch (error) {
      console.error('Error obteniendo ubicación inicial:', error);
      // La ubicación por defecto ya está establecida en useEffect
    } finally {
      setCargandoUbicacion(false);
    }
  };

  /**
   * Obtener ubicación actual del dispositivo
   */
  const obtenerUbicacion = async (): Promise<UbicacionCompleta | null> => {
    try {
      setCargandoUbicacion(true);
      setErrorUbicacion(null);

      if (!permisoUbicacion) {
        const tienePermisos = await solicitarPermisos();
        if (!tienePermisos) {
          // Devolver ubicación por defecto si no hay permisos
          return {
            latitud: -31.6333,
            longitud: -60.7,
            ciudad: 'Santa Fe',
            provincia: 'Santa Fe',
            pais: 'Argentina',
          };
        }
      }

      // Usar Promise.race para implementar timeout
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout obteniendo ubicación')), 10000); // 10 segundos
      });

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 3000,
        distanceInterval: 10,
      });

      // Intentar obtener ubicación con timeout
      const location = await Promise.race([locationPromise, timeoutPromise]);
      
      if (!location) {
        throw new Error('No se pudo obtener ubicación');
      }

      const { latitude, longitude } = location.coords;

      // Geocodificación inversa para obtener dirección
      let direccionInfo: UbicacionCompleta = {
        latitud: latitude,
        longitud: longitude,
      };

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          direccionInfo = {
            ...direccionInfo,
            ciudad: address.city || address.district || 'Ciudad no disponible',
            provincia: address.region || 'Provincia no disponible',
            pais: address.country || 'País no disponible',
            codigoPostal: address.postalCode || undefined,
            direccion: `${address.streetNumber || ''} ${address.street || ''}`.trim() || undefined,
          };
        }
      } catch (geocodeError) {
        console.warn('Error en geocodificación inversa:', geocodeError);
        // Si falla la geocodificación, usar datos por defecto
        direccionInfo = {
          ...direccionInfo,
          ciudad: 'Santa Fe',
          provincia: 'Santa Fe',
          pais: 'Argentina',
        };
      }

      return direccionInfo;
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      console.log('Usando ubicación por defecto de Santa Fe');
      
      // Ubicación por defecto (Santa Fe Capital)
      return {
        latitud: -31.6333,
        longitud: -60.7,
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        pais: 'Argentina',
      };
    } finally {
      setCargandoUbicacion(false);
    }
  };

  /**
   * Calcular distancia entre dos coordenadas usando la fórmula Haversine
   */
  const calcularDistancia = (coords1: Coordenadas, coords2: Coordenadas): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRad(coords2.latitud - coords1.latitud);
    const dLon = toRad(coords2.longitud - coords1.longitud);
    
    const lat1 = toRad(coords1.latitud);
    const lat2 = toRad(coords2.latitud);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return Math.round(d * 10) / 10; // Redondear a 1 decimal
  };

  /**
   * Convertir grados a radianes
   */
  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  /**
   * Actualizar ubicación manualmente
   */
  const actualizarUbicacion = async (): Promise<void> => {
    const nuevaUbicacion = await obtenerUbicacion();
    if (nuevaUbicacion) {
      setUbicacionActual(nuevaUbicacion);
      setCoordenadas({
        latitud: nuevaUbicacion.latitud,
        longitud: nuevaUbicacion.longitud
      });
    }
  };

  const valor: ContextoUbicacionType = {
    ubicacionActual,
    coordenadas,
    cargandoUbicacion,
    permisoUbicacion,
    errorUbicacion,
    solicitarPermisos,
    obtenerUbicacion,
    calcularDistancia,
    actualizarUbicacion,
  };

  return (
    <ContextoUbicacion.Provider value={valor}>
      {children}
    </ContextoUbicacion.Provider>
  );
}

/**
 * Hook para usar el contexto de ubicación
 */
export function useUbicacion(): ContextoUbicacionType {
  const contexto = useContext(ContextoUbicacion);
  
  if (!contexto) {
    throw new Error('useUbicacion debe ser usado dentro de un ProveedorUbicacion');
  }
  
  return contexto;
}

/**
 * Función utilitaria para formatear distancia
 */
export function formatearDistancia(distancia: number): string {
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  } else if (distancia < 10) {
    return `${distancia.toFixed(1)}km`;
  } else {
    return `${Math.round(distancia)}km`;
  }
}

/**
 * Función utilitaria para determinar si una ubicación está cerca
 */
export function estaUbicacionCerca(
  coordenadas1: Coordenadas,
  coordenadas2: Coordenadas,
  distanciaMaxima: number = 50 // km por defecto
): boolean {
  const distancia = Math.sqrt(
    Math.pow(coordenadas1.latitud - coordenadas2.latitud, 2) +
    Math.pow(coordenadas1.longitud - coordenadas2.longitud, 2)
  ) * 111.32; // Conversión aproximada a km
  
  return distancia <= distanciaMaxima;
}
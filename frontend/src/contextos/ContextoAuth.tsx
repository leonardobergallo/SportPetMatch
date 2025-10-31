// Contexto de Autenticación para SportPetMatch
// Maneja el estado global de autenticación del usuario

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipo para el usuario autenticado
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento: string;
  genero: string;
  ciudad: string;
  provincia: string;
  pais: string;
  biografia?: string;
  foto?: string;
  deportesFavoritos: string[];
  nivelActividad: string;
  disponibilidadSemanal: string[];
}

// Tipo para el contexto de autenticación
interface ContextoAuthType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  cargandoAuth: boolean;
  iniciarSesion: (usuario: Usuario, token: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (datosUsuario: Partial<Usuario>) => void;
}

// Crear el contexto
const ContextoAuth = createContext<ContextoAuthType | null>(null);

// Claves para AsyncStorage
const TOKEN_KEY = '@SportPetMatch:token';
const USER_KEY = '@SportPetMatch:user';

// Proveedor del contexto de autenticación
export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // Verificar si hay sesión guardada al iniciar la app
  useEffect(() => {
    verificarSesionGuardada();
  }, []);

  /**
   * Verificar si hay una sesión guardada en AsyncStorage
   */
  const verificarSesionGuardada = async () => {
    try {
      setCargandoAuth(true);
      const [token, datosUsuario] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);

      if (token && datosUsuario) {
        const usuario: Usuario = JSON.parse(datosUsuario);
        setUsuario(usuario);
      }
    } catch (error) {
      console.error('Error al verificar sesión guardada:', error);
    } finally {
      setCargandoAuth(false);
    }
  };

  /**
   * Iniciar sesión y guardar datos del usuario
   */
  const iniciarSesion = async (datosUsuario: Usuario, token: string) => {
    try {
      // Guardar en AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(datosUsuario))
      ]);

      // Actualizar estado
      setUsuario(datosUsuario);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  /**
   * Cerrar sesión y limpiar datos guardados
   */
  const cerrarSesion = async () => {
    try {
      // Limpiar AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);

      // Limpiar estado
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Actualizar datos del usuario
   */
  const actualizarUsuario = (datosUsuario: Partial<Usuario>) => {
    if (usuario) {
      const usuarioActualizado = { ...usuario, ...datosUsuario };
      setUsuario(usuarioActualizado);
      
      // Guardar en AsyncStorage
      AsyncStorage.setItem(USER_KEY, JSON.stringify(usuarioActualizado))
        .catch((error: any) => console.error('Error al actualizar usuario:', error));
    }
  };

  const valor: ContextoAuthType = {
    usuario,
    estaAutenticado: !!usuario,
    cargandoAuth,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuario
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth(): ContextoAuthType {
  const contexto = useContext(ContextoAuth);
  
  if (!contexto) {
    throw new Error('useAuth debe ser usado dentro de un ProveedorAuth');
  }
  
  return contexto;
}

/**
 * Hook para obtener el token de autenticación
 */
export async function obtenerToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
}
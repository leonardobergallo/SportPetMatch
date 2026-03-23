// Contexto de Autenticación para SportPetMatch
// Maneja el estado global de autenticación del usuario

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnUnauthorized } from '../utilidades/onUnauthorized';

/** En web, volver a la portada principal (Multiverse), no quedar en /?app=1 con login viejo */
function irALandingPrincipalSiWeb(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.location.replace(`${window.location.origin}/`);
  } catch {
    window.location.href = '/';
  }
}

// Tipo para el usuario autenticado
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
  avatar?: string | null;
  biografia?: string | null;
  ubicacionCiudad?: string | null;
  ubicacionPais?: string | null;
  nivelDeporte?: number | null;
  intereses: string[];
  tipoUsuario?: string | null;
  onboardingCompletado?: boolean;
  esPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Alias legacy para no romper pantallas que todavía no se migraron del todo
  apellido?: string;
  genero?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  foto?: string | null;
  deportesFavoritos?: string[];
  nivelActividad?: string;
  disponibilidadSemanal?: string[];
}

export function normalizarUsuario(datos: Partial<Usuario>): Usuario {
  const intereses = datos.intereses ?? datos.deportesFavoritos ?? [];
  const avatar = datos.avatar ?? datos.foto ?? null;
  const ubicacionCiudad = datos.ubicacionCiudad ?? datos.ciudad ?? null;
  const ubicacionPais = datos.ubicacionPais ?? datos.pais ?? null;

  return {
    id: datos.id || '',
    nombre: datos.nombre || '',
    email: datos.email || '',
    telefono: datos.telefono ?? null,
    fechaNacimiento: datos.fechaNacimiento ?? null,
    avatar,
    biografia: datos.biografia ?? null,
    ubicacionCiudad,
    ubicacionPais,
    nivelDeporte: datos.nivelDeporte ?? null,
    intereses,
    tipoUsuario: datos.tipoUsuario ?? null,
    onboardingCompletado: datos.onboardingCompletado ?? false,
    esPremium: datos.esPremium ?? false,
    createdAt: datos.createdAt,
    updatedAt: datos.updatedAt,
    apellido: datos.apellido || '',
    genero: datos.genero || '',
    ciudad: ubicacionCiudad ?? '',
    provincia: datos.provincia || '',
    pais: ubicacionPais ?? '',
    foto: avatar,
    deportesFavoritos: intereses,
    nivelActividad: datos.nivelActividad || 'intermedio',
    disponibilidadSemanal: datos.disponibilidadSemanal ?? [],
  };
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

  // Registrar callback para 401: el apiClient lo invoca para cerrar sesión y mostrar Login
  const cerrarSesionCallback = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      setUsuario(null);
    } catch (e) {
      console.error('Error al cerrar sesión (401):', e);
      setUsuario(null);
    }
  }, []);
  useEffect(() => {
    setOnUnauthorized(cerrarSesionCallback);
    return () => setOnUnauthorized(null);
  }, [cerrarSesionCallback]);

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
        const usuario: Usuario = normalizarUsuario(JSON.parse(datosUsuario));
        setUsuario(usuario);
      }
    } catch (error) {
      console.error('Error al verificar sesión guardada:', error);
      setUsuario(null);
    } finally {
      setCargandoAuth(false);
    }
  };

  /**
   * Iniciar sesión y guardar datos del usuario
   */
  const iniciarSesion = async (datosUsuario: Usuario, token: string) => {
    try {
      const usuarioNormalizado = normalizarUsuario(datosUsuario);

      // Guardar en AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(usuarioNormalizado))
      ]);

      // Actualizar estado
      setUsuario(usuarioNormalizado);
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
      irALandingPrincipalSiWeb();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      irALandingPrincipalSiWeb();
    }
  };

  /**
   * Actualizar datos del usuario
   */
  const actualizarUsuario = (datosUsuario: Partial<Usuario>) => {
    if (usuario) {
      const usuarioActualizado = normalizarUsuario({ ...usuario, ...datosUsuario });
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

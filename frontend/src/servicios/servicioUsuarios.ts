// Servicio de Usuarios - SportPetMatch
// Maneja operaciones relacionadas con usuarios

import apiClient from './apiClient';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  fechaNacimiento?: string | null;
  telefono?: string | null;
  avatar?: string | null;
  biografia?: string | null;
  ubicacionLat?: number | null;
  ubicacionLng?: number | null;
  ubicacionCiudad?: string | null;
  ubicacionPais?: string | null;
  nivelDeporte?: number;
  intereses?: string[];
  tipoUsuario?: string | null;
  onboardingCompletado?: boolean;
  esPremium: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatosActualizacionUsuario {
  nombre?: string;
  telefono?: string;
  avatar?: string;
  biografia?: string;
  ubicacionLat?: number;
  ubicacionLng?: number;
  ubicacionCiudad?: string;
  ubicacionPais?: string;
  nivelDeporte?: number;
  intereses?: string[];
  tipoUsuario?: string;
  onboardingCompletado?: boolean;
}

/**
 * Obtener mi perfil
 */
export async function obtenerMiPerfil(): Promise<Usuario> {
  const response = await apiClient.get<{ success: boolean; data: Usuario }>('/usuarios/mi-perfil');
  return response.data.data;
}

/**
 * Actualizar mi perfil
 */
export async function actualizarMiPerfil(datos: DatosActualizacionUsuario): Promise<Usuario> {
  const response = await apiClient.put<{ success: boolean; data: Usuario; message: string }>(
    '/usuarios/mi-perfil',
    datos
  );
  return response.data.data;
}

/**
 * Cambiar contraseña
 */
export async function cambiarContraseña(contraseñaActual: string, nuevaContraseña: string): Promise<void> {
  await apiClient.put('/usuarios/mi-perfil/cambiar-contraseña', {
    contraseñaActual,
    nuevaContraseña,
  });
}

/**
 * Obtener usuario por ID (público)
 */
export async function obtenerUsuario(id: string): Promise<Usuario> {
  const response = await apiClient.get<{ success: boolean; data: Usuario }>(`/usuarios/${id}`);
  return response.data.data;
}



// Servicio de Autenticación - SportPetMatch
// Maneja login, registro y autenticación

import apiClient from './apiClient';

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  fechaNacimiento?: string;
  telefono?: string;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface RespuestaResetPassword {
  success: boolean;
  message: string;
  data?: {
    email?: string;
    resetToken?: string;
    resetUrl?: string;
  };
}

export interface UsuarioAuth {
  id: string;
  email: string;
  nombre: string;
  avatar?: string | null;
  esPremium: boolean;
  onboardingCompletado?: boolean;
  tipoUsuario?: string | null;
  intereses?: string[];
  createdAt?: string;
}

export interface RespuestaAuth {
  success: boolean;
  message: string;
  data: {
    usuario: UsuarioAuth;
    token: string;
    refreshToken?: string;
  };
}

export interface DatosDashboard {
  usuario: UsuarioAuth;
  estadisticas: {
    eventosParticipados: number;
    mascotasRegistradas: number;
    matchesRealizados: number;
    puntosGamificacion?: number;
  };
  eventosRecientes: Array<{
    id: string;
    titulo: string;
    fecha: string;
    tipo?: string;
  }>;
  mascotasFavoritas: Array<{
    id: string;
    nombre: string;
    tipo: string;
    raza?: string;
    foto?: string | null;
  }>;
  matchesRecientes: Array<{
    id: string;
    usuario: string;
    fecha: string;
    estado?: string;
  }>;
}

/**
 * Registrar un nuevo usuario
 */
export async function registrarUsuario(datos: DatosRegistro): Promise<RespuestaAuth> {
  const response = await apiClient.post<RespuestaAuth>('/auth/registro', datos);
  return response.data;
}

/**
 * Iniciar sesión
 */
export async function iniciarSesion(datos: DatosLogin): Promise<RespuestaAuth> {
  const response = await apiClient.post<RespuestaAuth>('/auth/login', datos);
  return response.data;
}

export async function solicitarResetPassword(email: string): Promise<RespuestaResetPassword> {
  const response = await apiClient.post<RespuestaResetPassword>('/auth/recuperar-password', { email });
  return response.data;
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
    token,
    password,
  });
  return response.data;
}

/**
 * Obtener datos del dashboard
 */
export async function obtenerDashboard(): Promise<DatosDashboard> {
  const response = await apiClient.get<{ success: boolean; data: DatosDashboard }>('/auth/dashboard');
  return response.data.data;
}

/**
 * Cambiar la contraseña del usuario autenticado (pide la actual)
 */
export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>('/auth/cambiar-password', {
    passwordActual,
    passwordNueva,
  });
  return response.data;
}

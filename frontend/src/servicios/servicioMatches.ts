// Servicio de Matches - SportPetMatch
// Maneja operaciones relacionadas con matches y recomendaciones

import apiClient from './apiClient';

export interface UsuarioRecomendado {
  id: string;
  nombre: string;
  avatar: string | null;
  biografia: string | null;
  ubicacionLat: number | null;
  ubicacionLng: number | null;
  ubicacionCiudad: string | null;
  intereses: string[];
  tipoUsuario: string | null;
  nivelDeporte: number;
  mascotas: Array<{
    nombre: string;
    tipo: string;
    fotos: string[];
    intereses: string[];
  }>;
  score: number;
  interesesComunes: number;
  distancia: number | null;
}

export interface EventoRecomendado {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  nivelDificultad: number;
  fechaInicio: string;
  fechaFin: string | null;
  duracion: number | null;
  maxParticipantes: number | null;
  precio: number | null;
  esPetFriendly: boolean;
  esPremium: boolean;
  organizador: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
  participantesCount: number;
  score: number;
  distancia: number | null;
}

export interface Match {
  id: string;
  estado: string;
  fechaMatch: string;
  mensajeInicial: string | null;
  eventoPropuestoId: string | null;
  usuarioId: string;
  usuarioMatchId: string;
  usuario: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
  usuarioMatch: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
  eventoPropuesto?: {
    id: string;
    titulo: string;
    fechaInicio: string;
  } | null;
}

/**
 * Obtener usuarios recomendados
 */
export async function obtenerRecomendaciones(): Promise<UsuarioRecomendado[]> {
  const response = await apiClient.get<{ success: boolean; data: UsuarioRecomendado[] }>('/matches/recomendaciones');
  return response.data.data;
}

/**
 * Obtener mis matches
 */
export async function obtenerMisMatches(): Promise<Match[]> {
  const response = await apiClient.get<{ success: boolean; data: Match[] }>('/matches');
  return response.data.data;
}

/**
 * Crear un match
 */
export async function crearMatch(datos: {
  usuarioMatchId: string;
  mensajeInicial?: string;
  eventoPropuestoId?: string;
}): Promise<Match> {
  const response = await apiClient.post<{ success: boolean; data: Match }>('/matches', datos);
  return response.data.data;
}

/**
 * Responder a un match (aceptar o rechazar)
 */
export async function responderMatch(matchId: string, accion: 'aceptar' | 'rechazar'): Promise<Match> {
  const response = await apiClient.put<{ success: boolean; data: Match }>(`/matches/${matchId}/respuesta`, { accion });
  return response.data.data;
}

/**
 * Obtener eventos recomendados
 */
export async function obtenerRecomendacionesEventos(): Promise<EventoRecomendado[]> {
  const response = await apiClient.get<{ success: boolean; data: EventoRecomendado[] }>('/matches/eventos/recomendaciones');
  return response.data.data;
}

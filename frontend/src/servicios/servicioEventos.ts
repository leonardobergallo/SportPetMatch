// Servicio de Eventos - SportPetMatch
// Maneja operaciones CRUD de eventos y participación

import apiClient from './apiClient';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  nivelDificultad: number;
  fechaInicio: string;
  fechaFin?: string | null;
  duracion?: number | null;
  maxParticipantes?: number | null;
  precio?: number | null;
  esPetFriendly: boolean;
  esPremium: boolean;
  isActive: boolean;
  organizadorId: string;
  organizador?: {
    id: string;
    nombre: string;
    avatar?: string | null;
  };
  participantesCount?: number;
  participantesIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatosCrearEvento {
  titulo: string;
  descripcion: string;
  tipo: string;
  nivelDificultad?: number;
  fechaInicio: string;
  fechaFin?: string;
  duracion?: number;
  maxParticipantes?: number;
  precio?: number;
  esPetFriendly?: boolean;
  esPremium?: boolean;
}

export interface FiltrosEventos {
  tipo?: string;
  ciudad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  esPetFriendly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Obtener todos los eventos (con filtros opcionales)
 */
export async function obtenerEventos(filtros?: FiltrosEventos): Promise<Evento[]> {
  const params = new URLSearchParams();
  
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = queryString ? `/eventos?${queryString}` : '/eventos';
  
  const response = await apiClient.get<{ success: boolean; data: Evento[] }>(url);
  return response.data.data;
}

/**
 * Obtener un evento por ID
 */
export async function obtenerEvento(id: string): Promise<Evento> {
  const response = await apiClient.get<{ success: boolean; data: Evento }>(`/eventos/${id}`);
  return response.data.data;
}

/**
 * Crear un nuevo evento
 */
export async function crearEvento(datos: DatosCrearEvento): Promise<Evento> {
  const response = await apiClient.post<{ success: boolean; data: Evento; message: string }>(
    '/eventos',
    datos
  );
  return response.data.data;
}

/**
 * Actualizar un evento
 */
export async function actualizarEvento(id: string, datos: Partial<DatosCrearEvento>): Promise<Evento> {
  const response = await apiClient.put<{ success: boolean; data: Evento; message: string }>(
    `/eventos/${id}`,
    datos
  );
  return response.data.data;
}

/**
 * Eliminar un evento
 */
export async function eliminarEvento(id: string): Promise<void> {
  await apiClient.delete(`/eventos/${id}`);
}

/**
 * Unirse a un evento
 */
export async function participarEnEvento(id: string): Promise<void> {
  await apiClient.post(`/eventos/${id}/participar`);
}

/**
 * Salir de un evento
 */
export async function salirDeEvento(id: string): Promise<void> {
  await apiClient.delete(`/eventos/${id}/participar`);
}



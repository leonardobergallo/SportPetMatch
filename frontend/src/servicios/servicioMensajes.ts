// Servicio de Mensajes - SportPetMatch
// Maneja operaciones relacionadas con mensajes de chat

import apiClient from './apiClient';

export interface Mensaje {
  id: string;
  contenido: string;
  tipo: string;
  urlArchivo: string | null;
  isLeido: boolean;
  createdAt: string;
  usuario: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
}

export interface MensajesNoLeidos {
  matchId: string;
  noLeidos: number;
}

/**
 * Obtener mensajes de un match/conversación
 */
export async function obtenerMensajes(matchId: string): Promise<Mensaje[]> {
  const response = await apiClient.get<{ success: boolean; data: Mensaje[] }>(`/mensajes/${matchId}`);
  return response.data.data;
}

/**
 * Enviar un mensaje en un match/conversación
 */
export async function enviarMensaje(datos: {
  matchId: string;
  contenido: string;
  tipo?: string;
  urlArchivo?: string;
}): Promise<Mensaje> {
  const response = await apiClient.post<{ success: boolean; data: Mensaje }>('/mensajes', datos);
  return response.data.data;
}

/**
 * Marcar mensajes como leídos
 */
export async function marcarComoLeido(matchId: string): Promise<{ mensajesActualizados: number }> {
  const response = await apiClient.put<{ success: boolean; data: { mensajesActualizados: number } }>('/mensajes/leer', {
    matchId,
  });
  return response.data.data;
}

/**
 * Obtener cantidad de mensajes no leídos por match
 */
export async function obtenerMensajesNoLeidos(): Promise<MensajesNoLeidos[]> {
  const response = await apiClient.get<{ success: boolean; data: MensajesNoLeidos[] }>('/mensajes/no-leidos/cantidad');
  return response.data.data;
}


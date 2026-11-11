// Servicio de paseadores de mascotas.
import apiClient from './apiClient';

export type EstadoPaseador = 'pendiente' | 'aprobado' | 'rechazado';

export interface Paseador {
  id: string;
  telefono: string;
  ciudad: string;
  zona?: string | null;
  experiencia?: string | null;
  precioHora?: number | null;
  disponibilidad?: string | null;
  mensaje?: string | null;
  estado: EstadoPaseador;
  motivoRechazo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatosPaseador {
  telefono: string;
  ciudad: string;
  zona?: string;
  experiencia?: string;
  precioHora?: string;
  disponibilidad?: string;
  mensaje?: string;
}

export async function obtenerMiPaseador(): Promise<Paseador | null> {
  const response = await apiClient.get<{ paseador: Paseador | null }>('/paseadores/mi');
  return response.data.paseador;
}

export async function enviarSolicitudPaseador(
  datos: DatosPaseador
): Promise<{ paseador: Paseador; message: string }> {
  const response = await apiClient.post<{ paseador: Paseador; message: string }>('/paseadores', datos);
  return response.data;
}

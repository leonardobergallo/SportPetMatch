// Servicio de paseos con seguimiento GPS.
import apiClient from './apiClient';

export type EstadoPaseo =
  | 'pendiente'
  | 'aceptado'
  | 'en_curso'
  | 'finalizado'
  | 'rechazado'
  | 'cancelado';

export interface UsuarioPaseo {
  id: string;
  nombre: string;
  email?: string | null;
  avatar?: string | null;
  telefono?: string | null;
  ubicacionCiudad?: string | null;
}

export interface PaseadorPaseo {
  id: string;
  usuarioId: string;
  telefono: string;
  ciudad: string;
  zona?: string | null;
  precioHora?: number | null;
  disponibilidad?: string | null;
  estado: string;
  usuario: UsuarioPaseo;
  /** Los paseadores de ejemplo se muestran cuando la base todavía no tiene datos reales. */
  esDemo?: boolean;
}

export interface MascotaPaseo {
  id: string;
  nombre: string;
  tipo: string;
  raza?: string | null;
  fotos: string[];
}

export interface Paseo {
  id: string;
  duenoId: string;
  paseadorId?: string | null;
  mascotaId: string;
  estado: EstadoPaseo;
  fechaProgramada: string;
  duracionMin: number;
  direccion?: string | null;
  notas?: string | null;
  precioHora?: number | null;
  inicioEn?: string | null;
  finEn?: string | null;
  distanciaKm?: number | null;
  duracionRealMin?: number | null;
  createdAt: string;
  updatedAt: string;
  dueno: UsuarioPaseo;
  paseador?: PaseadorPaseo | null;
  mascota: MascotaPaseo;
  _count?: { puntos: number };
}

export interface PuntoPaseo {
  id: string;
  latitud: number;
  longitud: number;
  precision?: number | null;
  createdAt: string;
}

export interface RecorridoPaseo {
  estado: EstadoPaseo;
  inicioEn?: string | null;
  finEn?: string | null;
  distanciaKm: number;
  duracionRealMin: number;
  puntos: PuntoPaseo[];
}

export interface DatosPaseo {
  paseadorId: string;
  mascotaId: string;
  fechaProgramada: string;
  duracionMin: number;
  direccion?: string;
  notas?: string;
}

export async function obtenerPaseadoresDisponibles(): Promise<PaseadorPaseo[]> {
  const response = await apiClient.get<{ paseadores: PaseadorPaseo[] }>('/paseadores');
  return response.data.paseadores;
}

export async function crearPaseo(datos: DatosPaseo): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>('/paseos', datos);
  return response.data.paseo;
}

export async function obtenerMisPaseos(): Promise<Paseo[]> {
  const response = await apiClient.get<{ paseos: Paseo[] }>('/paseos/mios');
  return response.data.paseos;
}

export async function obtenerPaseosAsignados(): Promise<Paseo[]> {
  const response = await apiClient.get<{ paseos: Paseo[] }>('/paseos/asignados');
  return response.data.paseos;
}

export async function obtenerPaseo(id: string): Promise<{ paseo: Paseo; rol: 'dueno' | 'paseador' | 'admin' }> {
  const response = await apiClient.get<{ paseo: Paseo; rol: 'dueno' | 'paseador' | 'admin' }>(`/paseos/${id}`);
  return response.data;
}

export async function obtenerRecorrido(id: string): Promise<RecorridoPaseo> {
  const response = await apiClient.get<RecorridoPaseo>(`/paseos/${id}/recorrido`);
  return response.data;
}

export async function aceptarPaseo(id: string): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>(`/paseos/${id}/aceptar`, {});
  return response.data.paseo;
}

export async function rechazarPaseo(id: string): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>(`/paseos/${id}/rechazar`, {});
  return response.data.paseo;
}

export async function iniciarPaseo(id: string): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>(`/paseos/${id}/iniciar`, {});
  return response.data.paseo;
}

export async function enviarPuntoPaseo(
  id: string,
  latitud: number,
  longitud: number,
  precision?: number | null
): Promise<number> {
  const response = await apiClient.post<{ ok: boolean; total: number }>(`/paseos/${id}/punto`, {
    latitud,
    longitud,
    precision,
  });
  return response.data.total;
}

export async function finalizarPaseo(id: string): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>(`/paseos/${id}/finalizar`, {});
  return response.data.paseo;
}

export async function cancelarPaseo(id: string): Promise<Paseo> {
  const response = await apiClient.post<{ paseo: Paseo }>(`/paseos/${id}/cancelar`, {});
  return response.data.paseo;
}

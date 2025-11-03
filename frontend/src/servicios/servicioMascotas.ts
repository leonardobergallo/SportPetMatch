// Servicio de Mascotas - SportPetMatch
// Maneja operaciones CRUD de mascotas

import apiClient from './apiClient';

export interface Mascota {
  id: string;
  nombre: string;
  tipo: string;
  raza?: string | null;
  edad?: number | null;
  peso?: number | null;
  altura?: number | null;
  color?: string | null;
  genero?: string | null;
  esterilizado?: boolean | null;
  vacunas: string[];
  alergias: string[];
  personalidad: string[];
  nivelActividad: number;
  intereses: string[];
  fotos: string[];
  salud?: string | null;
  veterinario?: string | null;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatosCrearMascota {
  nombre: string;
  tipo: string;
  raza?: string;
  edad?: number;
  peso?: number;
  altura?: number;
  color?: string;
  genero?: string;
  esterilizado?: boolean;
  vacunas?: string[];
  alergias?: string[];
  personalidad?: string[];
  nivelActividad?: number;
  intereses?: string[];
  fotos?: string[];
  salud?: string;
  veterinario?: string;
}

/**
 * Obtener todas mis mascotas
 */
export async function obtenerMisMascotas(): Promise<Mascota[]> {
  const response = await apiClient.get<{ success: boolean; data: Mascota[] }>('/mascotas');
  return response.data.data;
}

/**
 * Obtener una mascota por ID
 */
export async function obtenerMascota(id: string): Promise<Mascota> {
  const response = await apiClient.get<{ success: boolean; data: Mascota }>(`/mascotas/${id}`);
  return response.data.data;
}

/**
 * Crear una nueva mascota
 */
export async function crearMascota(datos: DatosCrearMascota): Promise<Mascota> {
  const response = await apiClient.post<{ success: boolean; data: Mascota; message: string }>(
    '/mascotas',
    datos
  );
  return response.data.data;
}

/**
 * Actualizar una mascota
 */
export async function actualizarMascota(id: string, datos: Partial<DatosCrearMascota>): Promise<Mascota> {
  const response = await apiClient.put<{ success: boolean; data: Mascota; message: string }>(
    `/mascotas/${id}`,
    datos
  );
  return response.data.data;
}

/**
 * Eliminar una mascota
 */
export async function eliminarMascota(id: string): Promise<void> {
  await apiClient.delete(`/mascotas/${id}`);
}



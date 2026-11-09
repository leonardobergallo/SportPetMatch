// Servicio de Lugares pet friendly - Indio
// Lista lugares recomendados por zona y envia sugerencias de la comunidad.

import apiClient from './apiClient';

export type CategoriaLugar =
  | 'parque'
  | 'plaza'
  | 'paseo'
  | 'cafeteria'
  | 'restaurante'
  | 'bar'
  | 'veterinaria'
  | 'pet_shop'
  | 'alojamiento'
  | 'playa'
  | 'otro';

export interface LugarPetFriendly {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string | null;
  categoria: CategoriaLugar;
  direccion?: string | null;
  ciudad: string;
  provincia: string;
  pais: string;
  latitud: number;
  longitud: number;
  telefono?: string | null;
  web?: string | null;
  instagram?: string | null;
  horarios?: Record<string, unknown> | null;
  fotos: string[];
  permitePerros: boolean;
  zonaPetFriendly: 'interior' | 'exterior' | 'ambos' | string;
  requiereCorrea: boolean;
  aguaParaMascotas: boolean;
  verificado: boolean;
  destacado: boolean;
  fuente: 'manual' | 'comunidad' | 'osm' | string;
  recomendaciones: number;
  distanciaKm?: number;
}

export interface ZonaLugar {
  provincia: string;
  ciudad: string;
}

export interface FiltrosLugares {
  provincia?: string;
  ciudad?: string;
  categoria?: CategoriaLugar | 'todos';
  buscar?: string;
  lat?: number;
  lng?: number;
  radio?: number;
  limit?: number;
  offset?: number;
}

export interface RespuestaLugares {
  lugares: LugarPetFriendly[];
  total: number;
  zonas: ZonaLugar[];
}

export interface DatosSugerirLugar {
  nombre: string;
  descripcion?: string;
  categoria: CategoriaLugar;
  direccion?: string;
  ciudad: string;
  provincia: string;
  latitud: number;
  longitud: number;
  telefono?: string;
  web?: string;
  instagram?: string;
  zonaPetFriendly?: 'interior' | 'exterior' | 'ambos';
  requiereCorrea?: boolean;
  aguaParaMascotas?: boolean;
}

/**
 * Obtener lugares pet friendly con filtros opcionales.
 * Si se envian lat/lng, el backend calcula la distancia y ordena por cercania.
 */
export async function obtenerLugares(filtros?: FiltrosLugares): Promise<RespuestaLugares> {
  const params: Record<string, string | number> = {};

  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value as string | number;
      }
    });
  }

  const response = await apiClient.get<{ success: boolean; data: RespuestaLugares }>('/lugares', {
    params,
  });

  return response.data.data;
}

/**
 * Obtener un lugar por ID o slug.
 */
export async function obtenerLugar(idOSlug: string): Promise<LugarPetFriendly> {
  const response = await apiClient.get<{ success: boolean; data: LugarPetFriendly }>(
    `/lugares/${idOSlug}`
  );
  return response.data.data;
}

/**
 * Enviar una sugerencia de lugar. Requiere sesion iniciada.
 */
export async function sugerirLugar(datos: DatosSugerirLugar): Promise<LugarPetFriendly> {
  const response = await apiClient.post<{
    success: boolean;
    data: LugarPetFriendly;
    message: string;
  }>('/lugares/sugerencias', datos);

  return response.data.data;
}

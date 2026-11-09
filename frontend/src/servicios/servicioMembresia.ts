// Servicio de Membresía Indio
// Mes gratis y renovaciones manuales con link de Mercado Pago.

import apiClient from './apiClient';

export interface PeriodoMembresia {
  id: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface RenovacionMembresia {
  id: string;
  monto: number;
  moneda: string;
  estado: string;
  enlacePagoIndio?: string | null;
  fechaCompra: string;
  createdAt: string;
}

export interface RespuestaMembresia {
  periodo: PeriodoMembresia | null;
  renovaciones: RenovacionMembresia[];
  puedeActivarPrueba: boolean;
  precio: number;
}

export interface ResultadoPrueba {
  fechaFin: string;
  correoEnviado: boolean;
}

export interface ResultadoRenovacion {
  id: string;
}

export async function obtenerMembresia(): Promise<RespuestaMembresia> {
  const response = await apiClient.get<RespuestaMembresia>('/membresia');
  return response.data;
}

export async function activarPrueba(): Promise<ResultadoPrueba> {
  const response = await apiClient.post<ResultadoPrueba>('/membresia/prueba');
  return response.data;
}

export async function solicitarRenovacion(): Promise<ResultadoRenovacion> {
  const response = await apiClient.post<ResultadoRenovacion>('/membresia/renovaciones');
  return response.data;
}

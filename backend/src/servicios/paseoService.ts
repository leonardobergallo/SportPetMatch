// Utilidades compartidas para paseos y seguimiento GPS.
import prisma from '../utilidades/prisma';

export const RETENCION_GPS_DIAS = 30;
const INTERVALO_LIMPIEZA_GPS_MS = 60 * 60 * 1000;

export function limiteRetencionGps(ahora = new Date()): Date {
  return new Date(ahora.getTime() - RETENCION_GPS_DIAS * 24 * 60 * 60 * 1000);
}

export function eliminarPuntosGpsVencidos(ahora = new Date()) {
  return prisma.paseoPunto.deleteMany({
    where: { createdAt: { lt: limiteRetencionGps(ahora) } },
  });
}

export function iniciarLimpiezaGps(): void {
  const limpiar = () => {
    eliminarPuntosGpsVencidos().catch((error: unknown) => {
      console.error('[paseos] No se pudieron eliminar los puntos GPS vencidos:', error);
    });
  };
  limpiar();
  setInterval(limpiar, INTERVALO_LIMPIEZA_GPS_MS).unref();
}

export const usuarioMini = {
  select: {
    id: true,
    nombre: true,
    email: true,
    avatar: true,
    telefono: true,
    ubicacionCiudad: true,
  },
};

export const paseadorMini = {
  select: {
    id: true,
    usuarioId: true,
    telefono: true,
    ciudad: true,
    zona: true,
    precioHora: true,
    disponibilidad: true,
    estado: true,
    usuario: usuarioMini,
  },
};

export const mascotaMini = {
  select: {
    id: true,
    nombre: true,
    tipo: true,
    raza: true,
    fotos: true,
  },
};

export const paseoInclude = {
  dueno: usuarioMini,
  paseador: paseadorMini,
  mascota: mascotaMini,
  _count: { select: { puntos: true } },
};

export async function cargarPaseo(id: string) {
  return prisma.paseo.findUnique({
    where: { id },
    include: paseoInclude,
  });
}

export function distanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcularResumen(
  puntos: Array<{ latitud: number; longitud: number; createdAt: Date }>
) {
  if (puntos.length === 0) {
    return { distanciaKm: 0, duracionMin: 0, puntos: 0 };
  }
  let distancia = 0;
  for (let i = 1; i < puntos.length; i += 1) {
    distancia += distanciaKm(
      puntos[i - 1].latitud,
      puntos[i - 1].longitud,
      puntos[i].latitud,
      puntos[i].longitud
    );
  }
  const inicio = puntos[0].createdAt.getTime();
  const fin = puntos[puntos.length - 1].createdAt.getTime();
  return {
    distanciaKm: Number(distancia.toFixed(3)),
    duracionMin: Math.max(0, Math.round((fin - inicio) / 60000)),
    puntos: puntos.length,
  };
}

export function esPaseoActivo(estado: string): boolean {
  return estado === 'aceptado' || estado === 'en_curso';
}

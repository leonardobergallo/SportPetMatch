import { Prisma } from '@prisma/client';

export const PRECIO_MEMBRESIA = 15900;
export const PRUEBA_INDIO = 'indio_prueba';
export const MENSUAL_INDIO = 'indio_mensual';
export const COMPRA_INDIO = 'indio_renovacion';

export function sumarMes(fecha: Date): Date {
  const resultado = new Date(fecha);
  const dia = resultado.getUTCDate();
  resultado.setUTCDate(1);
  resultado.setUTCMonth(resultado.getUTCMonth() + 1);
  const ultimo = new Date(resultado);
  ultimo.setUTCMonth(ultimo.getUTCMonth() + 1, 0);
  resultado.setUTCDate(Math.min(dia, ultimo.getUTCDate()));
  return resultado;
}

export function esConflictoUnico(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function enlaceMercadoPago(valor: unknown): string | null {
  if (typeof valor !== 'string' || valor.length > 2048) return null;
  try {
    const url = new URL(valor);
    const dominios = ['mpago.la', 'mercadopago.com.ar', 'www.mercadopago.com.ar', 'link.mercadopago.com.ar'];
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !dominios.includes(url.hostname) || url.pathname === '/') return null;
    return url.href;
  } catch {
    return null;
  }
}

// Recordatorios de vencimiento de la Membresía Indio.
// Revisa cada hora y envía un correo 7 días antes y el último día.
// Usa los campos avisoVencimientoEn / avisoUltimoDiaEn para no duplicar envíos.
import prisma from '../utilidades/prisma';
import { enviarCorreoMembresia } from './correoService';
import { MENSUAL_INDIO, PRUEBA_INDIO } from './membresiaService';

const INTERVALO_MS = 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_AVISO_POR_DEFECTO = 7;

export function diasRestantes(fechaFin: Date, ahora = new Date()): number {
  return Math.max(1, Math.ceil((fechaFin.getTime() - ahora.getTime()) / DIA_MS));
}

function fechaLarga(fecha: Date): string {
  return fecha.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function iniciarRecordatoriosMembresia(): void {
  if (process.env.RECORDATORIOS_MEMBRESIA_ACTIVO === 'false') {
    console.log('[membresia] Recordatorios desactivados por RECORDATORIOS_MEMBRESIA_ACTIVO=false');
    return;
  }

  const diasAvisoConfigurados = Number.parseInt(
    process.env.RECORDATORIO_MEMBRESIA_DIAS || String(DIAS_AVISO_POR_DEFECTO),
    10
  );
  const diasAviso = Number.isFinite(diasAvisoConfigurados)
    ? Math.min(30, Math.max(2, diasAvisoConfigurados))
    : DIAS_AVISO_POR_DEFECTO;
  let ejecutando = false;

  const revisar = async () => {
    if (ejecutando) return;
    ejecutando = true;
    try {
      const ahora = new Date();
      const limite = new Date(ahora.getTime() + diasAviso * DIA_MS);
      const porVencer = await prisma.suscripcion.findMany({
        where: {
          tipo: { in: [PRUEBA_INDIO, MENSUAL_INDIO] },
          estado: 'activa',
          fechaFin: { gt: ahora, lte: limite },
        },
        select: {
          id: true,
          fechaFin: true,
          usuarioId: true,
          avisoVencimientoEn: true,
          avisoUltimoDiaEn: true,
          usuario: { select: { nombre: true, email: true } },
        },
      });

      for (const periodo of porVencer) {
        const dias = diasRestantes(periodo.fechaFin, ahora);
        const ultimoDia = dias <= 1;
        if (ultimoDia ? periodo.avisoUltimoDiaEn : periodo.avisoVencimientoEn) {
          continue;
        }

        // Si ya tiene otro período activo con vencimiento posterior, ya renovó.
        const renovado = await prisma.suscripcion.count({
          where: {
            usuarioId: periodo.usuarioId,
            tipo: { in: [PRUEBA_INDIO, MENSUAL_INDIO] },
            estado: 'activa',
            fechaFin: { gt: periodo.fechaFin },
          },
        });
        if (renovado > 0) continue;

        // Marcar antes de enviar para evitar duplicados si hay más de una instancia.
        const reclamo = ultimoDia
          ? await prisma.suscripcion.updateMany({
            where: { id: periodo.id, avisoUltimoDiaEn: null },
            data: { avisoUltimoDiaEn: ahora },
          })
          : await prisma.suscripcion.updateMany({
            where: { id: periodo.id, avisoVencimientoEn: null },
            data: { avisoVencimientoEn: ahora },
          });
        if (reclamo.count === 0) continue;

        const base = (process.env.FRONTEND_URL || 'https://indio.com.ar').replace(/\/+$/, '');
        const vence = fechaLarga(periodo.fechaFin);
        const asunto = ultimoDia
          ? 'Último día de tu Membresía Indio'
          : `Tu Membresía Indio vence en ${dias} días`;
        const texto = [
          `Hola ${periodo.usuario.nombre},`,
          '',
          ultimoDia
            ? `Hoy es el último día de tu Membresía Indio (vence el ${vence}).`
            : `Tu Membresía Indio vence el ${vence}, en ${dias} días.`,
          'Para seguir usando tu perfil de paseador y los beneficios de la membresía, renová desde Mi suscripción:',
          `${base}/suscripcion.html`,
          '',
          'Si ya pediste el enlace de pago, podés completar la renovación desde esa misma página.',
          'El pago se confirma manualmente, por eso conviene renovar con unos días de anticipación.',
        ].join('\n');

        const enviado = await enviarCorreoMembresia(
          ultimoDia ? 'recordatorio_1d' : 'recordatorio_7d',
          periodo.id,
          periodo.usuario.email,
          asunto,
          texto
        );

        if (enviado) {
          console.log(`[membresia] Recordatorio ${ultimoDia ? 'de último día' : `de ${dias} días`} enviado a ${periodo.usuario.email}`);
        } else {
          // Liberar el aviso para reintentar en la próxima revisión.
          if (ultimoDia) {
            await prisma.suscripcion.updateMany({
              where: { id: periodo.id, avisoUltimoDiaEn: ahora },
              data: { avisoUltimoDiaEn: null },
            });
          } else {
            await prisma.suscripcion.updateMany({
              where: { id: periodo.id, avisoVencimientoEn: ahora },
              data: { avisoVencimientoEn: null },
            });
          }
          console.error(`[membresia] No se pudo enviar el recordatorio a ${periodo.usuario.email}`);
        }
      }
    } catch (error: any) {
      console.error('[membresia] Error en recordatorios:', error?.message || error);
    } finally {
      ejecutando = false;
    }
  };

  // Esperamos a que el servidor termine de arrancar.
  setTimeout(revisar, 45 * 1000);
  const timer = setInterval(revisar, INTERVALO_MS);
  if (typeof timer.unref === 'function') timer.unref();

  console.log(`[membresia] Recordatorios activos: ${diasAviso} días antes y el último día`);
}

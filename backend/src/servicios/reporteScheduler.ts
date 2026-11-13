// Scheduler del reporte diario de Indio.
// Revisa cada pocos minutos y envía una sola vez por día a la hora configurada
// (por defecto 08:00 de Argentina). Registra el envío para no duplicar.
import prisma from '../utilidades/prisma';
import {
  enviarReporteDiario,
  fechaArgentina,
  horaArgentina,
} from './reporteService';

const INTERVALO_MS = 10 * 60 * 1000;
const REINTENTO_MS = 30 * 60 * 1000;

export function iniciarSchedulerReportes(): void {
  if (process.env.REPORTE_DIARIO_ACTIVO === 'false') {
    console.log('[reportes] Reporte diario desactivado por REPORTE_DIARIO_ACTIVO=false');
    return;
  }

  const horaObjetivo = Math.min(
    23,
    Math.max(0, Number.parseInt(process.env.REPORTE_HORA || '8', 10) || 8)
  );
  let ejecutando = false;

  const revisar = async () => {
    if (ejecutando) return;
    ejecutando = true;
    try {
      const ahora = new Date();
      if (horaArgentina(ahora) < horaObjetivo) return;

      const fecha = fechaArgentina(ahora);
      const previo = await prisma.reporteEnvio.findUnique({
        where: { tipo_fecha: { tipo: 'diario', fecha } },
      });
      if (previo?.ok) return;
      if (
        previo &&
        !previo.ok &&
        ahora.getTime() - previo.enviadoEn.getTime() < REINTENTO_MS
      ) {
        return;
      }

      const resultado = await enviarReporteDiario();
      await prisma.reporteEnvio.upsert({
        where: { tipo_fecha: { tipo: 'diario', fecha } },
        create: {
          tipo: 'diario',
          fecha,
          ok: resultado.ok,
          detalle: resultado.motivo ?? null,
        },
        update: {
          ok: resultado.ok,
          detalle: resultado.motivo ?? null,
          enviadoEn: new Date(),
        },
      });

      if (resultado.ok) {
        console.log(`[reportes] Reporte diario ${fecha} enviado a IT360`);
      } else {
        console.error(`[reportes] No se pudo enviar el reporte ${fecha}: ${resultado.motivo}`);
      }
    } catch (error: any) {
      console.error('[reportes] Error en el scheduler:', error?.message || error);
    } finally {
      ejecutando = false;
    }
  };

  // Esperamos un poco para que el servidor termine de arrancar.
  setTimeout(revisar, 30 * 1000);
  const timer = setInterval(revisar, INTERVALO_MS);
  if (typeof timer.unref === 'function') timer.unref();

  console.log(
    `[reportes] Reporte diario activo a las ${horaObjetivo}:00 (hora Argentina)`
  );
}

// Reporte diario de actividad de Indio, enviado por Resend a IT360.
import prisma from '../utilidades/prisma';
import { COMPRA_INDIO, PRUEBA_INDIO } from './membresiaService';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_POR_DEFECTO = 'it360tecnologia@gmail.com';

// Evita tomar como válidos los placeholders que vienen en config.env.
export function resendConfigurado(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  return Boolean(apiKey && from && !/^tu_/i.test(apiKey) && !/^tu_/i.test(from));
}

export function fechaArgentina(fecha = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha);
}

export function horaArgentina(fecha = new Date()): number {
  const hora = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    hour12: false,
  }).format(fecha);
  return Number.parseInt(hora, 10);
}

export interface DatosReporteDiario {
  generadoEn: Date;
  fecha: string;
  periodo: {
    usuarios: number;
    mascotas: number;
    eventos: number;
    lugares: number;
    paseadores: number;
    paseos: number;
    paseosFinalizados: number;
    paseosCancelados: number;
    pruebas: number;
    renovacionesConfirmadas: number;
  };
  totales: {
    usuarios: number;
    mascotas: number;
    eventos: number;
    lugares: number;
    paseadoresAprobados: number;
    paseadoresPendientes: number;
    paseosActivos: number;
    paseos: number;
    matches: number;
    mensajes: number;
  };
  membresias: {
    renovacionesPendientes: number;
  };
}

export async function generarDatosReporte(): Promise<DatosReporteDiario> {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  const [
    usuariosNuevos,
    mascotasNuevas,
    eventosNuevos,
    lugaresNuevos,
    paseadoresNuevos,
    paseosNuevos,
    paseosFinalizados,
    paseosCancelados,
    pruebasNuevas,
    renovacionesConfirmadas,
    totalUsuarios,
    totalMascotas,
    totalEventos,
    totalLugares,
    paseadoresAprobados,
    paseadoresPendientes,
    paseosActivos,
    totalPaseos,
    totalMatches,
    totalMensajes,
    renovacionesPendientes,
  ] = await Promise.all([
    prisma.usuario.count({ where: { createdAt: { gte: desde } } }),
    prisma.mascota.count({ where: { createdAt: { gte: desde } } }),
    prisma.evento.count({ where: { createdAt: { gte: desde } } }),
    prisma.lugarPetFriendly.count({ where: { createdAt: { gte: desde } } }),
    prisma.paseador.count({ where: { createdAt: { gte: desde } } }),
    prisma.paseo.count({ where: { createdAt: { gte: desde } } }),
    prisma.paseo.count({ where: { estado: 'finalizado', updatedAt: { gte: desde } } }),
    prisma.paseo.count({ where: { estado: 'cancelado', updatedAt: { gte: desde } } }),
    prisma.suscripcion.count({ where: { tipo: PRUEBA_INDIO, createdAt: { gte: desde } } }),
    prisma.compra.count({ where: { tipo: COMPRA_INDIO, estado: 'completada', updatedAt: { gte: desde } } }),
    prisma.usuario.count(),
    prisma.mascota.count(),
    prisma.evento.count(),
    prisma.lugarPetFriendly.count(),
    prisma.paseador.count({ where: { estado: 'aprobado' } }),
    prisma.paseador.count({ where: { estado: 'pendiente' } }),
    prisma.paseo.count({ where: { estado: { in: ['aceptado', 'en_curso'] } } }),
    prisma.paseo.count(),
    prisma.match.count(),
    prisma.mensaje.count(),
    prisma.compra.count({ where: { tipo: COMPRA_INDIO, estado: 'pendiente' } }),
  ]);

  return {
    generadoEn: ahora,
    fecha: fechaArgentina(ahora),
    periodo: {
      usuarios: usuariosNuevos,
      mascotas: mascotasNuevas,
      eventos: eventosNuevos,
      lugares: lugaresNuevos,
      paseadores: paseadoresNuevos,
      paseos: paseosNuevos,
      paseosFinalizados,
      paseosCancelados,
      pruebas: pruebasNuevas,
      renovacionesConfirmadas,
    },
    totales: {
      usuarios: totalUsuarios,
      mascotas: totalMascotas,
      eventos: totalEventos,
      lugares: totalLugares,
      paseadoresAprobados,
      paseadoresPendientes,
      paseosActivos,
      paseos: totalPaseos,
      matches: totalMatches,
      mensajes: totalMensajes,
    },
    membresias: {
      renovacionesPendientes,
    },
  };
}

function tarjeta(label: string, valor: number | string, detalle: string): string {
  return `<td style="padding:6px;" valign="top">
    <div style="background:#ffffff;border:1px solid #dfe6e0;border-radius:12px;padding:14px;text-align:center;">
      <div style="font-size:12px;color:#67726a;">${label}</div>
      <div style="font-size:26px;font-weight:800;color:#237b31;margin:4px 0;">${valor}</div>
      <div style="font-size:11px;color:#8a948c;">${detalle}</div>
    </div>
  </td>`;
}

function filaTarjetas(tarjetas: string[]): string {
  const faltantes = Math.max(0, 3 - tarjetas.length);
  const vacias = Array.from({ length: faltantes }, () => '<td style="padding:6px;"></td>').join('');
  return `<table role="presentation" width="100%" style="border-collapse:collapse;"><tr>${tarjetas.join('')}${vacias}</tr></table>`;
}

function seccion(titulo: string, contenido: string): string {
  return `<h2 style="font-size:16px;color:#1f3b2a;margin:22px 0 8px;">${titulo}</h2>${contenido}`;
}

export function generarHtmlReporte(datos: DatosReporteDiario): string {
  const fecha = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(datos.generadoEn);
  const totalPaseos = datos.totales.paseos;

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f1f4f1;font-family:Arial,Helvetica,sans-serif;color:#18211b;">
  <table role="presentation" width="100%" style="background:#f1f4f1;padding:20px 0;">
    <tr><td align="center">
      <table role="presentation" width="680" style="max-width:680px;width:100%;background:#f1f4f1;">
        <tr><td style="background:#237b31;border-radius:16px 16px 0 0;padding:24px;text-align:center;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.85;">IT360 · Indio</div>
          <h1 style="margin:8px 0 4px;font-size:28px;">Reporte Indio</h1>
          <div style="font-size:14px;opacity:.9;">Últimas 24 horas · generado ${fecha}</div>
        </td></tr>
        <tr><td style="background:#ffffff;padding:22px;border-radius:0 0 16px 16px;">
          ${seccion('Actividad del período', filaTarjetas([
            tarjeta('Usuarios nuevos', datos.periodo.usuarios, `Total: ${datos.totales.usuarios}`),
            tarjeta('Mascotas nuevas', datos.periodo.mascotas, `Total: ${datos.totales.mascotas}`),
            tarjeta('Eventos nuevos', datos.periodo.eventos, `Total: ${datos.totales.eventos}`),
            tarjeta('Lugares nuevos', datos.periodo.lugares, `Total: ${datos.totales.lugares}`),
            tarjeta('Paseadores nuevos', datos.periodo.paseadores, `${datos.totales.paseadoresPendientes} pendientes`),
            tarjeta('Paseos solicitados', datos.periodo.paseos, `${datos.totales.paseosActivos} activos`),
          ]))}
          ${seccion('Paseos', filaTarjetas([
            tarjeta('Finalizados', datos.periodo.paseosFinalizados, 'En las últimas 24 h'),
            tarjeta('Cancelados', datos.periodo.paseosCancelados, 'En las últimas 24 h'),
            tarjeta('Total histórico', totalPaseos, 'Paseos registrados'),
          ]))}
          ${seccion('Totales de la comunidad', filaTarjetas([
            tarjeta('Usuarios', datos.totales.usuarios, 'Cuentas registradas'),
            tarjeta('Mascotas', datos.totales.mascotas, 'Perfiles de mascotas'),
            tarjeta('Eventos', datos.totales.eventos, 'Eventos publicados'),
            tarjeta('Lugares pet friendly', datos.totales.lugares, 'Lugares cargados'),
            tarjeta('Paseadores aprobados', datos.totales.paseadoresAprobados, 'Disponibles en la app'),
            tarjeta('Paseos activos', datos.totales.paseosActivos, 'Aceptados o en curso'),
          ]))}
          ${seccion('Membresías', filaTarjetas([
            tarjeta('Pruebas nuevas', datos.periodo.pruebas, 'Mes gratis activado'),
            tarjeta('Renovaciones confirmadas', datos.periodo.renovacionesConfirmadas, 'En las últimas 24 h'),
            tarjeta('Renovaciones pendientes', datos.membresias.renovacionesPendientes, 'Requieren revisión'),
          ]))}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e3e9e3;font-size:12px;color:#67726a;text-align:center;">
            Reporte automático de Indio · IT360 Soluciones<br>
            <a href="https://indio.com.ar/admin.html" style="color:#237b31;">Abrir panel de administración</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function generarTextoReporte(datos: DatosReporteDiario): string {
  const p = datos.periodo;
  const t = datos.totales;
  return [
    `Reporte Indio - últimas 24 horas (${datos.fecha})`,
    '',
    `Usuarios nuevos: ${p.usuarios} (total ${t.usuarios})`,
    `Mascotas nuevas: ${p.mascotas} (total ${t.mascotas})`,
    `Eventos nuevos: ${p.eventos} (total ${t.eventos})`,
    `Lugares nuevos: ${p.lugares} (total ${t.lugares})`,
    `Paseadores nuevos: ${p.paseadores} (${t.paseadoresPendientes} pendientes, ${t.paseadoresAprobados} aprobados)`,
    `Paseos solicitados: ${p.paseos} (${t.paseosActivos} activos, ${p.paseosFinalizados} finalizados, ${p.paseosCancelados} cancelados)`,
    `Membresías: ${p.pruebas} pruebas nuevas, ${p.renovacionesConfirmadas} renovaciones confirmadas, ${datos.membresias.renovacionesPendientes} pendientes`,
    '',
    'Panel: https://indio.com.ar/admin.html',
  ].join('\n');
}

export async function enviarReporteDiario(): Promise<{
  ok: boolean;
  enviado: boolean;
  motivo?: string;
  fecha: string;
}> {
  const fecha = fechaArgentina();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to =
    process.env.REPORTE_EMAIL?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    EMAIL_POR_DEFECTO;

  if (!resendConfigurado() || !apiKey || !from) {
    return { ok: false, enviado: false, motivo: 'Resend no configurado (RESEND_API_KEY/EMAIL_FROM)', fecha };
  }

  try {
    const datos = await generarDatosReporte();
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `indio-reporte/diario/${datos.fecha}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Reporte Indio — últimas 24 horas — ${datos.fecha}`,
        html: generarHtmlReporte(datos),
        text: generarTextoReporte(datos),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const detalle = await response.text();
      return {
        ok: false,
        enviado: false,
        motivo: `Resend rechazó el reporte (${response.status}): ${detalle.slice(0, 250)}`,
        fecha,
      };
    }
    return { ok: true, enviado: true, fecha };
  } catch (error: any) {
    return { ok: false, enviado: false, motivo: error?.message || 'Error al enviar el reporte', fecha };
  }
}

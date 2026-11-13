// Administración de reportes por email.
import express from 'express';
import prisma from '../utilidades/prisma';
import {
  enviarReporteDiario,
  fechaHoraArgentina,
  generarDatosReporte,
  generarHtmlReporte,
  generarTextoReporte,
  resendConfigurado,
} from '../servicios/reporteService';

const router = express.Router();

// GET /api/admin/reportes — estado de la configuración y últimos envíos
router.get('/', async (_req, res, next) => {
  try {
    const historial = await prisma.reporteEnvio.findMany({
      where: { tipo: { in: ['diario', 'manual'] } },
      orderBy: [{ enviadoEn: 'desc' }],
      take: 20,
    });
    res.json({
      configurado: resendConfigurado(),
      activo: process.env.REPORTE_DIARIO_ACTIVO !== 'false',
      hora: Number.parseInt(process.env.REPORTE_HORA || '8', 10) || 8,
      destinatario:
        process.env.REPORTE_EMAIL?.trim() ||
        process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
        'it360tecnologia@gmail.com',
      historial,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reportes/vista-previa — datos y HTML del reporte actual
router.get('/vista-previa', async (_req, res, next) => {
  try {
    const datos = await generarDatosReporte();
    res.json({
      datos,
      html: generarHtmlReporte(datos),
      texto: generarTextoReporte(datos),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/reportes/enviar — envía el reporte ahora mismo
router.post('/enviar', async (_req, res, next) => {
  try {
    const resultado = await enviarReporteDiario({ manual: true });
    const fecha = resultado.fecha;
    try {
      await prisma.reporteEnvio.create({
        data: {
          tipo: 'manual',
          fecha: fechaHoraArgentina(),
          ok: resultado.ok,
          detalle: resultado.motivo ?? null,
        },
      });
    } catch {
      // Si no se puede registrar el envío manual, igual informamos el resultado.
    }
    if (!resultado.ok) {
      res.status(502).json({
        error: resultado.motivo || 'No se pudo enviar el reporte',
        fecha,
      });
      return;
    }
    res.json({ ok: true, fecha, mensaje: 'Reporte enviado a IT360' });
  } catch (error) {
    next(error);
  }
});

export default router;

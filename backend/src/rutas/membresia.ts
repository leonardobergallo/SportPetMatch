import express from 'express';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import { enviarCorreoMembresia } from '../servicios/correoService';
import { COMPRA_INDIO, MENSUAL_INDIO, PRECIO_MEMBRESIA, PRUEBA_INDIO, sumarMes } from '../servicios/membresiaService';
import prisma from '../utilidades/prisma';

const router = express.Router();
const seleccionPeriodo = { id: true, tipo: true, fechaInicio: true, fechaFin: true };

function periodoActual(usuarioId: string) {
  return prisma.suscripcion.findFirst({
    where: { usuarioId, tipo: { in: [PRUEBA_INDIO, MENSUAL_INDIO] }, estado: 'activa' },
    orderBy: { fechaFin: 'desc' },
    select: seleccionPeriodo,
  });
}

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(middlewareAutenticacion);
router.use(async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario!.usuarioId },
      select: { isActive: true },
    });
    if (!usuario?.isActive) {
      res.status(403).json({ error: 'La cuenta está inactiva' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const usuarioId = req.usuario!.usuarioId;
    const [periodo, renovaciones, prueba] = await Promise.all([
      periodoActual(usuarioId),
      prisma.compra.findMany({
        where: { usuarioId, tipo: COMPRA_INDIO },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, monto: true, moneda: true, estado: true,
          enlacePagoIndio: true, fechaCompra: true, createdAt: true,
        },
      }),
      prisma.suscripcion.findUnique({
        where: { pruebaIndioUsuarioId: usuarioId },
        select: { id: true },
      }),
    ]);
    res.json({ periodo, renovaciones, puedeActivarPrueba: !prueba, precio: PRECIO_MEMBRESIA });
  } catch (error) {
    next(error);
  }
});

router.post('/prueba', async (req, res, next) => {
  try {
    const usuarioId = req.usuario!.usuarioId;
    const ahora = new Date();
    await prisma.suscripcion.createMany({
      data: {
        usuarioId, pruebaIndioUsuarioId: usuarioId, tipo: PRUEBA_INDIO,
        precio: 0, fechaInicio: ahora, fechaFin: sumarMes(ahora),
      },
      skipDuplicates: true,
    });
    const prueba = await prisma.suscripcion.findUniqueOrThrow({
      where: { pruebaIndioUsuarioId: usuarioId },
      select: { ...seleccionPeriodo, avisoPruebaEn: true },
    });
    if (prueba.avisoPruebaEn) {
      res.json({ fechaFin: prueba.fechaFin, correoEnviado: true });
      return;
    }
    const usuario = await prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: { nombre: true, email: true },
    });
    const base = (process.env.FRONTEND_URL || 'https://indio.com.ar').replace(/\/+$/, '');
    const correoEnviado = await enviarCorreoMembresia(
      'prueba', prueba.id, '', 'Nueva prueba de Membresía Indio',
      `Activó el mes gratis: ${usuario.nombre} (${usuario.email}).\nRevisá la solicitud en ${base}/admin.html#membresias`
    );
    if (correoEnviado) {
      await prisma.suscripcion.update({ where: { id: prueba.id }, data: { avisoPruebaEn: new Date() } });
    }
    res.json({ fechaFin: prueba.fechaFin, correoEnviado });
  } catch (error) {
    next(error);
  }
});

router.post('/renovaciones', async (req, res, next) => {
  try {
    const usuarioId = req.usuario!.usuarioId;
    const periodo = await periodoActual(usuarioId);
    if (!periodo) {
      res.status(409).json({ error: 'Activá primero tu mes gratis' });
      return;
    }
    if (periodo.fechaInicio > new Date()) {
      res.status(409).json({ error: 'Ya tenés una renovación confirmada para el próximo mes' });
      return;
    }
    await prisma.compra.createMany({
      data: {
        usuarioId, cicloIndioId: periodo.id, tipo: COMPRA_INDIO,
        monto: PRECIO_MEMBRESIA, moneda: 'ARS', metodoPago: 'mercado_pago',
      },
      skipDuplicates: true,
    });
    const renovacion = await prisma.compra.findUniqueOrThrow({
      where: { cicloIndioId: periodo.id },
      select: { id: true },
    });
    res.json(renovacion);
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { enviarCorreoMembresia } from '../servicios/correoService';
import { COMPRA_INDIO, MENSUAL_INDIO, PRUEBA_INDIO, enlaceMercadoPago, esConflictoUnico, sumarMes } from '../servicios/membresiaService';
import prisma from '../utilidades/prisma';

const router = express.Router();
const usuarioSelect = { select: { nombre: true, email: true } };

router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.min(10000, Math.max(1, Number.parseInt(String(req.query.pagina), 10) || 1));
    const estado = req.query.estado === 'completada' ? 'completada' : 'pendiente';
    const where = { tipo: COMPRA_INDIO, estado };
    const [renovaciones, total, pruebas] = await Promise.all([
      prisma.compra.findMany({
        where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pagina - 1) * 25, take: 25,
        select: {
          id: true, monto: true, moneda: true, enlacePagoIndio: true, operacionIndio: true,
          enlaceEnviadoEn: true, estado: true, usuario: usuarioSelect,
        },
      }),
      prisma.compra.count({ where }),
      prisma.suscripcion.findMany({
        where: { tipo: PRUEBA_INDIO },
        orderBy: { fechaInicio: 'desc' },
        take: 10,
        select: { id: true, fechaInicio: true, fechaFin: true, avisoPruebaEn: true, usuario: usuarioSelect },
      }),
    ]);
    res.json({ renovaciones, pruebas, pagina, paginas: Math.max(1, Math.ceil(total / 25)) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/enlace', async (req, res, next) => {
  const enlace = enlaceMercadoPago(typeof req.body?.enlace === 'string' ? req.body.enlace.trim() : null);
  if (!enlace) {
    res.status(400).json({ error: 'Ingresá un enlace HTTPS válido de Mercado Pago' });
    return;
  }

  try {
    const id = req.params.id;
    const asignacion = await prisma.compra.updateMany({
      where: { id, tipo: COMPRA_INDIO, estado: 'pendiente', enlacePagoIndio: null },
      data: { enlacePagoIndio: enlace },
    });
    const compra = await prisma.compra.findFirst({
      where: { id, tipo: COMPRA_INDIO, estado: 'pendiente' },
      select: { enlacePagoIndio: true, enlaceEnviadoEn: true, monto: true, moneda: true, usuario: usuarioSelect },
    });
    if (!compra || (asignacion.count === 0 && compra.enlacePagoIndio !== enlace)) {
      res.status(409).json({ error: 'La renovación ya tiene otro enlace o dejó de estar pendiente' });
      return;
    }
    const monto = new Intl.NumberFormat('es-AR').format(compra.monto);
    const correoEnviado = Boolean(compra.enlaceEnviadoEn) || await enviarCorreoMembresia(
      'renovacion', id, compra.usuario.email, 'Renová tu Membresía Indio',
      `Tu renovación de ${compra.moneda} ${monto} está pendiente. Podés pagarla en Mercado Pago: ${enlace}\nPodés consultar el estado en Mi suscripción.`
    );
    if (correoEnviado && !compra.enlaceEnviadoEn) {
      await prisma.compra.update({ where: { id }, data: { enlaceEnviadoEn: new Date() } });
    }
    res.json({ correoEnviado });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/confirmar', async (req, res, next) => {
  const operacion = typeof req.body?.operacion === 'string' ? req.body.operacion.trim() : '';
  if (!/^\d{5,32}$/.test(operacion)) {
    res.status(400).json({ error: 'Ingresá el número de operación de Mercado Pago' });
    return;
  }

  try {
    const id = req.params.id;
    const confirmada = await prisma.$transaction(async tx => {
      const compra = await tx.compra.findFirst({ where: { id, tipo: COMPRA_INDIO } });
      if (compra?.estado === 'completada') return compra.operacionIndio === operacion;
      if (!compra?.cicloIndioId || !compra.enlacePagoIndio || compra.estado !== 'pendiente') return false;

      const periodo = await tx.suscripcion.findFirst({
        where: {
          id: compra.cicloIndioId, usuarioId: compra.usuarioId, estado: 'activa',
          tipo: { in: [PRUEBA_INDIO, MENSUAL_INDIO] },
        },
      });
      if (!periodo) return false;

      const ahora = new Date();
      const resultado = await tx.compra.updateMany({
        where: { id, estado: 'pendiente' },
        data: {
          estado: 'completada', operacionIndio: operacion, transaccionId: operacion,
          confirmadaPorId: req.usuario!.usuarioId, fechaCompra: ahora,
        },
      });
      if (resultado.count === 0) {
        const vigente = await tx.compra.findUnique({ where: { id }, select: { operacionIndio: true } });
        return vigente?.operacionIndio === operacion;
      }

      const inicio = periodo.fechaFin > ahora ? periodo.fechaFin : ahora;
      await tx.suscripcion.create({
        data: {
          usuarioId: compra.usuarioId, tipo: MENSUAL_INDIO, precio: compra.monto, moneda: compra.moneda,
          fechaInicio: inicio, fechaFin: sumarMes(inicio),
        },
      });
      return true;
    });
    if (!confirmada) {
      res.status(409).json({ error: 'La renovación no está pendiente con un enlace de pago' });
      return;
    }
    res.json({ confirmada: true });
  } catch (error) {
    if (esConflictoUnico(error)) {
      res.status(409).json({ error: 'Ese número de operación ya fue registrado' });
      return;
    }
    next(error);
  }
});

export default router;

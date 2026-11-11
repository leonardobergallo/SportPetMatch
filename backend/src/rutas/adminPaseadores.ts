// Administración de solicitudes de paseadores.
import express from 'express';
import prisma from '../utilidades/prisma';

const router = express.Router();
const ESTADOS = new Set(['pendiente', 'aprobado', 'rechazado']);

router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.min(10000, Math.max(1, Number.parseInt(String(req.query.pagina), 10) || 1));
    const estadoSolicitado = String(req.query.estado || 'pendiente');
    const estado = ESTADOS.has(estadoSolicitado) ? estadoSolicitado : null;
    const busqueda = String(req.query.buscar || '').trim();
    const where: any = {
      ...(estado ? { estado } : {}),
      ...(busqueda
        ? {
            OR: [
              { telefono: { contains: busqueda, mode: 'insensitive' } },
              { ciudad: { contains: busqueda, mode: 'insensitive' } },
              { zona: { contains: busqueda, mode: 'insensitive' } },
              { usuario: { nombre: { contains: busqueda, mode: 'insensitive' } } },
              { usuario: { email: { contains: busqueda, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [solicitudes, total, pendientes, aprobados, rechazados] = await Promise.all([
      prisma.paseador.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pagina - 1) * 25,
        take: 25,
        select: {
          id: true,
          telefono: true,
          ciudad: true,
          zona: true,
          experiencia: true,
          precioHora: true,
          disponibilidad: true,
          mensaje: true,
          estado: true,
          motivoRechazo: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              avatar: true,
              ubicacionCiudad: true,
              isActive: true,
            },
          },
        },
      }),
      prisma.paseador.count({ where }),
      prisma.paseador.count({ where: { estado: 'pendiente' } }),
      prisma.paseador.count({ where: { estado: 'aprobado' } }),
      prisma.paseador.count({ where: { estado: 'rechazado' } }),
    ]);

    res.json({
      solicitudes,
      total,
      pagina,
      paginas: Math.max(1, Math.ceil(total / 25)),
      resumen: { pendientes, aprobados, rechazados },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/aprobar', async (req, res, next) => {
  try {
    const resultado = await prisma.paseador.updateMany({
      where: { id: req.params.id },
      data: { estado: 'aprobado', motivoRechazo: null },
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }
    res.json({ ok: true, estado: 'aprobado' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/rechazar', async (req, res, next) => {
  try {
    const motivo = typeof req.body?.motivo === 'string' ? req.body.motivo.trim().slice(0, 500) : null;
    const resultado = await prisma.paseador.updateMany({
      where: { id: req.params.id },
      data: { estado: 'rechazado', motivoRechazo: motivo },
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }
    res.json({ ok: true, estado: 'rechazado' });
  } catch (error) {
    next(error);
  }
});

export default router;

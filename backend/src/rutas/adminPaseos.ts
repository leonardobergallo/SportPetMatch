// Administración de paseos y seguimiento.
import express from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utilidades/prisma';
import { cargarPaseo, paseoInclude } from '../servicios/paseoService';

const router = express.Router();
const ESTADOS = new Set(['pendiente', 'aceptado', 'en_curso', 'finalizado', 'rechazado', 'cancelado']);

router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.min(10000, Math.max(1, Number.parseInt(String(req.query.pagina), 10) || 1));
    const estadoSolicitado = String(req.query.estado || 'todos');
    const estado = ESTADOS.has(estadoSolicitado) ? estadoSolicitado : null;
    const busqueda = String(req.query.buscar || '').trim();
    const where: any = {
      ...(estado ? { estado } : {}),
      ...(busqueda
        ? {
            OR: [
              { dueno: { nombre: { contains: busqueda, mode: 'insensitive' } } },
              { dueno: { email: { contains: busqueda, mode: 'insensitive' } } },
              { mascota: { nombre: { contains: busqueda, mode: 'insensitive' } } },
              { paseador: { usuario: { nombre: { contains: busqueda, mode: 'insensitive' } } } },
              { paseador: { usuario: { email: { contains: busqueda, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [paseos, total, activos, pendientes, finalizados] = await Promise.all([
      prisma.paseo.findMany({
        where,
        orderBy: [{ fechaProgramada: 'desc' }, { id: 'desc' }],
        skip: (pagina - 1) * 25,
        take: 25,
        include: paseoInclude,
      }),
      prisma.paseo.count({ where }),
      prisma.paseo.count({ where: { estado: { in: ['aceptado', 'en_curso'] } } }),
      prisma.paseo.count({ where: { estado: 'pendiente' } }),
      prisma.paseo.count({ where: { estado: 'finalizado' } }),
    ]);

    res.json({
      paseos,
      total,
      pagina,
      paginas: Math.max(1, Math.ceil(total / 25)),
      resumen: { activos, pendientes, finalizados },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancelar', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (['finalizado', 'cancelado', 'rechazado'].includes(paseo.estado)) {
      res.status(409).json({ error: 'El paseo ya está cerrado' });
      return;
    }
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id, estado: paseo.estado },
      data: { estado: 'cancelado' },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(409).json({ error: 'El estado del paseo cambió. Actualizá la pantalla.' });
      return;
    }
    next(error);
  }
});

export default router;

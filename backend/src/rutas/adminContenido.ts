// Administración de eventos y lugares pet friendly.
import express from 'express';
import prisma from '../utilidades/prisma';

const router = express.Router();

function estadoWhere(valor: string): { isActive?: boolean } {
  if (valor === 'activos') return { isActive: true };
  if (valor === 'inactivos') return { isActive: false };
  return {};
}

router.get('/eventos', async (req, res, next) => {
  try {
    const pagina = Math.min(10000, Math.max(1, Number.parseInt(String(req.query.pagina), 10) || 1));
    const busqueda = String(req.query.buscar || '').trim();
    const where: any = {
      ...estadoWhere(String(req.query.estado || 'todos')),
      ...(busqueda
        ? {
            OR: [
              { titulo: { contains: busqueda, mode: 'insensitive' } },
              { descripcion: { contains: busqueda, mode: 'insensitive' } },
              { organizador: { nombre: { contains: busqueda, mode: 'insensitive' } } },
              { organizador: { email: { contains: busqueda, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [eventos, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        orderBy: [{ fechaInicio: 'desc' }, { id: 'desc' }],
        skip: (pagina - 1) * 25,
        take: 25,
        select: {
          id: true,
          titulo: true,
          tipo: true,
          fechaInicio: true,
          esPetFriendly: true,
          esPremium: true,
          isActive: true,
          createdAt: true,
          organizador: { select: { nombre: true, email: true } },
          _count: { select: { participantes: true } },
        },
      }),
      prisma.evento.count({ where }),
    ]);

    res.json({ eventos, total, pagina, paginas: Math.max(1, Math.ceil(total / 25)) });
  } catch (error) {
    next(error);
  }
});

router.post('/eventos/:id/estado', async (req, res, next) => {
  try {
    const isActive = Boolean(req.body?.isActive);
    const resultado = await prisma.evento.updateMany({
      where: { id: req.params.id },
      data: { isActive },
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    res.json({ ok: true, isActive });
  } catch (error) {
    next(error);
  }
});

router.get('/lugares', async (req, res, next) => {
  try {
    const pagina = Math.min(10000, Math.max(1, Number.parseInt(String(req.query.pagina), 10) || 1));
    const busqueda = String(req.query.buscar || '').trim();
    const where: any = {
      ...estadoWhere(String(req.query.estado || 'todos')),
      ...(busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { ciudad: { contains: busqueda, mode: 'insensitive' } },
              { direccion: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [lugares, total, verificados, pendientes] = await Promise.all([
      prisma.lugarPetFriendly.findMany({
        where,
        orderBy: [{ verificado: 'asc' }, { createdAt: 'desc' }],
        skip: (pagina - 1) * 25,
        take: 25,
        select: {
          id: true,
          nombre: true,
          categoria: true,
          ciudad: true,
          provincia: true,
          direccion: true,
          verificado: true,
          destacado: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.lugarPetFriendly.count({ where }),
      prisma.lugarPetFriendly.count({ where: { verificado: true } }),
      prisma.lugarPetFriendly.count({ where: { verificado: false, isActive: true } }),
    ]);

    res.json({
      lugares,
      total,
      pagina,
      paginas: Math.max(1, Math.ceil(total / 25)),
      resumen: { verificados, pendientes },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/lugares/:id', async (req, res, next) => {
  try {
    const data: { isActive?: boolean; verificado?: boolean } = {};
    if (typeof req.body?.isActive === 'boolean') data.isActive = req.body.isActive;
    if (typeof req.body?.verificado === 'boolean') data.verificado = req.body.verificado;
    if (!Object.keys(data).length) {
      res.status(400).json({ error: 'No hay cambios para aplicar' });
      return;
    }
    const resultado = await prisma.lugarPetFriendly.updateMany({
      where: { id: req.params.id },
      data,
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Lugar no encontrado' });
      return;
    }
    res.json({ ok: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;

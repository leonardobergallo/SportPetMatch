// Rutas de Admin / CRM - SportPetMatch
import express from 'express';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import prisma from '../utilidades/prisma';
import rutasAdminMembresia from './adminMembresia';

const router = express.Router();
const adminIds = new Set(
  (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean)
);

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(middlewareAutenticacion);
router.use(async (req, res, next) => {
  const id = req.usuario?.usuarioId;
  if (!id || !adminIds.has(id)) {
    res.status(403).json({ error: 'Esta cuenta no tiene acceso administrativo' });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!usuario?.isActive) {
      res.status(403).json({ error: 'Esta cuenta no tiene acceso administrativo' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

router.use('/membresias', rutasAdminMembresia);

// GET /api/admin/stats — resumen general del CRM
router.get('/stats', async (_req, res) => {
  try {
    const haceSieteDias = new Date();
    haceSieteDias.setDate(haceSieteDias.getDate() - 7);

    const [
      totalUsuarios,
      usuariosActivos,
      usuariosPremium,
      usuariosUltimosSieteDias,
      totalEventos,
      eventosActivos,
      totalMascotas,
      totalMatches,
      totalMensajes,
      usuariosRecientes,
      eventosRecientes,
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { isActive: true } }),
      prisma.usuario.count({ where: { esPremium: true } }),
      prisma.usuario.count({ where: { createdAt: { gte: haceSieteDias } } }),
      prisma.evento.count(),
      prisma.evento.count({ where: { isActive: true } }),
      prisma.mascota.count(),
      prisma.match.count(),
      prisma.mensaje.count(),
      prisma.usuario.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          emailVerificado: true,
          esPremium: true,
          isActive: true,
          onboardingCompletado: true,
          createdAt: true,
          ubicacionCiudad: true,
          _count: { select: { mascotas: true, eventosCreados: true, matches: true } },
        },
      }),
      prisma.evento.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          titulo: true,
          tipo: true,
          esPetFriendly: true,
          esPremium: true,
          isActive: true,
          fechaInicio: true,
          createdAt: true,
          organizador: { select: { nombre: true, email: true } },
          _count: { select: { participantes: true } },
        },
      }),
    ]);

    res.json({
      resumen: {
        totalUsuarios,
        usuariosActivos,
        usuariosPremium,
        usuariosUltimosSieteDias,
        totalEventos,
        eventosActivos,
        totalMascotas,
        totalMatches,
        totalMensajes,
      },
      usuariosRecientes,
      eventosRecientes,
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/admin/usuarios — listado buscable y paginado de registros.
router.get('/usuarios', async (req, res) => {
  try {
    const pagina = Math.max(1, Number.parseInt(String(req.query.pagina || '1'), 10) || 1);
    const limite = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limite || '25'), 10) || 25));
    const busqueda = String(req.query.buscar || '').trim();
    const where = busqueda
      ? {
          OR: [
            { nombre: { contains: busqueda, mode: 'insensitive' as const } },
            { email: { contains: busqueda, mode: 'insensitive' as const } },
            { telefono: { contains: busqueda, mode: 'insensitive' as const } },
            { ubicacionCiudad: { contains: busqueda, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, usuarios] = await Promise.all([
      prisma.usuario.count({ where }),
      prisma.usuario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          ubicacionCiudad: true,
          ubicacionPais: true,
          tipoUsuario: true,
          esPremium: true,
          isActive: true,
          emailVerificado: true,
          onboardingCompletado: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              mascotas: true,
              eventosCreados: true,
              eventosParticipantes: true,
              matches: true,
            },
          },
        },
      }),
    ]);

    res.json({
      usuarios,
      paginacion: {
        pagina,
        limite,
        total,
        paginas: Math.max(1, Math.ceil(total / limite)),
      },
    });
  } catch (err) {
    console.error('[admin/usuarios]', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

export default router;

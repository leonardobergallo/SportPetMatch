// Rutas de Admin / CRM - SportPetMatch
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: verifica clave de admin en header o query
function adminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'Admin no configurado' });
  }
  const provided = req.headers['x-admin-key'] as string || req.query.key as string;
  if (!provided || provided !== secret) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// GET /api/admin/stats — resumen general del CRM
router.get('/stats', adminAuth, async (_req, res) => {
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
router.get('/usuarios', adminAuth, async (req, res) => {
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

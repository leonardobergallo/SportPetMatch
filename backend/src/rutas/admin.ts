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
    const [
      totalUsuarios,
      usuariosActivos,
      usuariosPremium,
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

export default router;

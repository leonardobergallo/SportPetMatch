// Rutas de Admin / CRM - SportPetMatch
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import prisma from '../utilidades/prisma';
import { esAdministrador } from '../utilidades/admin';
import rutasAdminMembresia from './adminMembresia';
import rutasAdminContenido from './adminContenido';
import rutasAdminPaseadores from './adminPaseadores';
import rutasAdminPaseos from './adminPaseos';

const router = express.Router();

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(middlewareAutenticacion);
router.use(async (req, res, next) => {
  const id = req.usuario?.usuarioId;
  if (!id) {
    res.status(403).json({ error: 'Esta cuenta no tiene acceso administrativo' });
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, email: true, isActive: true },
    });
    if (!usuario?.isActive || !esAdministrador(usuario)) {
      res.status(403).json({ error: 'Esta cuenta no tiene acceso administrativo' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

router.use('/membresias', rutasAdminMembresia);
router.use('/', rutasAdminContenido);
router.use('/paseadores', rutasAdminPaseadores);
router.use('/paseos', rutasAdminPaseos);

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
      totalLugares,
      paseadoresPendientes,
      paseosActivos,
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
      prisma.lugarPetFriendly.count({ where: { isActive: true } }),
      prisma.paseador.count({ where: { estado: 'pendiente' } }),
      prisma.paseo.count({ where: { estado: { in: ['aceptado', 'en_curso'] } } }),
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
        totalLugares,
        paseadoresPendientes,
        paseosActivos,
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
    const estado = String(req.query.estado || 'todos');
    const estadoWhere = estado === 'activos'
      ? { isActive: true }
      : estado === 'inactivos'
        ? { isActive: false }
        : {};
    const where = {
      ...estadoWhere,
      ...(busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' as const } },
              { email: { contains: busqueda, mode: 'insensitive' as const } },
              { telefono: { contains: busqueda, mode: 'insensitive' as const } },
              { ubicacionCiudad: { contains: busqueda, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

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
      usuarios: usuarios.map((usuario) => ({
        ...usuario,
        esAdmin: esAdministrador({ id: usuario.id, email: usuario.email }),
      })),
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

// Activar o desactivar una cuenta. Un administrador no puede desactivarse a sí mismo.
router.post('/usuarios/:id/estado', async (req, res, next) => {
  try {
    if (req.params.id === req.usuario!.usuarioId) {
      res.status(400).json({ error: 'No podés desactivar tu propia cuenta desde el panel' });
      return;
    }
    const isActive = Boolean(req.body?.isActive);
    const resultado = await prisma.usuario.updateMany({
      where: { id: req.params.id },
      data: { isActive },
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json({ ok: true, isActive });
  } catch (error) {
    next(error);
  }
});

// Genera una contraseña temporal segura y la devuelve una sola vez al administrador.
router.post('/usuarios/:id/password', async (req, res, next) => {
  try {
    if (req.params.id === req.usuario!.usuarioId) {
      res.status(400).json({ error: 'Para tu propia cuenta usá Configuración → Cambiar contraseña' });
      return;
    }
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true },
    });
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let temporal = 'Indio-';
    for (let i = 0; i < 10; i += 1) {
      temporal += alfabeto[crypto.randomInt(alfabeto.length)];
    }
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: await bcrypt.hash(temporal, 10) },
    });

    res.json({
      ok: true,
      email: usuario.email,
      passwordTemporal: temporal,
      message: 'Contraseña temporal generada. Mostrala una sola vez y pedile al usuario que la cambie.',
    });
  } catch (error) {
    next(error);
  }
});

// Marcar o desmarcar el email como verificado.
router.post('/usuarios/:id/verificar', async (req, res, next) => {
  try {
    const emailVerificado = Boolean(req.body?.emailVerificado);
    const resultado = await prisma.usuario.updateMany({
      where: { id: req.params.id },
      data: { emailVerificado },
    });
    if (resultado.count === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json({ ok: true, emailVerificado });
  } catch (error) {
    next(error);
  }
});

export default router;

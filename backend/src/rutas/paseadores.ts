// Registro y consulta de paseadores.
import express from 'express';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import prisma from '../utilidades/prisma';

const router = express.Router();

const seleccion = {
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
};

// Listado público de paseadores aprobados (para futuras solicitudes de paseo).
router.get('/', async (_req, res, next) => {
  try {
    const paseadores = await prisma.paseador.findMany({
      where: { estado: 'aprobado', usuario: { isActive: true } },
      orderBy: [{ createdAt: 'asc' }],
      select: {
        ...seleccion,
        usuario: { select: { id: true, nombre: true, avatar: true, ubicacionCiudad: true } },
      },
    });
    res.json({ paseadores });
  } catch (error) {
    next(error);
  }
});

router.get('/mi', middlewareAutenticacion, async (req, res, next) => {
  try {
    const paseador = await prisma.paseador.findUnique({
      where: { usuarioId: req.usuario!.usuarioId },
      select: seleccion,
    });
    res.json({ paseador });
  } catch (error) {
    next(error);
  }
});

router.post('/', middlewareAutenticacion, async (req, res, next) => {
  try {
    const telefono = String(req.body?.telefono || '').trim();
    const ciudad = String(req.body?.ciudad || '').trim();
    if (telefono.length < 6 || ciudad.length < 2) {
      res.status(400).json({ error: 'Ingresá un teléfono y una ciudad válidos' });
      return;
    }

    const precioHoraNumero = Number.parseInt(String(req.body?.precioHora ?? ''), 10);
    const precioHora = Number.isFinite(precioHoraNumero) && precioHoraNumero > 0
      ? Math.min(precioHoraNumero, 1000000)
      : null;
    const datos = {
      telefono: telefono.slice(0, 60),
      ciudad: ciudad.slice(0, 120),
      zona: String(req.body?.zona || '').trim().slice(0, 200) || null,
      experiencia: String(req.body?.experiencia || '').trim().slice(0, 2000) || null,
      precioHora,
      disponibilidad: String(req.body?.disponibilidad || '').trim().slice(0, 500) || null,
      mensaje: String(req.body?.mensaje || '').trim().slice(0, 2000) || null,
    };

    const existente = await prisma.paseador.findUnique({
      where: { usuarioId: req.usuario!.usuarioId },
      select: { estado: true },
    });
    if (existente?.estado === 'aprobado') {
      res.status(409).json({ error: 'Tu perfil de paseador ya está aprobado' });
      return;
    }

    const paseador = await prisma.paseador.upsert({
      where: { usuarioId: req.usuario!.usuarioId },
      create: {
        usuarioId: req.usuario!.usuarioId,
        ...datos,
      },
      update: {
        ...datos,
        estado: 'pendiente',
        motivoRechazo: null,
      },
      select: seleccion,
    });

    res.json({ paseador, message: 'Solicitud enviada. Te avisamos cuando esté revisada.' });
  } catch (error) {
    next(error);
  }
});

export default router;

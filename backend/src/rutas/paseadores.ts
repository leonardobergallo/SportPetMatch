// Registro y consulta de paseadores.
import express from 'express';
import { Prisma } from '@prisma/client';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import { membresiaIndioVigente, PRECIO_MEMBRESIA } from '../servicios/membresiaService';
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

// Listado público de paseadores habilitados para recibir nuevas solicitudes.
router.get('/', async (_req, res, next) => {
  try {
    const paseadores = await prisma.paseador.findMany({
      where: {
        estado: 'aprobado',
        usuario: { isActive: true, suscripciones: { some: membresiaIndioVigente() } },
      },
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
    const usuarioId = req.usuario!.usuarioId;
    const [paseador, membresia] = await Promise.all([
      prisma.paseador.findUnique({ where: { usuarioId }, select: seleccion }),
      prisma.suscripcion.findFirst({
        where: { usuarioId, ...membresiaIndioVigente() },
        select: { id: true },
      }),
    ]);
    res.json({ paseador, membresiaActiva: Boolean(membresia), precioMembresia: PRECIO_MEMBRESIA });
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

    const tarifa = String(req.body?.precioHora ?? '').trim();
    const precioHora = tarifa ? Number(tarifa.replace(/\./g, '')) : null;
    if (precioHora !== null && (
      !/^(\d+|\d{1,3}(\.\d{3})+)$/.test(tarifa) || precioHora < 1 || precioHora > 1000000
    )) {
      res.status(400).json({ error: 'Ingresá una tarifa por hora entre $1 y $1.000.000, o dejala vacía para acordarla.' });
      return;
    }
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
    const paseador = existente
      ? await prisma.paseador.update({
        where: { usuarioId: req.usuario!.usuarioId, estado: existente.estado },
        data: existente.estado === 'aprobado'
          ? datos
          : { ...datos, estado: 'pendiente', motivoRechazo: null },
        select: seleccion,
      })
      : await prisma.paseador.upsert({
        where: { usuarioId: req.usuario!.usuarioId },
        create: { usuarioId: req.usuario!.usuarioId, ...datos },
        update: datos,
        select: seleccion,
      });
    const message = paseador.estado === 'aprobado'
      ? 'Perfil actualizado.'
      : 'Solicitud enviada. Te avisamos cuando esté revisada.';
    res.json({ paseador, message });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(409).json({ error: 'El estado de tu perfil cambió. Volvé a cargarlo.' });
      return;
    }
    next(error);
  }
});

export default router;

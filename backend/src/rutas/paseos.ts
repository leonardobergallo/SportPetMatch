// Rutas de paseos con seguimiento GPS.
import express from 'express';
import rateLimit from 'express-rate-limit';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import prisma from '../utilidades/prisma';
import { esAdministrador } from '../utilidades/admin';
import {
  calcularResumen,
  cargarPaseo,
  distanciaKm,
  paseoInclude,
} from '../servicios/paseoService';

const router = express.Router();

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
// Los paseos generan más tráfico por el seguimiento en vivo. Usamos un límite
// propio más alto y el envío de puntos tiene además un throttle de 3 segundos.
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de paseos. Esperá unos minutos.' },
}));
router.use(middlewareAutenticacion);

function esAdmin(req: express.Request): boolean {
  return esAdministrador({
    id: req.usuario!.usuarioId,
    email: req.usuario!.email,
  });
}

async function rolEnPaseo(req: express.Request, paseo: any): Promise<'dueno' | 'paseador' | 'admin' | null> {
  const userId = req.usuario!.usuarioId;
  if (paseo.duenoId === userId) return 'dueno';
  if (paseo.paseador?.usuarioId === userId) return 'paseador';
  if (esAdmin(req)) return 'admin';
  return null;
}

router.post('/', async (req, res, next) => {
  try {
    const duenoId = req.usuario!.usuarioId;
    const paseadorId = String(req.body?.paseadorId || '').trim();
    const mascotaId = String(req.body?.mascotaId || '').trim();
    const fecha = new Date(String(req.body?.fechaProgramada || ''));
    const duracionMin = Number.parseInt(String(req.body?.duracionMin ?? '30'), 10);
    const direccion = String(req.body?.direccion || '').trim().slice(0, 300) || null;
    const notas = String(req.body?.notas || '').trim().slice(0, 1000) || null;

    if (!paseadorId || !mascotaId || Number.isNaN(fecha.getTime())) {
      res.status(400).json({ error: 'Elegí un paseador, una mascota y una fecha válida' });
      return;
    }
    const ahora = Date.now();
    if (fecha.getTime() < ahora + 5 * 60 * 1000) {
      res.status(400).json({ error: 'La fecha del paseo tiene que ser al menos 5 minutos en el futuro' });
      return;
    }
    if (fecha.getTime() > ahora + 60 * 24 * 60 * 60 * 1000) {
      res.status(400).json({ error: 'La fecha no puede ser mayor a 60 días' });
      return;
    }
    if (!Number.isFinite(duracionMin) || duracionMin < 15 || duracionMin > 180) {
      res.status(400).json({ error: 'La duración debe estar entre 15 y 180 minutos' });
      return;
    }

    const [paseador, mascota] = await Promise.all([
      prisma.paseador.findUnique({
        where: { id: paseadorId },
        select: { id: true, usuarioId: true, estado: true, precioHora: true },
      }),
      prisma.mascota.findFirst({
        where: { id: mascotaId, usuarioId: duenoId },
        select: { id: true },
      }),
    ]);
    if (!paseador || paseador.estado !== 'aprobado') {
      res.status(404).json({ error: 'El paseador no está disponible' });
      return;
    }
    if (paseador.usuarioId === duenoId) {
      res.status(400).json({ error: 'No podés solicitar un paseo a tu propio perfil' });
      return;
    }
    if (!mascota) {
      res.status(404).json({ error: 'La mascota no pertenece a tu cuenta' });
      return;
    }

    const paseo = await prisma.paseo.create({
      data: {
        duenoId,
        paseadorId,
        mascotaId,
        fechaProgramada: fecha,
        duracionMin,
        direccion,
        notas,
        precioHora: paseador.precioHora,
      },
      include: paseoInclude,
    });
    res.status(201).json({ paseo });
  } catch (error) {
    next(error);
  }
});

router.get('/mios', async (req, res, next) => {
  try {
    const paseos = await prisma.paseo.findMany({
      where: { duenoId: req.usuario!.usuarioId },
      orderBy: [{ fechaProgramada: 'desc' }, { id: 'desc' }],
      take: 60,
      include: paseoInclude,
    });
    res.json({ paseos });
  } catch (error) {
    next(error);
  }
});

router.get('/asignados', async (req, res, next) => {
  try {
    const paseos = await prisma.paseo.findMany({
      where: {
        paseador: { usuarioId: req.usuario!.usuarioId },
        estado: { in: ['pendiente', 'aceptado', 'en_curso'] },
      },
      orderBy: [{ fechaProgramada: 'asc' }, { id: 'asc' }],
      take: 60,
      include: paseoInclude,
    });
    res.json({ paseos });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/recorrido', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    const rol = await rolEnPaseo(req, paseo);
    if (!rol) {
      res.status(403).json({ error: 'No tenés acceso a este paseo' });
      return;
    }

    const puntos = await prisma.paseoPunto.findMany({
      where: { paseoId: paseo.id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, latitud: true, longitud: true, precision: true, createdAt: true },
    });
    const resumen = calcularResumen(puntos);
    res.json({
      estado: paseo.estado,
      inicioEn: paseo.inicioEn,
      finEn: paseo.finEn,
      distanciaKm: paseo.distanciaKm ?? resumen.distanciaKm,
      duracionRealMin: paseo.duracionRealMin ?? resumen.duracionMin,
      puntos,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    const rol = await rolEnPaseo(req, paseo);
    if (!rol) {
      res.status(403).json({ error: 'No tenés acceso a este paseo' });
      return;
    }
    res.json({ paseo, rol });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/aceptar', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (paseo.paseador?.usuarioId !== req.usuario!.usuarioId) {
      res.status(403).json({ error: 'Este paseo no está asignado a tu perfil de paseador' });
      return;
    }
    if (paseo.estado !== 'pendiente') {
      res.status(409).json({ error: 'El paseo ya no está pendiente' });
      return;
    }
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id },
      data: { estado: 'aceptado' },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/rechazar', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (paseo.paseador?.usuarioId !== req.usuario!.usuarioId) {
      res.status(403).json({ error: 'Este paseo no está asignado a tu perfil de paseador' });
      return;
    }
    if (paseo.estado !== 'pendiente') {
      res.status(409).json({ error: 'El paseo ya no está pendiente' });
      return;
    }
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id },
      data: { estado: 'rechazado' },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/iniciar', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (paseo.paseador?.usuarioId !== req.usuario!.usuarioId) {
      res.status(403).json({ error: 'Solo el paseador asignado puede iniciar el paseo' });
      return;
    }
    if (paseo.estado !== 'aceptado') {
      res.status(409).json({ error: 'El paseo no está listo para iniciar' });
      return;
    }
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id },
      data: { estado: 'en_curso', inicioEn: new Date() },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/punto', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (paseo.paseador?.usuarioId !== req.usuario!.usuarioId) {
      res.status(403).json({ error: 'Solo el paseador asignado puede enviar ubicación' });
      return;
    }
    if (paseo.estado !== 'en_curso') {
      res.status(409).json({ error: 'El paseo no está en curso' });
      return;
    }
    const latitud = Number(req.body?.latitud);
    const longitud = Number(req.body?.longitud);
    const precision = Number(req.body?.precision);
    if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      res.status(400).json({ error: 'Coordenadas inválidas' });
      return;
    }
    const ultimo = await prisma.paseoPunto.findFirst({
      where: { paseoId: paseo.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (ultimo && Date.now() - ultimo.createdAt.getTime() < 3000) {
      res.status(429).json({ error: 'Esperá unos segundos antes de enviar otro punto' });
      return;
    }
    await prisma.paseoPunto.create({
      data: {
        paseoId: paseo.id,
        latitud,
        longitud,
        precision: Number.isFinite(precision) ? precision : null,
      },
    });
    const total = await prisma.paseoPunto.count({ where: { paseoId: paseo.id } });
    res.json({ ok: true, total });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/finalizar', async (req, res, next) => {
  try {
    const paseo = await cargarPaseo(req.params.id);
    if (!paseo) {
      res.status(404).json({ error: 'Paseo no encontrado' });
      return;
    }
    if (paseo.paseador?.usuarioId !== req.usuario!.usuarioId) {
      res.status(403).json({ error: 'Solo el paseador asignado puede finalizar el paseo' });
      return;
    }
    if (paseo.estado !== 'en_curso') {
      res.status(409).json({ error: 'El paseo no está en curso' });
      return;
    }
    const puntos = await prisma.paseoPunto.findMany({
      where: { paseoId: paseo.id },
      orderBy: { createdAt: 'asc' },
      select: { latitud: true, longitud: true, createdAt: true },
    });
    const ahora = new Date();
    let distancia = 0;
    for (let i = 1; i < puntos.length; i += 1) {
      distancia += distanciaKm(
        puntos[i - 1].latitud,
        puntos[i - 1].longitud,
        puntos[i].latitud,
        puntos[i].longitud
      );
    }
    const inicio = paseo.inicioEn || ahora;
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id },
      data: {
        estado: 'finalizado',
        finEn: ahora,
        distanciaKm: Number(distancia.toFixed(3)),
        duracionRealMin: Math.max(0, Math.round((ahora.getTime() - inicio.getTime()) / 60000)),
      },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
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
    const rol = await rolEnPaseo(req, paseo);
    if (!rol) {
      res.status(403).json({ error: 'No tenés acceso a este paseo' });
      return;
    }
    if (rol === 'dueno' && !['pendiente', 'aceptado'].includes(paseo.estado)) {
      res.status(409).json({ error: 'El paseo ya comenzó o finalizó' });
      return;
    }
    if (rol === 'paseador') {
      res.status(403).json({ error: 'Para rechazar usá la opción Rechazar' });
      return;
    }
    if (['finalizado', 'cancelado', 'rechazado'].includes(paseo.estado)) {
      res.status(409).json({ error: 'El paseo ya está cerrado' });
      return;
    }
    const actualizado = await prisma.paseo.update({
      where: { id: paseo.id },
      data: { estado: 'cancelado' },
      include: paseoInclude,
    });
    res.json({ paseo: actualizado });
  } catch (error) {
    next(error);
  }
});

export default router;

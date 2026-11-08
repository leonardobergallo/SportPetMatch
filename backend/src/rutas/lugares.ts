// Rutas de Lugares pet friendly - Indio
import express from 'express';
import { obtenerLugares, obtenerLugar, sugerirLugar } from '../controllers/lugarController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Rutas publicas
router.get('/', obtenerLugares);
router.get('/:id', obtenerLugar);

// Sugerencias de la comunidad (requiere sesion)
router.post('/sugerencias', middlewareAutenticacion, sugerirLugar);

export default router;

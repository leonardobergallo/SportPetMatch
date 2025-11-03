// Rutas de Matches - SportPetMatch
import express from 'express';
import {
  obtenerRecomendaciones,
  crearMatch,
  obtenerMisMatches,
  responderMatch,
  obtenerRecomendacionesEventos,
} from '../controllers/matchController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/recomendaciones', middlewareAutenticacion, obtenerRecomendaciones);
router.get('/', middlewareAutenticacion, obtenerMisMatches);
router.post('/', middlewareAutenticacion, crearMatch);
router.put('/:id/respuesta', middlewareAutenticacion, responderMatch);
router.get('/eventos/recomendaciones', middlewareAutenticacion, obtenerRecomendacionesEventos);

export default router;

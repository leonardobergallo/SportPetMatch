// Rutas de Eventos - SportPetMatch
import express from 'express';
import {
  obtenerEventos,
  obtenerEvento,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  participarEvento,
  salirEvento,
} from '../controllers/eventoController';
import { middlewareAutenticacion, middlewareAutenticacionOpcional } from '../middleware/autenticacion';

const router = express.Router();

// Rutas públicas (con autenticación opcional para información adicional)
router.get('/', middlewareAutenticacionOpcional, obtenerEventos);
router.get('/:id', middlewareAutenticacionOpcional, obtenerEvento);

// Rutas que requieren autenticación
router.post('/', middlewareAutenticacion, crearEvento);
router.put('/:id', middlewareAutenticacion, actualizarEvento);
router.delete('/:id', middlewareAutenticacion, eliminarEvento);
router.post('/:id/participar', middlewareAutenticacion, participarEvento);
router.delete('/:id/participar', middlewareAutenticacion, salirEvento);

export default router;


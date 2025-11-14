// Rutas de Mensajes - SportPetMatch
import express from 'express';
import {
  obtenerMensajes,
  enviarMensaje,
  marcarComoLeido,
  obtenerMensajesNoLeidos,
} from '../controllers/mensajeController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Todas las rutas requieren autenticación
// IMPORTANTE: Las rutas más específicas deben ir primero
router.get('/no-leidos/cantidad', middlewareAutenticacion, obtenerMensajesNoLeidos);
router.put('/leer', middlewareAutenticacion, marcarComoLeido);
router.post('/', middlewareAutenticacion, enviarMensaje);
router.get('/:matchId', middlewareAutenticacion, obtenerMensajes);

export default router;


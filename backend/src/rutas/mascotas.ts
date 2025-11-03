// Rutas de Mascotas - SportPetMatch
import express from 'express';
import {
  obtenerMisMascotas,
  obtenerMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
} from '../controllers/mascotaController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(middlewareAutenticacion);

router.get('/', obtenerMisMascotas);
router.get('/:id', obtenerMascota);
router.post('/', crearMascota);
router.put('/:id', actualizarMascota);
router.delete('/:id', eliminarMascota);

export default router;


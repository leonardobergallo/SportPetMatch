// Rutas de Mascotas - SportPetMatch
import express from 'express';
import {
  obtenerMisMascotas,
  obtenerMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota,
} from '../controllers/mascotaController';
import { subirFotosMascota } from '../controllers/uploadController';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(middlewareAutenticacion);

router.get('/', obtenerMisMascotas);
router.get('/:id', obtenerMascota);
router.post('/', crearMascota);
router.put('/:id', actualizarMascota);
router.delete('/:id', eliminarMascota);
router.post('/:id/fotos', uploadMultiple, subirFotosMascota);

export default router;


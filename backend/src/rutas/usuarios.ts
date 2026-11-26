// Rutas de Usuarios - SportPetMatch
import express from 'express';
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  cambiarContraseña,
  obtenerUsuario,
} from '../controllers/usuarioController';
import { subirAvatar, subirFotosPerfil } from '../controllers/uploadController';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = express.Router();

// Rutas que requieren autenticación
router.get('/mi-perfil', middlewareAutenticacion, obtenerMiPerfil);
router.put('/mi-perfil', middlewareAutenticacion, actualizarMiPerfil);
router.put('/mi-perfil/cambiar-contraseña', middlewareAutenticacion, cambiarContraseña);
router.post('/mi-perfil/avatar', middlewareAutenticacion, uploadSingle, subirAvatar);
router.post('/mi-perfil/fotos', middlewareAutenticacion, uploadMultiple, subirFotosPerfil);

// Rutas públicas (información limitada)
router.get('/:id', obtenerUsuario);

export default router;


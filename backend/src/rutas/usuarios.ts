// Rutas de Usuarios - SportPetMatch
import express from 'express';
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  cambiarContraseña,
  obtenerUsuario,
} from '../controllers/usuarioController';
import { subirAvatar } from '../controllers/uploadController';
import { middlewareAutenticacion } from '../middleware/autenticacion';
import { uploadSingle } from '../middleware/upload';

const router = express.Router();

// Rutas que requieren autenticación
router.get('/mi-perfil', middlewareAutenticacion, obtenerMiPerfil);
router.put('/mi-perfil', middlewareAutenticacion, actualizarMiPerfil);
router.put('/mi-perfil/cambiar-contraseña', middlewareAutenticacion, cambiarContraseña);
router.post('/mi-perfil/avatar', middlewareAutenticacion, uploadSingle, subirAvatar);

// Rutas públicas (información limitada)
router.get('/:id', obtenerUsuario);

export default router;


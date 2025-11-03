// Rutas de Usuarios - SportPetMatch
import express from 'express';
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  cambiarContraseña,
  obtenerUsuario,
} from '../controllers/usuarioController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Rutas que requieren autenticación
router.get('/mi-perfil', middlewareAutenticacion, obtenerMiPerfil);
router.put('/mi-perfil', middlewareAutenticacion, actualizarMiPerfil);
router.put('/mi-perfil/cambiar-contraseña', middlewareAutenticacion, cambiarContraseña);

// Rutas públicas (información limitada)
router.get('/:id', obtenerUsuario);

export default router;


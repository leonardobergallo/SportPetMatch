// Rutas de Autenticacion - SportPetMatch
// Rutas basicas para login, registro, reset de password y dashboard

import express from 'express';
import {
  login,
  registro,
  obtenerDashboard,
  solicitarResetPassword,
  resetPassword,
} from '../controllers/authController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/recuperar-password', solicitarResetPassword);
router.post('/reset-password', resetPassword);

router.get('/dashboard', middlewareAutenticacion, obtenerDashboard);

export default router;

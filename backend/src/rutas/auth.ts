// Rutas de Autenticación - SportPetMatch
// Rutas básicas para login, registro y dashboard

import express from 'express';
import { login, registro, obtenerDashboard } from '../controllers/authController';
import { middlewareAutenticacion } from '../middleware/autenticacion';

const router = express.Router();

// Ruta de registro (pública)
router.post('/registro', registro);

// Ruta de login (pública)
router.post('/login', login);

// Ruta para obtener datos del dashboard (requiere autenticación)
router.get('/dashboard', middlewareAutenticacion, obtenerDashboard);

export default router;
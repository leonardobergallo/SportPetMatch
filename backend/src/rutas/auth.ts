// Rutas de Autenticación - SportPetMatch
// Rutas básicas para login y dashboard

import express from 'express';
import { login, obtenerDashboard } from '../controllers/authController';

const router = express.Router();

// Ruta de login
router.post('/login', login);

// Ruta para obtener datos del dashboard
router.get('/dashboard', obtenerDashboard);

export default router;
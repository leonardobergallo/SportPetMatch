// Controlador de Autenticación Simple - SportPetMatch
// Maneja login básico con datos mock

import { Request, Response } from 'express';

/**
 * Login simple - devuelve token simulado
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
    return;
  }

  // Usuario mock para desarrollo
  const usuarioMock = {
    id: '1',
    email: email,
    nombre: 'Usuario Demo',
    avatar: 'https://via.placeholder.com/150',
    esPremium: false
  };

  // Token simulado (en producción sería JWT real)
  const tokenMock = 'token_demo_' + Date.now();

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      usuario: usuarioMock,
      token: tokenMock
    }
  });
};

/**
 * Obtener datos del dashboard
 */
export const obtenerDashboard = async (req: Request, res: Response): Promise<void> => {
  // Datos mock para el dashboard
  const dashboardData = {
    usuario: {
      id: '1',
      nombre: 'Usuario Demo',
      avatar: 'https://via.placeholder.com/150',
      esPremium: false
    },
    estadisticas: {
      eventosParticipados: 12,
      mascotasRegistradas: 2,
      matchesRealizados: 8,
      puntosGamificacion: 350
    },
    eventosRecientes: [
      {
        id: '1',
        titulo: 'Carrera Matutina con Mascotas',
        fecha: '2025-11-01T08:00:00Z',
        ubicacion: 'Parque Central',
        participantes: 15
      },
      {
        id: '2',
        titulo: 'Caminata Familiar',
        fecha: '2025-11-03T16:00:00Z',
        ubicacion: 'Costanera Sur',
        participantes: 8
      }
    ],
    mascotasFavoritas: [
      {
        id: '1',
        nombre: 'Max',
        tipo: 'Perro',
        raza: 'Golden Retriever',
        foto: 'https://via.placeholder.com/100'
      },
      {
        id: '2',
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Border Collie',
        foto: 'https://via.placeholder.com/100'
      }
    ],
    matchesRecientes: [
      {
        id: '1',
        usuario: 'Ana García',
        mascota: 'Toby',
        distancia: '2.5 km',
        compatibilidad: 95
      },
      {
        id: '2',
        usuario: 'Carlos López',
        mascota: 'Bella',
        distancia: '1.8 km',
        compatibilidad: 87
      }
    ]
  };

  res.json({
    success: true,
    data: dashboardData
  });
};
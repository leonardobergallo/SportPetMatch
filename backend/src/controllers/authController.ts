// Controlador de Autenticación - SportPetMatch
// Maneja login, registro y dashboard con Prisma

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utilidades/prisma';
import { generarTokens } from '../servicios/jwtService';

/**
 * Registro de nuevo usuario
 */
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, fechaNacimiento, telefono, tipoUsuario, intereses } = req.body;

    // Validación básica
    if (!email || !password || !nombre) {
      res.status(400).json({
        success: false,
        message: 'Email, contraseña y nombre son requeridos',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email',
      });
      return;
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        telefono: telefono || null,
        tipoUsuario: tipoUsuario || 'solo',
        intereses: intereses || [],
        isActive: true,
        emailVerificado: false, // En producción, enviar email de verificación
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        avatar: true,
        esPremium: true,
        createdAt: true,
      },
    });

    // Generar tokens
    const tokens = generarTokens({
      usuarioId: nuevoUsuario.id,
      email: nuevoUsuario.email,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: nuevoUsuario,
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * Login de usuario
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    res.status(400).json({
      success: false,
        message: 'Email y contraseña son requeridos',
    });
    return;
  }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        nombre: true,
        avatar: true,
        esPremium: true,
        isActive: true,
        onboardingCompletado: true,
        tipoUsuario: true,
        intereses: true,
      },
    });

    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
      return;
    }

    // Verificar si el usuario está activo
    if (!usuario.isActive) {
      res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador',
      });
      return;
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password || '');

    if (!passwordValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
      return;
    }

    // Generar tokens
    const tokens = generarTokens({
      usuarioId: usuario.id,
      email: usuario.email,
    });

    // Preparar datos del usuario para respuesta (sin password)
    const { password: _, ...usuarioSinPassword } = usuario;

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
        usuario: usuarioSinPassword,
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * Obtener datos del dashboard del usuario autenticado
 */
export const obtenerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    // Obtener usuario con relaciones
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        email: true,
        avatar: true,
        esPremium: true,
        mascotas: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
        eventosCreados: {
          take: 5,
          orderBy: { fechaInicio: 'asc' },
          where: {
            fechaInicio: {
              gte: new Date(), // Solo eventos futuros
            },
          },
        },
        matches: {
          take: 5,
          orderBy: { fechaMatch: 'desc' },
          include: {
            usuarioMatch: {
              select: {
                id: true,
                nombre: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            mascotas: true,
            eventosCreados: true,
            matches: true,
            eventosParticipantes: true,
          },
        },
      },
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Formatear datos del dashboard
    const dashboardData = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        avatar: usuario.avatar,
        esPremium: usuario.esPremium,
      },
      estadisticas: {
        eventosParticipados: usuario._count.eventosParticipantes,
        mascotasRegistradas: usuario._count.mascotas,
        matchesRealizados: usuario._count.matches,
        eventosCreados: usuario._count.eventosCreados,
      },
      eventosRecientes: usuario.eventosCreados.map((evento) => ({
        id: evento.id,
        titulo: evento.titulo,
        fecha: evento.fechaInicio,
        tipo: evento.tipo,
      })),
      mascotasFavoritas: usuario.mascotas.map((mascota) => ({
        id: mascota.id,
        nombre: mascota.nombre,
        tipo: mascota.tipo,
        raza: mascota.raza,
        foto: mascota.fotos[0] || null,
      })),
      matchesRecientes: usuario.matches.map((match) => ({
        id: match.id,
        usuario: match.usuarioMatch.nombre,
        fecha: match.fechaMatch,
        estado: match.estado,
      })),
  };

  res.json({
    success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

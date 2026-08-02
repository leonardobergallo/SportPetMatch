// Controlador de Autenticacion - SportPetMatch
// Maneja login, registro y dashboard con Prisma

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../utilidades/prisma';
import { generarTokens } from '../servicios/jwtService';

function normalizarEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

function normalizarTelefono(telefono: unknown): string {
  return String(telefono || '').replace(/[\s\-\(\)]/g, '').trim();
}

function obtenerBaseFrontend(req: Request): string {
  const envUrl = process.env.FRONTEND_URL || process.env.APP_URL || '';
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  const origin = req.get('origin');
  if (origin) {
    return origin.replace(/\/+$/, '');
  }

  return `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');
}

function crearTransporterEmail() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Registro de nuevo usuario
 */
export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, fechaNacimiento, telefono, tipoUsuario, intereses } = req.body;

    const emailNormalizado = normalizarEmail(email);
    const nombreNormalizado = String(nombre || '').trim();
    const telefonoNormalizado = normalizarTelefono(telefono);

    if (!emailNormalizado || !password || !nombreNormalizado) {
      res.status(400).json({
        success: false,
        message: 'Email, contrasena y nombre son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalizado)) {
      res.status(400).json({
        success: false,
        message: 'Email invalido',
        code: 'INVALID_EMAIL',
      });
      return;
    }

    if (nombreNormalizado.length < 2) {
      res.status(400).json({
        success: false,
        message: 'El nombre debe tener al menos 2 caracteres',
        code: 'INVALID_NAME',
      });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({
        success: false,
        message: 'La contrasena debe tener al menos 6 caracteres',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    if (telefonoNormalizado && !/^\d{8,15}$/.test(telefonoNormalizado)) {
      res.status(400).json({
        success: false,
        message: 'Telefono invalido',
        code: 'INVALID_PHONE',
      });
      return;
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: emailNormalizado,
        password: passwordHash,
        nombre: nombreNormalizado,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        telefono: telefonoNormalizado || null,
        tipoUsuario: tipoUsuario || 'dueno',
        intereses: Array.isArray(intereses) ? intereses : [],
        isActive: true,
        emailVerificado: false,
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
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contrasena son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalizado)) {
      res.status(400).json({
        success: false,
        message: 'Email invalido',
        code: 'INVALID_EMAIL',
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
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
        message: 'No encontramos una cuenta con ese email',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (!usuario.isActive) {
      res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador',
        code: 'INACTIVE_USER',
      });
      return;
    }

    const passwordValida = await bcrypt.compare(String(password), usuario.password || '');

    if (!passwordValida) {
      res.status(401).json({
        success: false,
        message: 'La contrasena ingresada es incorrecta',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    const tokens = generarTokens({
      usuarioId: usuario.id,
      email: usuario.email,
    });

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
      message: 'Error al iniciar sesion',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * Solicitar recuperacion de password.
 * En produccion envia link por email si SMTP esta configurado.
 * En desarrollo devuelve resetToken para poder probar el flujo completo.
 */
export const solicitarResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const emailNormalizado = normalizarEmail(req.body.email);

    if (!emailNormalizado) {
      res.status(400).json({
        success: false,
        message: 'Ingresa el email de tu cuenta',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalizado)) {
      res.status(400).json({
        success: false,
        message: 'Email invalido',
        code: 'INVALID_EMAIL',
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: { id: true, email: true, nombre: true, password: true, isActive: true },
    });

    if (!usuario || !usuario.isActive || !usuario.password) {
      res.status(404).json({
        success: false,
        message: 'No encontramos una cuenta activa con ese email',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'No se pudo generar el token de recuperacion',
        code: 'JWT_NOT_CONFIGURED',
      });
      return;
    }

    const resetToken = jwt.sign(
      {
        usuarioId: usuario.id,
        email: usuario.email,
        purpose: 'password-reset',
        passwordVersion: usuario.password.slice(0, 16),
      },
      secret,
      { expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '30m' } as jwt.SignOptions,
    );
    const resetUrl = `${obtenerBaseFrontend(req)}/?app=1&resetToken=${encodeURIComponent(resetToken)}`;
    const transporter = crearTransporterEmail();

    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: usuario.email,
        subject: 'Recuperar contrasena de Indio',
        text: `Hola ${usuario.nombre}. Para crear una nueva contrasena entra a este link: ${resetUrl}`,
        html: `<p>Hola ${usuario.nombre},</p><p>Para crear una nueva contrasena en Indio, entra a este link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>El link vence en 30 minutos.</p>`,
      });
    } else {
      console.warn('SMTP no configurado. Link de recuperacion generado:', resetUrl);
    }

    const esHostLocal = ['localhost', '127.0.0.1', '::1'].includes(req.hostname);
    const exponerTokenPrueba = process.env.NODE_ENV !== 'production' || esHostLocal;

    res.json({
      success: true,
      message: transporter
        ? 'Te enviamos un link para recuperar tu contrasena'
        : exponerTokenPrueba
          ? 'SMTP no configurado. Usa el token de prueba para completar el reset.'
          : 'No hay envio de email configurado. Contacta al administrador para recuperar tu contrasena.',
      data: {
        email: usuario.email,
        resetToken: exponerTokenPrueba ? resetToken : undefined,
        resetUrl: exponerTokenPrueba ? resetUrl : undefined,
      },
    });
  } catch (error) {
    console.error('Error solicitando recuperacion de password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al solicitar recuperacion de contrasena',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * Confirmar nueva password usando token de recuperacion.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.body.token || '').trim();
    const nuevaPassword = String(req.body.password || '');

    if (!token || !nuevaPassword) {
      res.status(400).json({
        success: false,
        message: 'Token y nueva contrasena son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (nuevaPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contrasena debe tener al menos 6 caracteres',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'No se pudo validar el token de recuperacion',
        code: 'JWT_NOT_CONFIGURED',
      });
      return;
    }

    const payload = jwt.verify(token, secret) as {
      usuarioId: string;
      email: string;
      purpose: string;
      passwordVersion: string;
    };

    if (payload.purpose !== 'password-reset') {
      res.status(400).json({
        success: false,
        message: 'Token de recuperacion invalido',
        code: 'INVALID_RESET_TOKEN',
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: { id: true, email: true, password: true, isActive: true },
    });

    if (!usuario || !usuario.isActive || !usuario.password || usuario.email !== payload.email) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o inactivo',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (usuario.password.slice(0, 16) !== payload.passwordVersion) {
      res.status(400).json({
        success: false,
        message: 'El link ya fue usado o expiro. Solicita uno nuevo.',
        code: 'RESET_TOKEN_USED',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: passwordHash },
    });

    res.json({
      success: true,
      message: 'Contrasena actualizada exitosamente',
    });
  } catch (error) {
    const isJwtError = error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError;
    res.status(isJwtError ? 400 : 500).json({
      success: false,
      message: isJwtError ? 'El link de recuperacion es invalido o expiro' : 'Error al actualizar la contrasena',
      code: isJwtError ? 'INVALID_RESET_TOKEN' : 'RESET_PASSWORD_ERROR',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

/**
 * Cambiar la contrasena del usuario autenticado (pide la actual, valida la nueva)
 */
export const cambiarPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const passwordActual = String(req.body.passwordActual || '');
    const passwordNueva = String(req.body.passwordNueva || '');

    if (!passwordActual || !passwordNueva) {
      res.status(400).json({
        success: false,
        message: 'La contrasena actual y la nueva son requeridas',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (passwordNueva.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contrasena debe tener al menos 6 caracteres',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.usuarioId },
      select: { id: true, password: true },
    });

    if (!usuario || !usuario.password) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValida) {
      res.status(401).json({
        success: false,
        message: 'La contrasena actual es incorrecta',
        code: 'INVALID_PASSWORD',
      });
      return;
    }

    const nuevoHash = await bcrypt.hash(passwordNueva, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: nuevoHash },
    });

    res.json({
      success: true,
      message: 'Contrasena actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error cambiando password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contrasena',
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
              gte: new Date(),
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

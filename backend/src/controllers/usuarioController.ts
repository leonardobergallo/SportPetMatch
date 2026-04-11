// Controlador de Usuarios - SportPetMatch
// Maneja CRUD de usuarios

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utilidades/prisma';

/**
 * Obtener perfil del usuario autenticado
 */
export const obtenerMiPerfil = async (req: Request, res: Response): Promise<void> => {
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
        email: true,
        nombre: true,
        fechaNacimiento: true,
        telefono: true,
        avatar: true,
        biografia: true,
        ubicacionLat: true,
        ubicacionLng: true,
        ubicacionCiudad: true,
        ubicacionPais: true,
        nivelDeporte: true,
        intereses: true,
        tipoUsuario: true,
        onboardingCompletado: true,
        esPremium: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
    });
  }
};

/**
 * Actualizar perfil del usuario autenticado
 */
export const actualizarMiPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const {
      nombre,
      telefono,
      avatar,
      biografia,
      ubicacionLat,
      ubicacionLng,
      ubicacionCiudad,
      ubicacionPais,
      nivelDeporte,
      intereses,
      tipoUsuario,
      onboardingCompletado,
    } = req.body;

    // Construir datos a actualizar
    const datosActualizacion: any = {};

    if (nombre) datosActualizacion.nombre = nombre;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    if (avatar !== undefined) datosActualizacion.avatar = avatar;
    if (biografia !== undefined) datosActualizacion.biografia = biografia;
    if (ubicacionLat !== undefined) datosActualizacion.ubicacionLat = parseFloat(ubicacionLat);
    if (ubicacionLng !== undefined) datosActualizacion.ubicacionLng = parseFloat(ubicacionLng);
    if (ubicacionCiudad !== undefined) datosActualizacion.ubicacionCiudad = ubicacionCiudad;
    if (ubicacionPais !== undefined) datosActualizacion.ubicacionPais = ubicacionPais;
    if (nivelDeporte !== undefined) datosActualizacion.nivelDeporte = parseInt(nivelDeporte);
    if (intereses !== undefined && Array.isArray(intereses)) {
      datosActualizacion.intereses = intereses;
    }
    if (tipoUsuario !== undefined) datosActualizacion.tipoUsuario = tipoUsuario;
    if (onboardingCompletado !== undefined) datosActualizacion.onboardingCompletado = onboardingCompletado;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: datosActualizacion,
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        avatar: true,
        biografia: true,
        ubicacionLat: true,
        ubicacionLng: true,
        ubicacionCiudad: true,
        ubicacionPais: true,
        nivelDeporte: true,
        intereses: true,
        tipoUsuario: true,
        onboardingCompletado: true,
        esPremium: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);

    if ((error as any)?.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'El usuario autenticado no existe en la base de datos actual. Inicia sesión nuevamente.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
    });
  }
};

/**
 * Cambiar contraseña del usuario autenticado
 */
export const cambiarContraseña = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { contraseñaActual, nuevaContraseña } = req.body;

    if (!contraseñaActual || !nuevaContraseña) {
      res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas',
      });
      return;
    }

    if (nuevaContraseña.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    // Obtener usuario con contraseña
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { password: true },
    });

    if (!usuario || !usuario.password) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.password);

    if (!contraseñaValida) {
      res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
      return;
    }

    // Hash de la nueva contraseña
    const nuevaContraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: nuevaContraseñaHash },
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
    });
  }
};

/**
 * Obtener usuario por ID (público, información limitada)
 */
export const obtenerUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        nombre: true,
        avatar: true,
        biografia: true,
        ubicacionCiudad: true,
        nivelDeporte: true,
        intereses: true,
        esPremium: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
    });
  }
};


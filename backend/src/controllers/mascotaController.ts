// Controlador de Mascotas - SportPetMatch
// Maneja CRUD de mascotas

import { Request, Response } from 'express';
import prisma from '../utilidades/prisma';

/**
 * Obtener todas las mascotas del usuario autenticado
 */
export const obtenerMisMascotas = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    const mascotas = await prisma.mascota.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: mascotas,
    });
  } catch (error) {
    console.error('Error obteniendo mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
    });
  }
};

/**
 * Obtener una mascota por ID
 */
export const obtenerMascota = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { id } = req.params;

    const mascota = await prisma.mascota.findFirst({
      where: {
        id,
        usuarioId, // Solo puede ver sus propias mascotas
      },
    });

    if (!mascota) {
      res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: mascota,
    });
  } catch (error) {
    console.error('Error obteniendo mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascota',
    });
  }
};

/**
 * Crear una nueva mascota
 */
export const crearMascota = async (req: Request, res: Response): Promise<void> => {
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
      tipo,
      raza,
      edad,
      peso,
      altura,
      color,
      genero,
      esterilizado,
      vacunas,
      alergias,
      personalidad,
      nivelActividad,
      intereses,
      fotos,
      salud,
      veterinario,
    } = req.body;

    // Validación básica
    if (!nombre || !tipo) {
      res.status(400).json({
        success: false,
        message: 'Nombre y tipo son requeridos',
      });
      return;
    }

    const nuevaMascota = await prisma.mascota.create({
      data: {
        usuarioId,
        nombre,
        tipo,
        raza: raza || null,
        edad: edad ? parseInt(edad) : null,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        color: color || null,
        genero: genero || null,
        esterilizado: esterilizado !== undefined ? esterilizado : null,
        vacunas: vacunas || [],
        alergias: alergias || [],
        personalidad: personalidad || [],
        nivelActividad: nivelActividad ? parseInt(nivelActividad) : 3,
        intereses: intereses || [],
        fotos: fotos || [],
        salud: salud || null,
        veterinario: veterinario || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: nuevaMascota,
    });
  } catch (error) {
    console.error('Error creando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear mascota',
    });
  }
};

/**
 * Actualizar una mascota
 */
export const actualizarMascota = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { id } = req.params;

    // Verificar que la mascota pertenece al usuario
    const mascotaExistente = await prisma.mascota.findFirst({
      where: { id, usuarioId },
    });

    if (!mascotaExistente) {
      res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
      return;
    }

    const datosActualizacion: any = {};
    const camposPermitidos = [
      'nombre',
      'tipo',
      'raza',
      'edad',
      'peso',
      'altura',
      'color',
      'genero',
      'esterilizado',
      'vacunas',
      'alergias',
      'personalidad',
      'nivelActividad',
      'intereses',
      'fotos',
      'salud',
      'veterinario',
    ];

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        if (campo === 'edad' || campo === 'nivelActividad') {
          datosActualizacion[campo] = parseInt(req.body[campo]);
        } else if (campo === 'peso' || campo === 'altura') {
          datosActualizacion[campo] = parseFloat(req.body[campo]);
        } else if (campo === 'vacunas' || campo === 'alergias' || campo === 'personalidad' || campo === 'intereses' || campo === 'fotos') {
          datosActualizacion[campo] = Array.isArray(req.body[campo]) ? req.body[campo] : [];
        } else {
          datosActualizacion[campo] = req.body[campo];
        }
      }
    }

    const mascotaActualizada = await prisma.mascota.update({
      where: { id },
      data: datosActualizacion,
    });

    res.json({
      success: true,
      message: 'Mascota actualizada exitosamente',
      data: mascotaActualizada,
    });
  } catch (error) {
    console.error('Error actualizando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar mascota',
    });
  }
};

/**
 * Eliminar una mascota
 */
export const eliminarMascota = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { id } = req.params;

    // Verificar que la mascota pertenece al usuario
    const mascotaExistente = await prisma.mascota.findFirst({
      where: { id, usuarioId },
    });

    if (!mascotaExistente) {
      res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
      return;
    }

    await prisma.mascota.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Mascota eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mascota',
    });
  }
};


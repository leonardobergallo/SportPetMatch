// Controlador de Eventos - SportPetMatch
// Maneja CRUD de eventos y participación

import { Request, Response } from 'express';
import prisma from '../utilidades/prisma';

/**
 * Obtener todos los eventos (con filtros opcionales)
 */
export const obtenerEventos = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tipo,
      ciudad,
      fechaDesde,
      fechaHasta,
      esPetFriendly,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: any = {
      isActive: true,
    };

    if (tipo) where.tipo = tipo;
    if (esPetFriendly !== undefined) where.esPetFriendly = esPetFriendly === 'true';
    if (fechaDesde) {
      where.fechaInicio = { ...where.fechaInicio, gte: new Date(fechaDesde as string) };
    }
    if (fechaHasta) {
      where.fechaInicio = { ...where.fechaInicio, lte: new Date(fechaHasta as string) };
    }

    // Si hay filtro de ciudad, buscar por ubicaciones
    // Nota: esto requeriría una relación con UbicacionEvento

    const eventos = await prisma.evento.findMany({
      where,
      include: {
        organizador: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        participantes: {
          where: { estado: 'confirmado' },
          select: {
            usuarioId: true,
          },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Formatear respuesta
    const eventosFormateados = eventos.map((evento) => ({
      ...evento,
      participantesCount: evento._count.participantes,
      participantesIds: evento.participantes.map((p) => p.usuarioId),
    }));

    res.json({
      success: true,
      data: eventosFormateados,
    });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
    });
  }
};

/**
 * Obtener un evento por ID
 */
export const obtenerEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        organizador: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
            nivelDeporte: true,
          },
        },
        participantes: {
          where: { estado: 'confirmado' },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                avatar: true,
              },
            },
          },
        },
        ubicaciones: {
          include: {
            ubicacion: true,
          },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
    });

    if (!evento) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...evento,
        participantesCount: evento._count.participantes,
      },
    });
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener evento',
    });
  }
};

/**
 * Crear un nuevo evento
 */
export const crearEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const organizadorId = req.usuario.usuarioId;
    const {
      titulo,
      descripcion,
      tipo,
      nivelDificultad,
      fechaInicio,
      fechaFin,
      duracion,
      maxParticipantes,
      precio,
      esPetFriendly,
      esPremium,
    } = req.body;

    // Validación básica
    if (!titulo || !descripcion || !tipo || !fechaInicio) {
      res.status(400).json({
        success: false,
        message: 'Título, descripción, tipo y fecha de inicio son requeridos',
      });
      return;
    }

    const nuevoEvento = await prisma.evento.create({
      data: {
        organizadorId,
        titulo,
        descripcion,
        tipo,
        nivelDificultad: nivelDificultad ? parseInt(nivelDificultad) : 1,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        duracion: duracion ? parseInt(duracion) : null,
        maxParticipantes: maxParticipantes ? parseInt(maxParticipantes) : null,
        precio: precio ? parseFloat(precio) : null,
        esPetFriendly: esPetFriendly !== undefined ? esPetFriendly : true,
        esPremium: esPremium !== undefined ? esPremium : false,
        isActive: true,
      },
      include: {
        organizador: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: nuevoEvento,
    });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear evento',
    });
  }
};

/**
 * Actualizar un evento (solo el organizador)
 */
export const actualizarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const organizadorId = req.usuario.usuarioId;
    const { id } = req.params;

    // Verificar que el evento existe y pertenece al usuario
    const eventoExistente = await prisma.evento.findFirst({
      where: { id, organizadorId },
    });

    if (!eventoExistente) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado o no tienes permisos',
      });
      return;
    }

    const datosActualizacion: any = {};
    const camposPermitidos = [
      'titulo',
      'descripcion',
      'tipo',
      'nivelDificultad',
      'fechaInicio',
      'fechaFin',
      'duracion',
      'maxParticipantes',
      'precio',
      'esPetFriendly',
      'esPremium',
      'isActive',
    ];

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        if (campo === 'nivelDificultad' || campo === 'duracion' || campo === 'maxParticipantes') {
          datosActualizacion[campo] = parseInt(req.body[campo]);
        } else if (campo === 'precio') {
          datosActualizacion[campo] = parseFloat(req.body[campo]);
        } else if (campo === 'fechaInicio' || campo === 'fechaFin') {
          datosActualizacion[campo] = new Date(req.body[campo]);
        } else {
          datosActualizacion[campo] = req.body[campo];
        }
      }
    }

    const eventoActualizado = await prisma.evento.update({
      where: { id },
      data: datosActualizacion,
      include: {
        organizador: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: eventoActualizado,
    });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar evento',
    });
  }
};

/**
 * Eliminar un evento (solo el organizador)
 */
export const eliminarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const organizadorId = req.usuario.usuarioId;
    const { id } = req.params;

    // Verificar que el evento existe y pertenece al usuario
    const eventoExistente = await prisma.evento.findFirst({
      where: { id, organizadorId },
    });

    if (!eventoExistente) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado o no tienes permisos',
      });
      return;
    }

    await prisma.evento.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar evento',
    });
  }
};

/**
 * Unirse a un evento
 */
export const participarEvento = async (req: Request, res: Response): Promise<void> => {
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

    // Verificar que el evento existe y está activo
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        participantes: {
          where: { estado: 'confirmado' },
        },
        _count: {
          select: {
            participantes: true,
          },
        },
      },
    });

    if (!evento) {
      res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
      return;
    }

    if (!evento.isActive) {
      res.status(400).json({
        success: false,
        message: 'El evento no está activo',
      });
      return;
    }

    // Verificar límite de participantes
    if (evento.maxParticipantes && evento._count.participantes >= evento.maxParticipantes) {
      res.status(400).json({
        success: false,
        message: 'El evento ha alcanzado el límite de participantes',
      });
      return;
    }

    // Verificar si ya está participando
    const participacionExistente = await prisma.eventoParticipante.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId,
          eventoId: id,
        },
      },
    });

    if (participacionExistente) {
      if (participacionExistente.estado === 'confirmado') {
        res.status(400).json({
          success: false,
          message: 'Ya estás participando en este evento',
        });
        return;
      } else {
        // Reactivar participación cancelada
        const participacion = await prisma.eventoParticipante.update({
          where: { id: participacionExistente.id },
          data: { estado: 'confirmado' },
        });

        res.json({
          success: true,
          message: 'Te has unido al evento exitosamente',
          data: participacion,
        });
        return;
      }
    }

    // Crear nueva participación
    const participacion = await prisma.eventoParticipante.create({
      data: {
        usuarioId,
        eventoId: id,
        estado: 'confirmado',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Te has unido al evento exitosamente',
      data: participacion,
    });
  } catch (error) {
    console.error('Error participando en evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al unirse al evento',
    });
  }
};

/**
 * Salir de un evento
 */
export const salirEvento = async (req: Request, res: Response): Promise<void> => {
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

    // Buscar participación
    const participacion = await prisma.eventoParticipante.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId,
          eventoId: id,
        },
      },
    });

    if (!participacion || participacion.estado !== 'confirmado') {
      res.status(404).json({
        success: false,
        message: 'No estás participando en este evento',
      });
      return;
    }

    // Cambiar estado a cancelado en lugar de eliminar
    await prisma.eventoParticipante.update({
      where: { id: participacion.id },
      data: { estado: 'cancelado' },
    });

    res.json({
      success: true,
      message: 'Has salido del evento exitosamente',
    });
  } catch (error) {
    console.error('Error saliendo del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al salir del evento',
    });
  }
};


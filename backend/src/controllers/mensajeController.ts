// Controlador de Mensajes - SportPetMatch
// Maneja mensajes de chat entre usuarios que hicieron match

import { Request, Response } from 'express';
import prisma from '../utilidades/prisma';

/**
 * Obtener mensajes de un match/conversación específica
 */
export const obtenerMensajes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { matchId } = req.params;

    // Validación
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'ID del match es requerido',
      });
      return;
    }

    // Verificar que el match existe y que el usuario participa en él
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        usuarioId: true,
        usuarioMatchId: true,
        estado: true,
      },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match no encontrado',
      });
      return;
    }

    // Verificar que el usuario participa en este match
    if (match.usuarioId !== usuarioId && match.usuarioMatchId !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estos mensajes',
      });
      return;
    }

    // Verificar que el match está aceptado (solo matches aceptados pueden tener mensajes)
    if (match.estado !== 'aceptado') {
      res.status(403).json({
        success: false,
        message: 'Solo puedes enviar mensajes en matches aceptados',
      });
      return;
    }

    // Obtener mensajes del match
    const mensajes = await prisma.mensaje.findMany({
      where: {
        matchId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({
      success: true,
      data: mensajes,
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
    });
  }
};

/**
 * Enviar un mensaje en un match/conversación
 */
export const enviarMensaje = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { matchId, contenido, tipo = 'texto', urlArchivo } = req.body;

    // Validación
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'ID del match es requerido',
      });
      return;
    }

    if (!contenido || contenido.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'El contenido del mensaje es requerido',
      });
      return;
    }

    // Verificar que el match existe y que el usuario participa en él
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        usuarioId: true,
        usuarioMatchId: true,
        estado: true,
      },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match no encontrado',
      });
      return;
    }

    // Verificar que el usuario participa en este match
    if (match.usuarioId !== usuarioId && match.usuarioMatchId !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para enviar mensajes en este match',
      });
      return;
    }

    // Verificar que el match está aceptado
    if (match.estado !== 'aceptado') {
      res.status(403).json({
        success: false,
        message: 'Solo puedes enviar mensajes en matches aceptados',
      });
      return;
    }

    // Crear el mensaje
    const nuevoMensaje = await prisma.mensaje.create({
      data: {
        matchId,
        usuarioId,
        contenido: contenido.trim(),
        tipo,
        urlArchivo: urlArchivo || null,
        isLeido: false,
      },
      include: {
        usuario: {
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
      message: 'Mensaje enviado exitosamente',
      data: nuevoMensaje,
    });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje',
    });
  }
};

/**
 * Marcar mensajes como leídos
 */
export const marcarComoLeido = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { matchId } = req.body;

    // Validación
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'ID del match es requerido',
      });
      return;
    }

    // Verificar que el match existe y que el usuario participa en él
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        usuarioId: true,
        usuarioMatchId: true,
        estado: true,
      },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match no encontrado',
      });
      return;
    }

    // Verificar que el usuario participa en este match
    if (match.usuarioId !== usuarioId && match.usuarioMatchId !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para marcar mensajes de este match',
      });
      return;
    }

    // Obtener el ID del otro usuario (para marcar solo los mensajes que no son del usuario actual)
    const otroUsuarioId = match.usuarioId === usuarioId 
      ? match.usuarioMatchId 
      : match.usuarioId;

    // Marcar todos los mensajes no leídos del otro usuario como leídos
    const resultado = await prisma.mensaje.updateMany({
      where: {
        matchId,
        usuarioId: otroUsuarioId,
        isLeido: false,
      },
      data: {
        isLeido: true,
      },
    });

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos',
      data: {
        mensajesActualizados: resultado.count,
      },
    });
  } catch (error) {
    console.error('Error marcando mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos',
    });
  }
};

/**
 * Obtener cantidad de mensajes no leídos por match
 */
export const obtenerMensajesNoLeidos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    // Obtener todos los matches del usuario que están aceptados
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { usuarioId },
          { usuarioMatchId: usuarioId },
        ],
        estado: 'aceptado',
      },
      select: {
        id: true,
      },
    });

    const matchIds = matches.map(m => m.id);

    if (matchIds.length === 0) {
      res.json({
        success: true,
        data: [],
      });
      return;
    }

    // Para cada match, obtener los mensajes no leídos del otro usuario
    const mensajesNoLeidosPorMatch = await Promise.all(
      matchIds.map(async (matchId) => {
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          select: {
            id: true,
            usuarioId: true,
            usuarioMatchId: true,
          },
        });

        if (!match) return null;

        const otroUsuarioId = match.usuarioId === usuarioId 
          ? match.usuarioMatchId 
          : match.usuarioId;

        const count = await prisma.mensaje.count({
          where: {
            matchId,
            usuarioId: otroUsuarioId,
            isLeido: false,
          },
        });

        return {
          matchId,
          noLeidos: count,
        };
      })
    );

    const resultado = mensajesNoLeidosPorMatch.filter(item => item !== null);

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Error obteniendo mensajes no leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes no leídos',
    });
  }
};


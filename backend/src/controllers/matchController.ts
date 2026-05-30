// Controlador de Matches - SportPetMatch
// Maneja matching y recomendaciones de usuarios y eventos

import { Request, Response } from 'express';
import prisma from '../utilidades/prisma';

function normalizarTipoUsuario(tipoUsuario?: string | null): string {
  if (!tipoUsuario) return 'dueno';

  const legacyMap: Record<string, string> = {
    solo: 'cuidador',
    con_mascota: 'dueno',
    ambos: 'familia',
  };

  return legacyMap[tipoUsuario] || tipoUsuario;
}

function obtenerTiposCompatibles(tipoUsuario?: string | null): string[] {
  const tipoNormalizado = normalizarTipoUsuario(tipoUsuario);

  const compatibles: Record<string, string[]> = {
    dueno: ['dueno', 'familia', 'cuidador'],
    familia: ['dueno', 'familia', 'cuidador'],
    cuidador: ['dueno', 'familia', 'cuidador'],
  };

  return compatibles[tipoNormalizado] || ['dueno', 'familia', 'cuidador'];
}

/**
 * Obtener usuarios recomendados basado en intereses, tipo y ubicación
 */
export const obtenerRecomendaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    // Obtener perfil del usuario actual
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        intereses: true,
        tipoUsuario: true,
        ubicacionLat: true,
        ubicacionLng: true,
        ubicacionCiudad: true,
        nivelDeporte: true,
        mascotas: {
          select: {
            intereses: true,
          },
        },
      },
    });

    if (!usuarioActual) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Obtener usuarios que ya hicieron match para excluirlos
    const matchesExistentes = await prisma.match.findMany({
      where: {
        OR: [
          { usuarioId },
          { usuarioMatchId: usuarioId },
        ],
      },
      select: {
        usuarioId: true,
        usuarioMatchId: true,
      },
    });

    const idsExcluidos = matchesExistentes.map(m => 
      m.usuarioId === usuarioId ? m.usuarioMatchId : m.usuarioId
    );
    idsExcluidos.push(usuarioId);

    // Construir query de búsqueda
    const where: any = {
      id: { notIn: idsExcluidos },
      isActive: true,
      onboardingCompletado: true, // Solo usuarios con onboarding completo
    };

    // Filtrar por perfiles compatibles, soportando valores legacy y los nuevos del onboarding
    where.tipoUsuario = {
      in: obtenerTiposCompatibles(usuarioActual.tipoUsuario),
    };

    // Obtener usuarios potenciales
    const usuariosPotenciales = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        avatar: true,
        biografia: true,
        ubicacionLat: true,
        ubicacionLng: true,
        ubicacionCiudad: true,
        intereses: true,
        tipoUsuario: true,
        nivelDeporte: true,
        mascotas: {
          select: {
            nombre: true,
            tipo: true,
            fotos: true,
            intereses: true,
          },
        },
      },
      take: 50, // Limitar resultados
    });

    // Calcular puntuaciones de compatibilidad
    const usuariosConScore = usuariosPotenciales.map(usuario => {
      let score = 0;

      // Coincidencias de intereses del usuario
      const interesesComunes = usuarioActual.intereses.filter(interes =>
        usuario.intereses.includes(interes)
      );
      score += interesesComunes.length * 10; // 10 puntos por interés común

      // Coincidencias de intereses de mascotas (solo si ambos tienen mascotas)
      if (usuarioActual.mascotas && usuarioActual.mascotas.length > 0 && 
          usuario.mascotas && usuario.mascotas.length > 0) {
        const interesesMascotasUsuario = usuarioActual.mascotas.flatMap(m => m.intereses);
        const interesesMascotasMatch = usuario.mascotas.flatMap(m => m.intereses);
        const interesesMascotasComunes = interesesMascotasUsuario.filter(interes =>
          interesesMascotasMatch.includes(interes)
        );
        score += interesesMascotasComunes.length * 5; // 5 puntos por interés de mascota común
      }

      // Compatibilidad de perfil
      if (normalizarTipoUsuario(usuarioActual.tipoUsuario) === normalizarTipoUsuario(usuario.tipoUsuario)) {
        score += 15; // Bonificación por ser exactamente iguales
      }

      // Cálculo de distancia (opcional)
      let distancia = null;
      if (usuarioActual.ubicacionLat && usuarioActual.ubicacionLng && 
          usuario.ubicacionLat && usuario.ubicacionLng) {
        distancia = calcularDistancia(
          usuarioActual.ubicacionLat,
          usuarioActual.ubicacionLng,
          usuario.ubicacionLat,
          usuario.ubicacionLng
        );
        // Bonificación por estar cerca (< 5km)
        if (distancia < 5) {
          score += 20;
        } else if (distancia < 10) {
          score += 10;
        }
      }

      // Bonificación por nivel de participación similar
      if (usuarioActual.nivelDeporte && usuario.nivelDeporte) {
        if (Math.abs(usuarioActual.nivelDeporte - usuario.nivelDeporte) <= 1) {
          score += 5;
        }
      }

      return {
        ...usuario,
        score,
        interesesComunes: interesesComunes.length,
        distancia,
      };
    });

    // Ordenar por score (mayor a menor)
    usuariosConScore.sort((a, b) => b.score - a.score);

    // Limitar a los top 20
    const recomendaciones = usuariosConScore.slice(0, 20);

    res.json({
      success: true,
      data: recomendaciones,
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendaciones',
    });
  }
};

/**
 * Crear un match entre dos usuarios
 */
export const crearMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { usuarioMatchId, mensajeInicial, eventoPropuestoId } = req.body;

    // Validación
    if (!usuarioMatchId) {
      res.status(400).json({
        success: false,
        message: 'ID del usuario es requerido',
      });
      return;
    }

    if (usuarioId === usuarioMatchId) {
      res.status(400).json({
        success: false,
        message: 'No puedes hacer match contigo mismo',
      });
      return;
    }

    // Verificar que el usuario objetivo existe
    const usuarioMatch = await prisma.usuario.findUnique({
      where: { id: usuarioMatchId },
    });

    if (!usuarioMatch) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Verificar si ya existe un match entre ambos usuarios
    const matchExistente = await prisma.match.findFirst({
      where: {
        OR: [
          { usuarioId, usuarioMatchId },
          { usuarioId: usuarioMatchId, usuarioMatchId: usuarioId },
        ],
      },
    });

    if (matchExistente) {
      if (matchExistente.estado !== 'aceptado') {
        const matchAceptado = await prisma.match.update({
          where: { id: matchExistente.id },
          data: {
            estado: 'aceptado',
          },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                avatar: true,
              },
            },
            usuarioMatch: {
              select: {
                id: true,
                nombre: true,
                avatar: true,
              },
            },
            eventoPropuesto: matchExistente.eventoPropuestoId ? {
              select: {
                id: true,
                titulo: true,
                fechaInicio: true,
              },
            } : false,
          },
        });

        res.status(200).json({
          success: true,
          message: '¡Es un match! Ahora pueden chatear.',
          data: matchAceptado,
        });
        return;
      }

      const matchAceptado = await prisma.match.findUnique({
        where: { id: matchExistente.id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              avatar: true,
            },
          },
          usuarioMatch: {
            select: {
              id: true,
              nombre: true,
              avatar: true,
            },
          },
          eventoPropuesto: matchExistente.eventoPropuestoId ? {
            select: {
              id: true,
              titulo: true,
              fechaInicio: true,
            },
          } : false,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Ya tenes un match con este usuario. Pueden chatear.',
        data: matchAceptado,
      });
      return;
    }

    // Validar evento propuesto si existe
    if (eventoPropuestoId) {
      const evento = await prisma.evento.findUnique({
        where: { id: eventoPropuestoId },
      });

      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento no encontrado',
        });
        return;
      }
    }

    // En la beta, tocar "Match" abre la conversacion directamente.
    const nuevoMatch = await prisma.match.create({
      data: {
        usuarioId,
        usuarioMatchId,
        mensajeInicial: mensajeInicial || null,
        eventoPropuestoId: eventoPropuestoId || null,
        estado: 'aceptado',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        usuarioMatch: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        eventoPropuesto: eventoPropuestoId ? {
          select: {
            id: true,
            titulo: true,
            fechaInicio: true,
          },
        } : false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Match creado. Ya pueden chatear.',
      data: nuevoMatch,
    });
  } catch (error) {
    console.error('Error creando match:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear match',
    });
  }
};

/**
 * Obtener mis matches
 */
export const obtenerMisMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { usuarioId },
          { usuarioMatchId: usuarioId },
        ],
        estado: 'aceptado', // Solo matches aceptados
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        usuarioMatch: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        eventoPropuesto: {
          select: {
            id: true,
            titulo: true,
            fechaInicio: true,
          },
        },
      },
      orderBy: {
        fechaMatch: 'desc',
      },
    });

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error('Error obteniendo matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener matches',
    });
  }
};

/**
 * Aceptar o rechazar un match
 */
export const responderMatch = async (req: Request, res: Response): Promise<void> => {
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
    const { accion } = req.body; // 'aceptar' o 'rechazar'

    if (!accion || !['aceptar', 'rechazar'].includes(accion)) {
      res.status(400).json({
        success: false,
        message: 'Acción inválida. Debe ser "aceptar" o "rechazar"',
      });
      return;
    }

    // Buscar el match
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match no encontrado',
      });
      return;
    }

    // Verificar que el usuario puede responder este match
    if (match.usuarioMatchId !== usuarioId) {
      res.status(403).json({
        success: false,
        message: 'No tienes permiso para responder este match',
      });
      return;
    }

    // Actualizar estado del match
    const matchActualizado = await prisma.match.update({
      where: { id },
      data: {
        estado: accion === 'aceptar' ? 'aceptado' : 'rechazado',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        usuarioMatch: {
          select: {
            id: true,
            nombre: true,
            avatar: true,
          },
        },
        eventoPropuesto: {
          select: {
            id: true,
            titulo: true,
            fechaInicio: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: `Match ${accion === 'aceptar' ? 'aceptado' : 'rechazado'} exitosamente`,
      data: matchActualizado,
    });
  } catch (error) {
    console.error('Error respondiendo match:', error);
    res.status(500).json({
      success: false,
      message: 'Error al responder match',
    });
  }
};

/**
 * Función auxiliar para calcular distancia entre dos puntos (Haversine formula)
 */
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recomendar eventos basados en intereses del usuario
 */
export const obtenerRecomendacionesEventos = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    // Obtener perfil del usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        intereses: true,
        tipoUsuario: true,
        ubicacionLat: true,
        ubicacionLng: true,
      },
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Construir filtros
    const where: any = {
      isActive: true,
      fechaInicio: {
        gte: new Date(), // Solo eventos futuros
      },
    };

    // Obtener eventos
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
      orderBy: {
        fechaInicio: 'asc',
      },
      take: 50,
    });

    // Calcular relevancia de eventos
    const eventosConScore = eventos.map(evento => {
      let score = 0;

      // Coincidencias de tipo de evento con intereses
      if (usuario.intereses.includes(evento.tipo)) {
        score += 20;
      }

      // Compatibilidad con perfil del usuario
      if (evento.esPetFriendly) {
        score += 15;
      }

      const tipoUsuarioNormalizado = normalizarTipoUsuario(usuario.tipoUsuario);
      if ((tipoUsuarioNormalizado === 'dueno' || tipoUsuarioNormalizado === 'familia') && evento.esPetFriendly) {
        score += 5;
      }

      // Distancia (si está disponible)
      let distancia = null;
      if (usuario.ubicacionLat && usuario.ubicacionLng) {
        // Nota: Necesitaríamos obtener la ubicación del evento
        // Por ahora asumimos que no está disponible
      }

      return {
        ...evento,
        score,
        participantesCount: evento._count.participantes,
        distancia,
      };
    });

    // Ordenar por score
    eventosConScore.sort((a, b) => b.score - a.score);

    // Top 20 eventos recomendados
    const recomendaciones = eventosConScore.slice(0, 20);

    res.json({
      success: true,
      data: recomendaciones,
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recomendaciones de eventos',
    });
  }
};

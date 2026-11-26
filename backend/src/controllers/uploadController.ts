import { Request, Response } from 'express';
import { subirImagen, estaConfigurado } from '../utilidades/cloudinary';
import prisma from '../utilidades/prisma';

/** Máximo de fotos en la galería del perfil. */
const MAX_FOTOS_PERFIL = 6;

/** Sube una imagen a Cloudinary o, si falla/no está configurado, la guarda como data URI. */
async function imagenAUrl(archivo: any, carpeta: string, nombre: string): Promise<string> {
  if (estaConfigurado()) {
    try {
      return await subirImagen(archivo.buffer, carpeta, nombre);
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);
    }
  }
  return `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
}

export const subirAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;

    const imageUrl = await imagenAUrl(req.file, 'avatars', `avatar_${usuarioId}`);

    // avatar y fotos[0] se mantienen sincronizados: la primera foto de la
    // galería es la foto de perfil que ven el resto de las pantallas.
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { fotos: true },
    });
    const fotos = [
      imageUrl,
      ...(usuario?.fotos || []).filter((foto) => foto !== imageUrl),
    ].slice(0, MAX_FOTOS_PERFIL);

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatar: imageUrl, fotos },
      select: {
        id: true,
        avatar: true,
        fotos: true,
      },
    });

    res.json({
      success: true,
      message: 'Avatar subido exitosamente',
      data: {
        avatar: usuarioActualizado.avatar,
        fotos: usuarioActualizado.fotos,
      },
    });
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir avatar',
    });
  }
};

export const subirFotosMascota = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const { id: mascotaId } = req.params;

    if (!mascotaId) {
      res.status(400).json({
        success: false,
        message: 'ID de mascota es requerido',
      });
      return;
    }

    const mascota = await prisma.mascota.findFirst({
      where: {
        id: mascotaId,
        usuarioId,
      },
    });

    if (!mascota) {
      res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
      return;
    }

    let archivos: any[] = [];
    
    if (Array.isArray(req.files)) {
      archivos = req.files;
    } else if (req.files && typeof req.files === 'object') {
      const filesObj = req.files as { [fieldname: string]: any[] };
      archivos = Object.values(filesObj).flat();
    }
    
    if (archivos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos válidos',
      });
      return;
    }

    const fotosUrls: string[] = [];

    for (const archivo of archivos) {
      let imageUrl: string;
      if (estaConfigurado()) {
        try {
          imageUrl = await subirImagen(
            archivo.buffer,
            'mascotas',
            `mascota_${mascotaId}_${Date.now()}`
          );
        } catch (error) {
          console.error('Error subiendo a Cloudinary:', error);
          imageUrl = `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
        }
      } else {
        imageUrl = `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
      }
      fotosUrls.push(imageUrl);
    }

    const fotosExistentes = mascota.fotos || [];
    const todasLasFotos = [...fotosExistentes, ...fotosUrls];

    const mascotaActualizada = await prisma.mascota.update({
      where: { id: mascotaId },
      data: { fotos: todasLasFotos },
      select: {
        id: true,
        fotos: true,
      },
    });

    res.json({
      success: true,
      message: 'Fotos subidas exitosamente',
      data: {
        fotos: mascotaActualizada.fotos,
      },
    });
  } catch (error) {
    console.error('Error subiendo fotos de mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir fotos',
    });
  }
};

/**
 * Agrega fotos a la galería del perfil del usuario autenticado.
 * Campo del formulario: `images` (hasta 10 archivos por request).
 */
export const subirFotosPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const archivos: any[] = Array.isArray(req.files)
      ? req.files
      : Object.values((req.files as Record<string, any[]>) || {}).flat();

    if (archivos.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes',
      });
      return;
    }

    const usuarioId = req.usuario.usuarioId;
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { fotos: true },
    });

    if (!usuario) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const existentes = usuario.fotos || [];
    const lugaresLibres = MAX_FOTOS_PERFIL - existentes.length;

    if (lugaresLibres <= 0) {
      res.status(400).json({
        success: false,
        message: `Ya tenés el máximo de ${MAX_FOTOS_PERFIL} fotos en tu perfil`,
      });
      return;
    }

    const nuevasUrls: string[] = [];
    const seleccionados = archivos.slice(0, lugaresLibres);

    for (let index = 0; index < seleccionados.length; index++) {
      nuevasUrls.push(
        await imagenAUrl(
          seleccionados[index],
          'perfiles',
          `perfil_${usuarioId}_${Date.now()}_${index}`
        )
      );
    }

    const fotos = [...existentes, ...nuevasUrls].slice(0, MAX_FOTOS_PERFIL);

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { fotos, avatar: fotos[0] || null },
      select: { id: true, fotos: true, avatar: true },
    });

    res.json({
      success: true,
      message: 'Fotos de perfil subidas exitosamente',
      data: {
        fotos: usuarioActualizado.fotos,
        avatar: usuarioActualizado.avatar,
      },
    });
  } catch (error) {
    console.error('Error subiendo fotos de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir fotos de perfil',
    });
  }
};
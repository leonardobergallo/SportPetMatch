import { Request, Response } from 'express';
import { subirImagen, estaConfigurado } from '../utilidades/cloudinary';
import prisma from '../utilidades/prisma';

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

    let imageUrl: string;
    if (estaConfigurado()) {
      try {
        imageUrl = await subirImagen(req.file.buffer, 'avatars', `avatar_${usuarioId}`);
      } catch (error) {
        console.error('Error subiendo a Cloudinary:', error);
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatar: imageUrl },
      select: {
        id: true,
        avatar: true,
      },
    });

    res.json({
      success: true,
      message: 'Avatar subido exitosamente',
      data: {
        avatar: usuarioActualizado.avatar,
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
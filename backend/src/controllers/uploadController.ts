// Controlador para subida de imágenes - SportPetMatch
import { Request, Response } from 'express';
import multer from 'multer';
import { subirImagen, estaConfigurado } from '../utilidades/cloudinary';

// Declarar tipo multer.File
declare module 'multer' {
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
}
import prisma from '../utilidades/prisma';

/**
 * Subir avatar del usuario
 */
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

    // Si Cloudinary está configurado, subir allí
    let imageUrl: string;
    if (estaConfigurado()) {
      try {
        imageUrl = await subirImagen(req.file.buffer, 'avatars', `avatar_${usuarioId}`);
      } catch (error) {
        console.error('Error subiendo a Cloudinary:', error);
        // Si falla Cloudinary, usar base64 como fallback
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else {
      // Si no está configurado Cloudinary, usar base64
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    // Actualizar avatar del usuario
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

/**
 * Subir fotos de mascota
 */
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
    const { id: mascotaId } = req.params; // Obtener ID de los parámetros de la ruta

    if (!mascotaId) {
      res.status(400).json({
        success: false,
        message: 'ID de mascota es requerido',
      });
      return;
    }

    // Verificar que la mascota pertenece al usuario
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

    // Normalizar archivos: req.files puede ser array, objeto con campos, o undefined
    let archivos: multer.File[] = [];
    
    if (Array.isArray(req.files)) {
      // Caso: upload.array() - req.files es un array
      archivos = req.files;
    } else if (req.files && typeof req.files === 'object') {
      // Caso: upload.fields() - req.files es un objeto { [fieldname]: File[] }
      // Extraer todos los archivos de todos los campos
      const filesObj = req.files as { [fieldname: string]: multer.File[] };
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

    // Subir cada imagen
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
          // Fallback a base64
          imageUrl = `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
        }
      } else {
        // Fallback a base64 si no hay Cloudinary
        imageUrl = `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
      }
      fotosUrls.push(imageUrl);
    }

    // Actualizar fotos de la mascota (agregar a las existentes)
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


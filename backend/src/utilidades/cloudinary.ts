// Utilidad para subir imágenes a Cloudinary
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
const configPath = path.resolve(__dirname, '../../config.env');
dotenv.config({ path: configPath });

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Subir imagen a Cloudinary desde buffer
 * @param buffer Buffer de la imagen
 * @param folder Carpeta en Cloudinary (ej: 'avatars', 'mascotas')
 * @param publicId ID público opcional
 * @returns URL de la imagen subida
 */
export const subirImagen = async (
  buffer: Buffer,
  folder: string = 'sportpetmatch',
  publicId?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image' as const,
      format: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Error subiendo a Cloudinary:', error);
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No se recibió resultado de Cloudinary'));
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Subir imagen desde URL (para casos donde ya tenemos una URL)
 * @param imageUrl URL de la imagen
 * @param folder Carpeta en Cloudinary
 * @returns URL de la imagen subida
 */
export const subirImagenDesdeURL = async (
  imageUrl: string,
  folder: string = 'sportpetmatch'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error subiendo imagen desde URL:', error);
    throw error;
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param publicId ID público de la imagen en Cloudinary
 */
export const eliminarImagen = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw error;
  }
};

/**
 * Verificar si Cloudinary está configurado
 */
export const estaConfigurado = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};


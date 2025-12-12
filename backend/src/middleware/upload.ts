// Middleware para manejar subida de archivos con Multer
import multer from 'multer';
import { Request } from 'express';

// Configuración de tipos de archivo permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configurar almacenamiento en memoria (para luego subir a Cloudinary)
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'));
  }
};

// Configurar multer
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

// Middleware para subir una sola imagen
export const uploadSingle = upload.single('image');

// Middleware para subir múltiples imágenes
export const uploadMultiple = upload.array('images', 10); // Máximo 10 imágenes


// Servicio para subida de imágenes - SportPetMatch
import apiClient from './apiClient';
import { Platform } from 'react-native';

/**
 * Subir avatar del usuario
 * @param imageUri URI local de la imagen
 * @returns URL de la imagen subida
 */
export const subirAvatar = async (imageUri: string): Promise<string> => {
  try {
    // Convertir imagen a FormData
    const formData = new FormData();
    
    // Obtener nombre del archivo desde la URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Manejar diferente para web y mobile
    if (Platform.OS === 'web') {
      // Para web, necesitamos convertir la URI a Blob/File
      try {
        // Si es una data URI, convertirla directamente
        if (imageUri.startsWith('data:')) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type || type });
          formData.append('image', file);
        } else {
          // Si es una URL, hacer fetch
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type || type });
          formData.append('image', file);
        }
      } catch (fetchError: any) {
        console.error('Error convirtiendo imagen para web:', fetchError);
        throw new Error('No se pudo procesar la imagen para subir: ' + (fetchError.message || 'Error desconocido'));
      }
    } else {
      // Para React Native (iOS/Android)
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    }

    const response = await apiClient.post('/usuarios/mi-perfil/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data.avatar) {
      return response.data.data.avatar;
    }

    throw new Error('No se recibió la URL del avatar');
  } catch (error: any) {
    console.error('Error subiendo avatar:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al subir avatar';
    throw new Error(errorMessage);
  }
};

/**
 * Subir fotos de mascota
 * @param mascotaId ID de la mascota
 * @param imageUris Array de URIs locales de las imágenes
 * @returns Array de URLs de las imágenes subidas
 */
export const subirFotosMascota = async (
  mascotaId: string,
  imageUris: string[]
): Promise<string[]> => {
  try {
    if (!imageUris || imageUris.length === 0) {
      throw new Error('No se proporcionaron imágenes para subir');
    }

    // Convertir imágenes a FormData
    const formData = new FormData();

    // Agregar cada imagen
    for (let index = 0; index < imageUris.length; index++) {
      const uri = imageUris[index];
      const filename = uri.split('/').pop() || `foto_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Manejar diferente para web y mobile
      if (Platform.OS === 'web') {
        // Para web, convertir a Blob/File
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type || type });
          formData.append('images', file);
        } catch (fetchError: any) {
          console.error(`Error convirtiendo imagen ${index} para web:`, fetchError);
          throw new Error(`No se pudo procesar la imagen ${index + 1}: ${fetchError.message || 'Error desconocido'}`);
        }
      } else {
        // Para React Native (iOS/Android)
        formData.append('images', {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      }
    }

    const response = await apiClient.post(`/mascotas/${mascotaId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data.fotos) {
      return response.data.data.fotos;
    }

    throw new Error('No se recibieron las URLs de las fotos');
  } catch (error: any) {
    console.error('Error subiendo fotos de mascota:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al subir fotos';
    throw new Error(errorMessage);
  }
};


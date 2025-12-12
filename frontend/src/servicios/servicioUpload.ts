// Servicio para subida de imágenes - SportPetMatch
import apiClient from './apiClient';

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

    // En React Native, necesitamos usar el formato correcto para FormData
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

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
    throw new Error(error.response?.data?.message || 'Error al subir avatar');
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
    // Convertir imágenes a FormData
    const formData = new FormData();

    // Agregar cada imagen
    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `foto_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('images', {
        uri: uri,
        name: filename,
        type: type,
      } as any);
    });

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
    throw new Error(error.response?.data?.message || 'Error al subir fotos');
  }
};


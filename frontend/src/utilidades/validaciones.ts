// Utilidades de validación - SportPetMatch

/**
 * Validar formato de email
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de teléfono (acepta números con o sin guiones/espacios)
 */
export const validarTelefono = (telefono: string): boolean => {
  // Remover espacios, guiones y paréntesis
  const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  // Debe tener entre 8 y 15 dígitos
  return /^\d{8,15}$/.test(telefonoLimpio);
};

/**
 * Validar contraseña (mínimo 6 caracteres)
 */
export const validarContraseña = (contraseña: string): boolean => {
  return contraseña.length >= 6;
};

/**
 * Validar que un campo no esté vacío
 */
export const validarCampoRequerido = (valor: string): boolean => {
  return valor.trim().length > 0;
};

/**
 * Validar número entero positivo
 */
export const validarNumeroEntero = (valor: string, min?: number, max?: number): boolean => {
  const numero = parseInt(valor, 10);
  if (isNaN(numero)) return false;
  if (min !== undefined && numero < min) return false;
  if (max !== undefined && numero > max) return false;
  return true;
};

/**
 * Validar número decimal positivo
 */
export const validarNumeroDecimal = (valor: string, min?: number, max?: number): boolean => {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return false;
  if (min !== undefined && numero < min) return false;
  if (max !== undefined && numero > max) return false;
  return true;
};

/**
 * Validar fecha de nacimiento (debe ser en el pasado y usuario debe ser mayor de 13 años)
 */
export const validarFechaNacimiento = (fecha: string): { valida: boolean; mensaje?: string } => {
  const fechaNacimiento = new Date(fecha);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  
  if (fechaNacimiento > hoy) {
    return { valida: false, mensaje: 'La fecha de nacimiento no puede ser en el futuro' };
  }
  
  if (edad < 13 || (edad === 13 && mes < 0)) {
    return { valida: false, mensaje: 'Debes ser mayor de 13 años para usar esta aplicación' };
  }
  
  if (edad > 120) {
    return { valida: false, mensaje: 'La fecha de nacimiento no es válida' };
  }
  
  return { valida: true };
};

/**
 * Validar URL de imagen
 */
export const validarURLImagen = (url: string): boolean => {
  if (!url) return false;
  // Acepta URLs http/https o data URIs
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
};

/**
 * Mensajes de error comunes
 */
export const mensajesError = {
  campoRequerido: (campo: string) => `${campo} es requerido`,
  emailInvalido: 'El formato del email no es válido',
  telefonoInvalido: 'El formato del teléfono no es válido',
  contraseñaCorta: 'La contraseña debe tener al menos 6 caracteres',
  numeroInvalido: 'Debe ser un número válido',
  numeroFueraDeRango: (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `El número debe estar entre ${min} y ${max}`;
    }
    if (min !== undefined) {
      return `El número debe ser mayor o igual a ${min}`;
    }
    if (max !== undefined) {
      return `El número debe ser menor o igual a ${max}`;
    }
    return 'El número no es válido';
  },
};


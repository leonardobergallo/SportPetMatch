// Utilidades de validacion - SportPetMatch

export interface ResultadoValidacion {
  valida: boolean;
  mensaje?: string;
}

export const normalizarEmail = (email: string): string => email.trim().toLowerCase();

export const normalizarTelefono = (telefono: string): string =>
  telefono.replace(/[\s\-\(\)]/g, '').trim();

/**
 * Validar formato de email
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalizarEmail(email));
};

/**
 * Validar formato de telefono (acepta numeros con o sin guiones/espacios)
 */
export const validarTelefono = (telefono: string): boolean => {
  const telefonoLimpio = normalizarTelefono(telefono);
  return /^\d{8,15}$/.test(telefonoLimpio);
};

/**
 * Validar contrasena (minimo 6 caracteres)
 */
export const validarContrasena = (contrasena: string): boolean => {
  return contrasena.trim().length >= 6;
};

// Alias para mantener compatibilidad con imports existentes.
export const validarContraseña = validarContrasena;

/**
 * Validar que un campo no este vacio
 */
export const validarCampoRequerido = (valor: string): boolean => {
  return valor.trim().length > 0;
};

export const validarNombre = (nombre: string): ResultadoValidacion => {
  const valor = nombre.trim();

  if (!valor) {
    return { valida: false, mensaje: mensajesError.campoRequerido('El nombre') };
  }

  if (valor.length < 2) {
    return { valida: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
  }

  return { valida: true };
};

export const validarRegistro = (datos: {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
}): ResultadoValidacion => {
  const nombre = validarNombre(datos.nombre);
  if (!nombre.valida) {
    return nombre;
  }

  if (!validarCampoRequerido(datos.email)) {
    return { valida: false, mensaje: mensajesError.campoRequerido('El email') };
  }

  if (!validarEmail(datos.email)) {
    return { valida: false, mensaje: mensajesError.emailInvalido };
  }

  if (!validarCampoRequerido(datos.password)) {
    return { valida: false, mensaje: mensajesError.campoRequerido('La contrasena') };
  }

  if (!validarContrasena(datos.password)) {
    return { valida: false, mensaje: mensajesError.contrasenaCorta };
  }

  if (datos.password !== datos.confirmarPassword) {
    return { valida: false, mensaje: 'Las contrasenas no coinciden' };
  }

  if (datos.telefono?.trim() && !validarTelefono(datos.telefono)) {
    return { valida: false, mensaje: mensajesError.telefonoInvalido };
  }

  return { valida: true };
};

export const validarLogin = (datos: { email: string; password: string }): ResultadoValidacion => {
  if (!validarCampoRequerido(datos.email) || !validarCampoRequerido(datos.password)) {
    return { valida: false, mensaje: 'Completa correo y contrasena' };
  }

  if (!validarEmail(datos.email)) {
    return { valida: false, mensaje: 'Correo no valido' };
  }

  return { valida: true };
};

/**
 * Validar numero entero positivo
 */
export const validarNumeroEntero = (valor: string, min?: number, max?: number): boolean => {
  const numero = parseInt(valor, 10);
  if (isNaN(numero)) return false;
  if (min !== undefined && numero < min) return false;
  if (max !== undefined && numero > max) return false;
  return true;
};

/**
 * Validar numero decimal positivo
 */
export const validarNumeroDecimal = (valor: string, min?: number, max?: number): boolean => {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return false;
  if (min !== undefined && numero < min) return false;
  if (max !== undefined && numero > max) return false;
  return true;
};

/**
 * Validar fecha de nacimiento
 */
export const validarFechaNacimiento = (fecha: string): ResultadoValidacion => {
  const fechaNacimiento = new Date(fecha);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();

  if (fechaNacimiento > hoy) {
    return { valida: false, mensaje: 'La fecha de nacimiento no puede ser en el futuro' };
  }

  if (edad < 13 || (edad === 13 && mes < 0)) {
    return { valida: false, mensaje: 'Debes ser mayor de 13 anos para usar esta aplicacion' };
  }

  if (edad > 120) {
    return { valida: false, mensaje: 'La fecha de nacimiento no es valida' };
  }

  return { valida: true };
};

/**
 * Validar URL de imagen
 */
export const validarURLImagen = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
};

/**
 * Mensajes de error comunes
 */
export const mensajesError = {
  campoRequerido: (campo: string) => `${campo} es requerido`,
  emailInvalido: 'El formato del email no es valido',
  telefonoInvalido: 'El formato del telefono no es valido',
  contrasenaCorta: 'La contrasena debe tener al menos 6 caracteres',
  // Alias de compatibilidad con codigo legacy
  contraseñaCorta: 'La contrasena debe tener al menos 6 caracteres',
  numeroInvalido: 'Debe ser un numero valido',
  numeroFueraDeRango: (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      return `El numero debe estar entre ${min} y ${max}`;
    }
    if (min !== undefined) {
      return `El numero debe ser mayor o igual a ${min}`;
    }
    if (max !== undefined) {
      return `El numero debe ser menor o igual a ${max}`;
    }
    return 'El numero no es valido';
  },
};

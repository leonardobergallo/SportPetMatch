// Utilidades para componentes UI
// Adaptado de shadcn/ui para React Native

/**
 * Combina nombres de clases (útil para estilos condicionales)
 * @param inputs - Nombres de clases o condiciones
 * @returns String combinado
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Convierte un valor oklch a hex para React Native
 * Para mantener compatibilidad con los colores de la estructura
 */
export function oklchToHex(oklch: string): string {
  // Por ahora retornamos los valores ya convertidos
  // Esto es solo para referencia
  return '#000000';
}


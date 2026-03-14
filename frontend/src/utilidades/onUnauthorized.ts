/**
 * Callback global para cuando el API devuelve 401 (token inválido o expirado).
 * El ProveedorAuth lo registra para cerrar sesión y que la app muestre Login.
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null): void {
  onUnauthorized = callback;
}

export function getOnUnauthorized(): (() => void) | null {
  return onUnauthorized;
}

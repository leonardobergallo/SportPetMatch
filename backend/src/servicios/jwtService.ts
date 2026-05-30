// Servicio JWT - Manejo de tokens de autenticación
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as string | number;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as string | number;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET y JWT_REFRESH_SECRET son obligatorios.');
}

export interface TokenPayload {
  usuarioId: string;
  email: string;
}

/**
 * Genera un token JWT de acceso
 */
export function generarTokenAcceso(payload: TokenPayload): string {
  // @ts-ignore - expiresIn acepta string en runtime aunque TypeScript sea estricto
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Genera un token JWT de refresh
 */
export function generarTokenRefresh(payload: TokenPayload): string {
  // @ts-ignore - expiresIn acepta string en runtime aunque TypeScript sea estricto
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un token JWT de acceso
 */
export function verificarTokenAcceso(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Verifica y decodifica un token JWT de refresh
 */
export function verificarTokenRefresh(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
}

/**
 * Genera ambos tokens (acceso y refresh)
 */
export function generarTokens(payload: TokenPayload): { token: string; refreshToken: string } {
  return {
    token: generarTokenAcceso(payload),
    refreshToken: generarTokenRefresh(payload),
  };
}


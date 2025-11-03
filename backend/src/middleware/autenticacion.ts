// Middleware de autenticación - Verifica tokens JWT
import { Request, Response, NextFunction } from 'express';
import { verificarTokenAcceso, TokenPayload } from '../servicios/jwtService';

// Extender el tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación JWT
 */
export function middlewareAutenticacion(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado',
      });
      return;
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Usa: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // Verificar token
    const payload = verificarTokenAcceso(token);

    // Agregar información del usuario a la request
    req.usuario = payload;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Token inválido',
    });
  }
}

/**
 * Middleware opcional - No falla si no hay token, pero agrega usuario si existe
 */
export function middlewareAutenticacionOpcional(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const payload = verificarTokenAcceso(token);
        req.usuario = payload;
      }
    }

    next();
  } catch (error) {
    // Ignorar errores y continuar sin autenticación
    next();
  }
}


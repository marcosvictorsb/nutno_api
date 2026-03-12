import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import logger from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware de autenticação JWT
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Token não fornecido');
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
      return;
    }

    // Esperado formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Formato de token inválido');
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
      return;
    }

    const token = parts[1];

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Token inválido ou expirado');
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
    }
  } catch (error) {
    logger.error('Erro na autenticação', { error });
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação',
    });
  }
}

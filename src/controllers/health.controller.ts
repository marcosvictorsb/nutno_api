import { Request, Response } from 'express';
import logger from '../config/logger';

/**
 * GET /api/health
 * Health check endpoint para verificar se o servidor está rodando
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  logger.info('Health check endpoint chamado');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

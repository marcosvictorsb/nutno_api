import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncLocalStorage, RequestContext } from '../config/async.context';

/**
 * Middleware que gera um UUID único para cada requisição
 * Armazena no AsyncLocalStorage para uso em logs e rastreamento
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = uuidv4();

  const context: RequestContext = {
    requestId,
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  };

  // Armazenar contexto para toda a requisição
  asyncLocalStorage.run(context, () => {
    // Adicionar requestId ao header de resposta (para o cliente rastrear)
    res.setHeader('X-Request-ID', requestId);

    // Registrar tempo de início
    const startTime = Date.now();

    // Hook para capturar tempo de resposta
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const store = asyncLocalStorage.getStore();
      if (store) {
        store.statusCode = res.statusCode;
        store.responseTime = responseTime;
      }
    });

    next();
  });
}

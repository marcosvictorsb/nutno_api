import { asyncLocalStorage, RequestContext } from '../config/async.context';

/**
 * Obtém o contexto da requisição atual
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Obtém apenas o requestId da requisição atual
 */
export function getRequestId(): string {
  return asyncLocalStorage.getStore()?.requestId || 'unknown';
}

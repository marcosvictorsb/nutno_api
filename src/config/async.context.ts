import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId?: string;
  method?: string;
  url?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  userId?: number;
  companyId?: number;
  statusCode?: number;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  referer?: string;
  origin?: string;
  timestamp?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

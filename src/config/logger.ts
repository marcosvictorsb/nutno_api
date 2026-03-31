import { inspect } from 'util';
import winston from 'winston';
import Transport from 'winston-transport';
import { getDiscordAlertService } from '../services/discord.alert.service';
import { asyncLocalStorage } from './async.context';
import { createOpenSearchTransport } from './opensearch.config';

const { combine, timestamp, printf, errors } = winston.format;

const isDevelopment = process.env.NODE_ENV !== 'production';

const ANSI = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
} as const;

function paint(text: string, color: string): string {
  if (!isDevelopment) {
    return text;
  }
  return `${color}${text}${ANSI.reset}`;
}

function colorForLevel(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return ANSI.red;
    case 'warn':
      return ANSI.yellow;
    case 'debug':
      return ANSI.gray;
    case 'info':
    default:
      return ANSI.blue;
  }
}

function formatMeta(meta: Record<string, unknown>): string {
  const entries = Object.entries(meta).filter(
    ([, value]) => value !== undefined
  );

  if (entries.length === 0) {
    return '';
  }

  const lines = entries.map(([key, value]) => {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return `  ${key}: ${String(value)}`;
    }

    const prettyValue = inspect(value, {
      depth: 5,
      colors: isDevelopment,
      compact: false,
      breakLength: 120,
    });

    const indentedValue = prettyValue
      .split('\n')
      .map((line, index) => (index === 0 ? line : `  ${line}`))
      .join('\n');

    return `  ${key}: ${indentedValue}`;
  });

  return `\n${lines.join('\n')}`;
}

/**
 * Enriquece o info com dados do contexto (AsyncLocalStorage)
 * Isso garante que requestId e outros dados estejam disponíveis para os transports
 */
const contextEnricher = winston.format((info) => {
  const context = asyncLocalStorage.getStore();

  // Adiciona dados do contexto ao info se não estiverem presentes
  if (context?.requestId && !info.requestId) {
    info.requestId = context.requestId;
  }
  if (context?.userId && !info.userId) {
    info.userId = context.userId;
  }
  if (context?.method && !info.method) {
    info.method = context.method;
  }
  if (context?.path && !info.path) {
    info.path = context.path;
  }

  return info;
});

const customFormat = printf(
  ({ level, message, timestamp: ts, stack, ...meta }) => {
    const context = asyncLocalStorage.getStore();
    const requestId = context?.requestId;
    const uuid = requestId ? paint(`[${requestId}] `, ANSI.magenta) : '';
    const route =
      context?.method && context?.path
        ? `[${context.method} ${context.path}] `
        : '';
    const levelBase = String(level).toUpperCase().padEnd(5, ' ');
    const levelLabel = paint(levelBase, colorForLevel(String(level)));
    const timestampText = paint(`[${ts}]`, ANSI.gray);
    const routeText = route ? paint(route, ANSI.gray) : '';

    // Evita duplicar o requestId quando ele tambem vier no meta do logger
    const { requestId: _ignoredRequestId, ...restMeta } = meta;

    const metaText = formatMeta(restMeta);
    const stackText = typeof stack === 'string' ? `\n${stack}` : '';

    return `${timestampText} ${uuid}${routeText}${levelLabel}: ${String(message)}${metaText}${stackText}`;
  }
);

/**
 * Custom Transport para enviar erros ao Discord
 */
class DiscordTransport extends Transport {
  log(info: any, callback: Function) {
    setImmediate(() => {
      // Apenas enviar erros para Discord
      if (info.level === 'error') {
        const context = asyncLocalStorage.getStore();
        const timestamp = info.timestamp || new Date().toISOString();

        // Extrair informações do meta
        const { requestId, error, ...meta } = info;

        const discordService = getDiscordAlertService();
        discordService.enviarAlertaErro({
          message: info.message,
          error: info.stack || error || info.message,
          requestId: context?.requestId,
          userId: context?.userId,
          timestamp,
          method: context?.method,
          path: context?.path,
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        });
      }

      if (callback) {
        callback();
      }
    });
  }
}

const discordTransport = new DiscordTransport();

const openSearchTransport = createOpenSearchTransport();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: combine(
    errors({ stack: true }),
    contextEnricher(), // Enriquece com dados do contexto ANTES de formatar
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    discordTransport,
    ...(openSearchTransport ? [openSearchTransport] : []),
  ],
});

export default logger;

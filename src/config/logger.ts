import winston from 'winston';
import { inspect } from 'util';
import { asyncLocalStorage } from './async.context';

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

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    customFormat
  ),
  transports: [new winston.transports.Console()],
});

export default logger;

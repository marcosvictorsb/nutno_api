import pino from 'pino';
import { asyncLocalStorage } from './async.context';

const isDevelopment = process.env.NODE_ENV !== 'production';

const pinoConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  mixin: () => {
    const context = asyncLocalStorage.getStore();
    return {
      requestId: context?.requestId,
    };
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname,requestId',
          singleLine: true,
        },
      }
    : undefined,
};

const logger = pino(pinoConfig);

export default logger;

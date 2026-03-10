import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

const pinoConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
};

const logger = pino(pinoConfig);

export default logger;

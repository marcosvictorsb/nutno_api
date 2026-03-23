import { CorsOptions } from 'cors';

const getCorsOptions = (): CorsOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001'
  ).split(',');

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como móvel, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      const originTrimmed = origin.trim();

      // Em desenvolvimento, aceitar qualquer origem
      if (nodeEnv === 'development') {
        return callback(null, true);
      }

      // Em produção, verificar lista de origens permitidas
      if (allowedOrigins.includes(originTrimmed)) {
        return callback(null, true);
      }

      callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-request-id',
    ],
    exposedHeaders: ['x-request-id'],
    maxAge: 86400, // 24 horas
  };

  return corsOptions;
};

export default getCorsOptions;

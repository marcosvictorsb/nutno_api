import dotenv from 'dotenv';
import app from './app';
import logger from './config/logger';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Database connection established successfully');

    // Iniciar o servidor
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error: Error | any) {
    logger.error('Failed to start server', { err: error });
    process.exit(1);
  }
};

startServer();

import dotenv from 'dotenv';
import app from './app';
// import sequelize from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ force: true }); // For development, use force to reset the database
      // Sincronizar modelos com o banco de dados
    } else {
      console.log(
        'Running in production mode. Database synchronization is disabled to prevent data loss.'
      );
    }

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

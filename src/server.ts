import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Sincronizar modelos com o banco de dados
    await sequelize.sync({ alter: true });
    console.log('Database connected and models synchronized');

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

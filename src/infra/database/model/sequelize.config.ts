import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../../../config/logger';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: isProduction
    ? false
    : (sql) => {
        logger.debug('Sequelize Query: ', { sql });
      },
});

export default sequelize;

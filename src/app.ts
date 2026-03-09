import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import leadRoutes from './routes/lead.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', leadRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;

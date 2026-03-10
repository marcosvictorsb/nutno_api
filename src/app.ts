import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import leadRoutes from './Dominios/Leads/routes/lead.routes';
import nutricionistaRouta from './Dominios/Nutricionista/routes/v1/routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', leadRoutes);

app.use('/login', nutricionistaRouta);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;

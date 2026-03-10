import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import leadRoutes from './Dominios/Leads/routes/lead.routes';
// import nutricionistaRouta from './Dominios/Nutricionista/routes/v1/routes';
import autentificacaoRoutes from './Dominios/Autentificação/routes/autentificacao.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);

// Rotas
app.use('/', leadRoutes);

// app.use('/login', nutricionistaRouta);

app.use('/auth', autentificacaoRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;

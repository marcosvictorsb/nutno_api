import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import leadRoutes from './Dominios/Leads/routes/lead.routes';
// import nutricionistaRouta from './Dominios/Nutricionista/routes/v1/routes';
import autentificacaoRoutes from './Dominios/Autentificação/routes/autentificacao.routes';
import pacienteRoutes from './Dominios/Pacientes/routes/paciente.routes';
import formularioPublicoRoutes from './Dominios/Anamnese/routes/formulario.publico.routes';
import anamneseRoutes from './Dominios/Anamnese/routes/anamnese.routes';
import medidasRoutes from './Dominios/Medidas/routes/medidas.routes';
import alimentosRoutes from './Dominios/Alimentos/routes/alimentos.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);

// Rotas
// Rotas públicas PRIMEIRO (sem middleware de autenticação)
app.use('/', leadRoutes);
app.use('/', formularioPublicoRoutes);

// app.use('/login', nutricionistaRouta);

// Rotas autenticadas DEPOIS
app.use('/auth', autentificacaoRoutes);
app.use('/', pacienteRoutes);
app.use('/', anamneseRoutes);
app.use('/', medidasRoutes);
app.use('/alimentos', alimentosRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;

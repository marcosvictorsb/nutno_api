import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import leadRoutes from './Dominios/Leads/routes/lead.routes';
import nutricionistaRoutes from './Dominios/Nutricionista/routes/nutricionista.routes';
import autentificacaoRoutes from './Dominios/Autentificação/routes/autentificacao.routes';
import pacienteRoutes from './Dominios/Pacientes/routes/paciente.routes';
import formularioPublicoRoutes from './Dominios/Anamnese/routes/formulario.publico.routes';
import anamneseRoutes from './Dominios/Anamnese/routes/anamnese.routes';
import medidasRoutes from './Dominios/Medidas/routes/medidas.routes';
import alimentosRoutes from './Dominios/Alimentos/routes/alimentos.routes';
import planosRoutes from './Dominios/PlanoAlimentar/routes/plano.alimentar.routes';

// Importar modelos para inicializar associações
import './Dominios/Alimentos/models';
import './Dominios/Nutricionista/models';
import './Dominios/PlanoAlimentar/models';

const app = express();

// Servir arquivos estáticos de uploads PRIMEIRO (antes de QUALQUER COISA, até middlewares globais)
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);

// Rotas
// Rotas públicas PRIMEIRO (sem middleware de autenticação)
app.use('/', leadRoutes);
app.use('/', formularioPublicoRoutes);
app.use('/', planosRoutes); // Inclui rotas públicas (/planos/visualizar/:token)
app.use('/auth', autentificacaoRoutes);

// Rotas autenticadas DEPOIS
app.use('/', pacienteRoutes);
app.use('/', anamneseRoutes);
app.use('/', medidasRoutes);
app.use('/alimentos', alimentosRoutes);
app.use('/nutricionistas', nutricionistaRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;

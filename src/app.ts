import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import getCorsOptions from './config/cors';
import alimentosRoutes from './Dominios/Alimentos/routes/alimentos.routes';
import anamneseRoutes from './Dominios/Anamnese/routes/anamnese.routes';
import formularioPublicoRoutes from './Dominios/Anamnese/routes/formulario.publico.routes';
import autentificacaoRoutes from './Dominios/Autentificação/routes/autentificacao.routes';
import leadRoutes from './Dominios/Leads/routes/lead.routes';
import medidasRoutes from './Dominios/Medidas/routes/medidas.routes';
import nutricionistaRoutes from './Dominios/Nutricionista/routes/nutricionista.routes';
import pacienteRoutes from './Dominios/Pacientes/routes/paciente.routes';
import planosRoutes from './Dominios/PlanoAlimentar/routes/plano.alimentar.routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';

// Importar modelos para inicializar associações
import './Dominios/Alimentos/models';
import './Dominios/Nutricionista/models';
import './Dominios/PlanoAlimentar/models';

dotenv.config({ quiet: true }); // ← Carrega .env DEPOIS

const app = express();

// Servir arquivos estáticos de uploads PRIMEIRO (antes de QUALQUER COISA, até middlewares globais)
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Middlewares
app.use(cors(getCorsOptions()));
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

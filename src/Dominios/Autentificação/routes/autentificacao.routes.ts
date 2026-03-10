import { Router } from 'express';
import { criarContaGratis } from '../controllers/criar.conta.gratis';

const autentificacaoRoutes = Router();

autentificacaoRoutes.post('/criar-conta-gratis', criarContaGratis);

export default autentificacaoRoutes;

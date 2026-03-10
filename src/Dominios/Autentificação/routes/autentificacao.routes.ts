import { Router } from 'express';
import { criarContaGratis } from '../controllers/criar.conta.gratis.controller';
import { fazerLogin } from '../controllers/login.controller';

const autentificacaoRoutes = Router();

autentificacaoRoutes.post('/criar-conta-gratis', criarContaGratis);
autentificacaoRoutes.post('/login', fazerLogin);

export default autentificacaoRoutes;

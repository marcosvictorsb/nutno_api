import { Router } from 'express';
import { criarContaGratis } from '../controllers/criar.conta.gratis.controller';
import { fazerLogin } from '../controllers/login.controller';
import { recuperarSenha } from '../controllers/recuperar.senha.controller';
import { verificarTokenResetSenha } from '../controllers/check-token.controller';

const autentificacaoRoutes = Router();

autentificacaoRoutes.post('/criar-conta-gratis', criarContaGratis);
autentificacaoRoutes.post('/login', fazerLogin);
autentificacaoRoutes.post('/recuperar-senha', recuperarSenha);
autentificacaoRoutes.get('/check-token', verificarTokenResetSenha);

export default autentificacaoRoutes;

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { listarAdesaoPaciente } from '../controllers/listar.adesao.controller';
import { listarAdesaoPacientePublico } from '../controllers/listar.adesao.paciente.publico.controller';
import { registrarAdesao } from '../controllers/registrar.adesao.controller';
import { resumoAdesaoPaciente } from '../controllers/resumo.adesao.controller';

const adesaoPublicRoutes = Router();
const adesaoAuthRoutes = Router();

// Rotas Públicas
adesaoPublicRoutes.post('/adesao/:token', registrarAdesao);
adesaoPublicRoutes.get('/adesao/:token', listarAdesaoPacientePublico);

// Rotas Autenticadas
adesaoAuthRoutes.get(
  '/pacientes/:id/adesao',
  authMiddleware,
  listarAdesaoPaciente
);
adesaoAuthRoutes.get(
  '/pacientes/:id/adesao/resumo',
  authMiddleware,
  resumoAdesaoPaciente
);

export { adesaoAuthRoutes, adesaoPublicRoutes };

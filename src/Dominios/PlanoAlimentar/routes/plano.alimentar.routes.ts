import { Router } from 'express';

import { authMiddleware } from '../../../middlewares/auth';
import {
  arquivarPlanoAlimentar,
  ativarPlanoAlimentar,
  atualizarPlanoAlimentar,
  buscarPlanoAlimentar,
  criarPlanoAlimentar,
  enviarPlanoAlimentar,
  listarPlanosAlimentares,
  visualizarPlanoAlimentar,
} from '../controllers';

const router = Router();

// Rotas autenticadas (nutricionista)
router.post(
  '/pacientes/:id_paciente/planos-alimentar',
  authMiddleware,
  criarPlanoAlimentar
);
router.get(
  '/pacientes/:id_paciente/planos-alimentar',
  authMiddleware,
  listarPlanosAlimentares
);
router.get(
  '/pacientes/:id_paciente/planos-alimentar/:planoId',
  authMiddleware,
  buscarPlanoAlimentar
);
router.put(
  '/pacientes/:id_paciente/planos-alimentar/:planoId',
  authMiddleware,
  atualizarPlanoAlimentar
);
router.patch(
  '/pacientes/:id_paciente/planos-alimentar/:planoId/ativar',
  authMiddleware,
  ativarPlanoAlimentar
);
router.patch(
  '/pacientes/:id_paciente/planos-alimentar/:planoId/arquivar',
  authMiddleware,
  arquivarPlanoAlimentar
);
router.post(
  '/pacientes/:id_paciente/planos-alimentar/:planoId/enviar',
  authMiddleware,
  enviarPlanoAlimentar
);

// Rota pública (paciente visualiza com token)
router.get('/planos/visualizar/:token', visualizarPlanoAlimentar);

export default router;

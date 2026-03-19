import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { buscarAnamnese } from '../controllers/buscar.anamnese.controller';
import { atualizarAnamnese } from '../controllers/atualizar.anamnese.controller';

const anamneseRoutes = Router();

anamneseRoutes.get('/pacientes/:id/anamnese', authMiddleware, buscarAnamnese);
anamneseRoutes.put(
  '/pacientes/:id/anamnese',
  authMiddleware,
  atualizarAnamnese
);

export default anamneseRoutes;

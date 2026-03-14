import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { buscarAnamnese } from '../controllers/buscar.anamnese.controller';
import { atualizarAnamnese } from '../controllers/atualizar.anamnese.controller';

const anamneseRoutes = Router();

anamneseRoutes.use(authMiddleware);
anamneseRoutes.get('/pacientes/:id/anamnese', buscarAnamnese);
anamneseRoutes.put('/pacientes/:id/anamnese', atualizarAnamnese);

export default anamneseRoutes;

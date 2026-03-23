import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { atualizarMedida } from '../controllers/atualizar.medida.controller';
import { buscarMedida } from '../controllers/buscar.medida.controller';
import { deletarMedida } from '../controllers/deletar.medida.controller';
import { evoluçãoMedidas } from '../controllers/evolucao.medidas.controller';
import { listarMedidas } from '../controllers/listar.medidas.controller';
import { registrarMedidas } from '../controllers/registrar.medidas.controller';

const medidasRoutes = Router();

// POST   /pacientes/:id/medidas
medidasRoutes.post('/pacientes/:id/medidas', authMiddleware, registrarMedidas);

// GET    /pacientes/:id/medidas
medidasRoutes.get('/pacientes/:id/medidas', authMiddleware, listarMedidas);

// GET    /pacientes/:id/medidas/evolucao
medidasRoutes.get(
  '/pacientes/:id/medidas/evolucao',
  authMiddleware,
  evoluçãoMedidas
);

// GET    /pacientes/:id/medidas/:medidaId
medidasRoutes.get(
  '/pacientes/:id/medidas/:medidaId',
  authMiddleware,
  buscarMedida
);

// PUT    /pacientes/:id/medidas/:medidaId
medidasRoutes.put(
  '/pacientes/:id/medidas/:medidaId',
  authMiddleware,
  atualizarMedida
);

// DELETE /pacientes/:id/medidas/:medidaId
medidasRoutes.delete(
  '/pacientes/:id/medidas/:medidaId',
  authMiddleware,
  deletarMedida
);

export default medidasRoutes;

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { registrarMedidas } from '../controllers/registrar.medidas.controller';
import { listarMedidas } from '../controllers/listar.medidas.controller';
import { buscarMedida } from '../controllers/buscar.medida.controller';
import { deletarMedida } from '../controllers/deletar.medida.controller';
import { evoluçãoMedidas } from '../controllers/evolucao.medidas.controller';

const medidasRoutes = Router();

medidasRoutes.use(authMiddleware);

// POST   /pacientes/:id/medidas
medidasRoutes.post('/pacientes/:id/medidas', registrarMedidas);

// GET    /pacientes/:id/medidas
medidasRoutes.get('/pacientes/:id/medidas', listarMedidas);

// GET    /pacientes/:id/medidas/evolucao
medidasRoutes.get('/pacientes/:id/medidas/evolucao', evoluçãoMedidas);

// GET    /pacientes/:id/medidas/:medidaId
medidasRoutes.get('/pacientes/:id/medidas/:medidaId', buscarMedida);

// DELETE /pacientes/:id/medidas/:medidaId
medidasRoutes.delete('/pacientes/:id/medidas/:medidaId', deletarMedida);

export default medidasRoutes;

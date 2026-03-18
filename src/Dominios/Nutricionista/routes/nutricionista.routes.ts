import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import {
  criarNutricionista,
  buscarNutricionistas,
  obterNutricionistaById,
  atualizarNutricionista,
  atualizarDadosPessoais,
  atualizarSeguranca,
} from '../controllers';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /nutricionistas - Buscar nutricionistas com filtros
router.get('/', buscarNutricionistas);

// PUT /nutricionistas/dados-pessoais - Atualizar dados pessoais do nutricionista autenticado
router.put('/dados-pessoais', atualizarDadosPessoais);

// PUT /nutricionistas/seguranca - Atualizar segurança (senha) do nutricionista autenticado
router.put('/seguranca', atualizarSeguranca);

// GET /nutricionistas/:id - Obter nutricionista por ID
router.get('/:id', obterNutricionistaById);

// POST /nutricionistas - Criar novo nutricionista
router.post('/', criarNutricionista);

// PUT /nutricionistas/:id - Atualizar nutricionista
router.put('/:id', atualizarNutricionista);

export default router;

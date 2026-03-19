import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { uploadFoto, handleUploadError } from '../../../middlewares/upload';
import {
  criarNutricionista,
  buscarNutricionistas,
  obterNutricionistaById,
  atualizarNutricionista,
  atualizarDadosPessoais,
  atualizarSeguranca,
  atualizarFotoNutricionista,
} from '../controllers';

const router = Router();

// GET /nutricionistas - Buscar nutricionistas com filtros
router.get('/', authMiddleware, buscarNutricionistas);

// PUT /nutricionistas/dados-pessoais - Atualizar dados pessoais do nutricionista autenticado
router.put('/dados-pessoais', authMiddleware, atualizarDadosPessoais);

// PUT /nutricionistas/seguranca - Atualizar segurança (senha) do nutricionista autenticado
router.put('/seguranca', authMiddleware, atualizarSeguranca);

// PUT /nutricionistas/nutricionista-foto - Atualizar foto do nutricionista autenticado
router.put(
  '/foto',
  authMiddleware,
  uploadFoto.single('foto'),
  handleUploadError,
  atualizarFotoNutricionista
);

// GET /nutricionistas/:id - Obter nutricionista por ID
router.get('/:id', authMiddleware, obterNutricionistaById);

// POST /nutricionistas - Criar novo nutricionista
router.post('/', authMiddleware, criarNutricionista);

// PUT /nutricionistas/:id - Atualizar nutricionista
router.put('/:id', authMiddleware, atualizarNutricionista);

export default router;

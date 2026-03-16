import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { buscarAlimentos } from '../controllers/buscar.alimentos.controller';
import { criarAlimento } from '../controllers/criar.alimento.controller';
import { atualizarAlimento } from '../controllers/atualizar.alimento.controller';
import { deletarAlimento } from '../controllers/deletar.alimento.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /alimentos - Buscar alimentos com filtros
router.get('/', buscarAlimentos);

// POST /alimentos - Criar novo alimento personalizado
router.post('/', criarAlimento);

// PUT /alimentos/:id - Atualizar alimento personalizado
router.put('/:id', atualizarAlimento);

// DELETE /alimentos/:id - Deletar alimento personalizado
router.delete('/:id', deletarAlimento);

export default router;

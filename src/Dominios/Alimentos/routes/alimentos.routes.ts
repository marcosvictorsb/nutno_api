import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { buscarAlimentos } from '../controllers/buscar.alimentos.controller';
import { criarAlimento } from '../controllers/criar.alimento.controller';
import { atualizarAlimento } from '../controllers/atualizar.alimento.controller';
import { deletarAlimento } from '../controllers/deletar.alimento.controller';

const router = Router();

// GET /alimentos - Buscar alimentos com filtros
router.get('/', authMiddleware, buscarAlimentos);

// POST /alimentos - Criar novo alimento personalizado
router.post('/', authMiddleware, criarAlimento);

// PUT /alimentos/:id - Atualizar alimento personalizado
router.put('/:id', authMiddleware, atualizarAlimento);

// DELETE /alimentos/:id - Deletar alimento personalizado
router.delete('/:id', authMiddleware, deletarAlimento);

export default router;

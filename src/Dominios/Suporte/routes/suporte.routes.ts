import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { criarTicket, listarTickets, obterTicket } from '../controllers';

const router = Router();

// POST /api/suporte/tickets - Criar novo ticket de suporte
router.post('/', authMiddleware, criarTicket);

// GET /api/suporte/tickets - Listar todos os tickets do usuário
router.get('/', authMiddleware, listarTickets);

// GET /api/suporte/tickets/:id - Obter detalhes de um ticket específico
router.get('/:id', authMiddleware, obterTicket);

export default router;

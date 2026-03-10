import { Router } from 'express';
import { criarContaGratis } from '../../controllers/criar.conta.gratis';
const router = Router();

router.post('/criar-conta-gratis', criarContaGratis);

export default router;

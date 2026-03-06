import { Router } from 'express';
import { createLead } from '../controllers/leadsController';
import { validateLeadInput } from '../middlewares/validation';

const router = Router();

router.post('/leads', validateLeadInput, createLead);

export default router;

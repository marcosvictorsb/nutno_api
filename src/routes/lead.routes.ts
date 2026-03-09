import { Router } from 'express';
import { createLead } from '../controllers/leads.controller';
import { validateLeadInput } from '../middlewares/validation';

const router = Router();

router.post('/leads', validateLeadInput, createLead);

export default router;

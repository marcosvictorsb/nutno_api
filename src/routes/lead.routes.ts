import { Router } from 'express';
import { createLead } from '../controllers/leads.controller';
import { validateLeadInput } from '../middlewares/validation';
import { getLeads } from '../controllers/get.leads.controller';

const router = Router();

router.post('/leads', validateLeadInput, createLead);
router.get('/leads', getLeads);

export default router;

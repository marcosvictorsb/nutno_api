import { Router } from 'express';
import { createLead } from '../controllers/leads.controller';
import { validateLeadInput } from '../middlewares/validation';
import { getLeads } from '../controllers/get.leads.controller';
import { countLeads } from '../controllers/count.lead.controller';

const router = Router();

router.post('/leads', validateLeadInput, createLead);
router.get('/leads', getLeads);
router.get('/leads/count', countLeads);

export default router;

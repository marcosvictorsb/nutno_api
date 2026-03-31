import { Router } from 'express';
import { processarWebhookKirvano } from '../controllers/processar-webhook.controller';

export const router = Router();

/**
 * Rota para receber webhooks de pagamento da Kirvano
 * POST /api/webhooks/kirvano/pagamento
 *
 * Headers:
 *   Authorization: Bearer {KIRVANO_WEBHOOK_TOKEN}
 *
 * Body: KirvanoWebhookPayload
 */
router.post('/kirvano/pagamento', processarWebhookKirvano);

export default router;

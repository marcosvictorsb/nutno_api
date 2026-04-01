import { Request, Response } from 'express';
import logger from '../../../config/logger';
import {
  KirvanoWebhookPayload,
  WebhookProcessingResult,
} from '../../../types/Kirvano';
import Webhook from '../models/webhook.model';
import ChargebackService from '../services/chargeback.service';
import PixExpiradoService from '../services/pix-expirado.service';
import PixGeradoService from '../services/pix-gerado.service';
import SaleApprovedProcessorService from '../services/sale-approved.service';
import VendaRecusadaService from '../services/venda-recusada.service';
import WebhookValidatorService from '../services/webhook-validator.service';
import WebhookParserService from '../utils/webhook-parser';

/**
 * Controller para processar webhooks da Kirvano
 */

/**
 * POST /api/webhooks/kirvano/pagamento
 * Processa webhook de pagamento da Kirvano
 */
export async function processarWebhookKirvano(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // 1. Validar token
    // const authHeader = req.headers.authorization;
    // if (!WebhookValidatorService.validateToken(authHeader)) {
    //   logger.warn('Tentativa de webhook com token inválido', {
    //     ip: req.ip,
    //     authHeader: authHeader?.substring(0, 20),
    //   });
    //   res.status(401).json({
    //     success: false,
    //     message: 'Token de autenticação inválido',
    //   });
    //   return;
    // }

    // 2. Validar payload
    const payloadValidation = WebhookValidatorService.validatePayload(req.body);
    if (!payloadValidation.valid) {
      logger.warn('Webhook com payload inválido', {
        error: payloadValidation.error,
      });
      res.status(400).json({
        success: false,
        message: 'Payload do webhook inválido',
        error: payloadValidation.error,
      });
      return;
    }

    const payload = req.body as KirvanoWebhookPayload;

    // 3. Normalizar dados
    const normalizedData = WebhookParserService.parseWebhookPayload(payload);

    // 4. Registrar webhook no BD com proteção contra duplicatas (idempotência)
    const [webhook, created] = await Webhook.findOrCreate({
      where: { id_venda: normalizedData.id_venda },
      defaults: {
        evento: normalizedData.evento,
        descricao_evento: normalizedData.descricao_evento,
        id_checkout: normalizedData.id_checkout,
        url_checkout: normalizedData.url_checkout,
        meio_pagamento: normalizedData.meio_pagamento,
        preco_total: normalizedData.preco_total,
        tipo: normalizedData.tipo,
        status: normalizedData.status,
        nome_cliente: normalizedData.nome_cliente,
        documento_cliente: normalizedData.documento_cliente,
        email_cliente: normalizedData.email_cliente,
        telefone_cliente: normalizedData.telefone_cliente,
        payload: normalizedData.payload,
        processado: false,
      },
    });

    // 5. Verificar idempotência (webhook duplicado - já foi recebido)
    if (!created) {
      logger.info('Webhook duplicado - retransmissão da Kirvano', {
        webhookId: webhook.id,
        id_venda: normalizedData.id_venda,
        evento: normalizedData.evento,
        status: normalizedData.status,
        processado: webhook.processado,
      });
      res.json({
        success: true,
        message: 'Webhook já foi recebido e processado',
        webhookId: webhook.id,
        isDuplicate: true,
      });
      return;
    }

    logger.info('Webhook registrado', {
      webhookId: webhook.id,
      id_venda: normalizedData.id_venda,
      evento: normalizedData.evento,
      status: normalizedData.status,
    });

    // 6. Processar de acordo com evento
    let resultado: WebhookProcessingResult;

    switch (normalizedData.evento) {
      case 'PIX_GENERATED':
        resultado = await handlePixGerado(webhook, normalizedData);
        break;

      case 'PIX_EXPIRED':
        resultado = await handlePixExpirado(webhook, normalizedData);
        break;

      case 'SALE_APPROVED':
        resultado = await handleSaleApproved(normalizedData);
        break;

      case 'SALE_REFUSED':
        resultado = await handleSaleRecusada(webhook, normalizedData);
        break;

      case 'SALE_CHARGEBACK':
        resultado = await handleChargeback(webhook, normalizedData);
        break;

      default:
        resultado = {
          success: false,
          webhookId: webhook.id,
          message: 'Evento não suportado para processamento automático',
        };
    }

    // 7. Atualizar webhook com resultado
    await webhook.update({
      processado: resultado.success,
      id_nutricionista: resultado.nutricionistaId,
      id_inscricao: resultado.adesaoId,
      mensagem_erro: resultado.error,
    });

    logger.info('Webhook processado', {
      webhookId: webhook.id,
      id_venda: normalizedData.id_venda,
      sucesso: resultado.success,
      id_nutricionista: resultado.nutricionistaId,
      id_inscricao: resultado.adesaoId,
    });

    res.json({
      success: resultado.success,
      webhookId: webhook.id,
      message: resultado.message,
      nutricionistaId: resultado.nutricionistaId,
      adesaoId: resultado.adesaoId,
    });
  } catch (error: any) {
    logger.error('Erro ao processar webhook Kirvano', {
      erro: error,
    });

    res.status(400).json({
      success: false,
      message: 'Erro ao processar webhook',
      error: error.message,
    });
  }
}

// ============ HANDLERS DE EVENTOS ============

/**
 * Handle: PIX Gerado - Aguardando pagamento
 */
async function handlePixGerado(
  webhook: any,
  normalizedData: any
): Promise<WebhookProcessingResult> {
  logger.info('Processando evento: PIX_GENERATED', {
    id_venda: normalizedData.id_venda,
    email: normalizedData.email_cliente,
  });

  // Delegar para o serviço de processamento
  const resultado = await PixGeradoService.processar(normalizedData);

  return {
    ...resultado,
    webhookId: webhook.id,
  };
}

/**
 * Handle: PIX Expirado - Pagamento não realizado
 */
async function handlePixExpirado(
  webhook: any,
  normalizedData: any
): Promise<WebhookProcessingResult> {
  logger.info('Processando evento: PIX_EXPIRED', {
    id_venda: normalizedData.id_venda,
    email: normalizedData.email_cliente,
  });

  // Delegar para o serviço de processamento
  const resultado = await PixExpiradoService.processar(normalizedData);

  return {
    ...resultado,
    webhookId: webhook.id,
  };
}

/**
 * Handle: Venda Aprovada - PIX One-Time ou Recorrente
 * Este é o principal handler para criar nutricionista e adesão
 */
async function handleSaleApproved(
  normalizedData: any
): Promise<WebhookProcessingResult> {
  logger.info('Processando evento: SALE_APPROVED', {
    id_venda: normalizedData.id_venda,
    email: normalizedData.email_cliente,
    tipo: normalizedData.tipo,
  });

  // Delegar para o serviço de processamento
  const resultado =
    await SaleApprovedProcessorService.processar(normalizedData);

  return resultado;
}

/**
 * Handle: Venda Recusada
 */
async function handleSaleRecusada(
  webhook: any,
  normalizedData: any
): Promise<WebhookProcessingResult> {
  logger.info('Processando evento: SALE_REFUSED', {
    id_venda: normalizedData.id_venda,
    email: normalizedData.email_cliente,
  });

  // Delegar para o serviço de processamento
  const resultado = await VendaRecusadaService.processar(normalizedData);

  return {
    ...resultado,
    webhookId: webhook.id,
  };
}

/**
 * Handle: Chargeback
 */
async function handleChargeback(
  webhook: any,
  normalizedData: any
): Promise<WebhookProcessingResult> {
  logger.info('Processando evento: SALE_CHARGEBACK', {
    id_venda: normalizedData.id_venda,
    email: normalizedData.email_cliente,
  });

  // Delegar para o serviço de processamento
  const resultado = await ChargebackService.processar(normalizedData);

  return {
    ...resultado,
    webhookId: webhook.id,
  };
}

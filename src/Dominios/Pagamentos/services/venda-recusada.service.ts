import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import { WebhookProcessingResult } from '../../../types/Kirvano';
import { NormalizedWebhookData } from '../utils/webhook-parser';

/**
 * Serviço para processar venda recusada (SALE_REFUSED)
 */
class VendaRecusadaService {
  /**
   * Processa uma venda recusada
   */
  async processar(
    webhookData: NormalizedWebhookData
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info('Iniciando processamento de SALE_REFUSED', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      // Validar dados
      if (!webhookData.email_cliente || !webhookData.nome_cliente) {
        throw new Error('Email e nome do cliente são obrigatórios');
      }

      // Enviar email de notificação
      await this.enviarEmailVendaRecusada(webhookData);

      logger.info('SALE_REFUSED processado com sucesso', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      return {
        success: true,
        message: 'Venda recusada - Email de notificação enviado',
      };
    } catch (error: any) {
      logger.error('Erro ao processar SALE_REFUSED', {
        email: webhookData.email_cliente,
        erro: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'Erro ao processar venda recusada',
        error: error.message,
      };
    }
  }

  /**
   * Envia email notificando venda recusada
   */
  private async enviarEmailVendaRecusada(
    webhookData: NormalizedWebhookData
  ): Promise<void> {
    try {
      const appUrl = process.env.APP_URL || 'https://app.nutno.com.br';
      const urlCheckout =
        webhookData.url_checkout ||
        `${appUrl}/checkout/${webhookData.id_venda}`;

      // Mapa de motivos de recusa (pode vir do webhook)
      const motivosRecusa: { [key: string]: string } = {
        INSUFFICIENT_FUNDS: 'Saldo insuficiente',
        EXPIRED_CARD: 'Cartão expirado',
        INVALID_CARD: 'Dados do cartão inválidos',
        LIMIT_EXCEEDED: 'Limite de transação atingido',
        UNAUTHORIZED: 'Transação não autorizada',
        GENERIC_DECLINE: 'Transação recusada pela instituição financeira',
      };

      const motivo =
        motivosRecusa[(webhookData as any).motivo_recusa] ||
        'Transação não autorizada';

      await sendEmail(
        webhookData.email_cliente,
        '❌ Seu Pagamento Foi Recusado - Tente Novamente',
        'venda-recusada',
        {
          nome: webhookData.nome_cliente,
          motivo,
          urlCheckout,
          appUrl,
        }
      );

      logger.info('Email de venda recusada enviado', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
        motivo,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar email de venda recusada', {
        email: webhookData.email_cliente,
        erro: error.message,
      });
      // Não interrompe o fluxo se email falhar
    }
  }
}

export default new VendaRecusadaService();

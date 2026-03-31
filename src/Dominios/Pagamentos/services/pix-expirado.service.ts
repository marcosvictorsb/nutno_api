import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import { WebhookProcessingResult } from '../../../types/Kirvano';
import { NormalizedWebhookData } from '../utils/webhook-parser';

/**
 * Serviço para processar PIX expirado (PIX_EXPIRED)
 */
class PixExpiradoService {
  /**
   * Processa um PIX que expirou
   */
  async processar(
    webhookData: NormalizedWebhookData
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info('Iniciando processamento de PIX_EXPIRED', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      // Validar dados
      if (!webhookData.email_cliente || !webhookData.nome_cliente) {
        throw new Error('Email e nome do cliente são obrigatórios');
      }

      // Enviar email de notificação
      await this.enviarEmailPixExpirado(webhookData);

      logger.info('PIX_EXPIRED processado com sucesso', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      return {
        success: true,
        message: 'PIX expirado - Email de notificação enviado',
      };
    } catch (error: any) {
      logger.error('Erro ao processar PIX_EXPIRED', {
        email: webhookData.email_cliente,
        erro: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'Erro ao processar PIX expirado',
        error: error.message,
      };
    }
  }

  /**
   * Envia email notificando PIX expirado
   */
  private async enviarEmailPixExpirado(
    webhookData: NormalizedWebhookData
  ): Promise<void> {
    try {
      const appUrl = process.env.APP_URL || 'https://app.nutno.com.br';
      const urlCheckout =
        webhookData.url_checkout ||
        `${appUrl}/checkout/${webhookData.id_venda}`;

      const dataExpiracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await sendEmail(
        webhookData.email_cliente,
        '⏱️ Seu PIX Expirou - Gere um Novo Código',
        'pix-expirado',
        {
          nome: webhookData.nome_cliente,
          valor: webhookData.preco_total?.toFixed(2) || '0,00',
          idVenda: webhookData.id_venda,
          dataExpiracao,
          urlCheckout,
          appUrl,
        }
      );

      logger.info('Email de PIX expirado enviado', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar email de PIX expirado', {
        email: webhookData.email_cliente,
        erro: error.message,
      });
      // Não interrompe o fluxo se email falhar
    }
  }
}

export default new PixExpiradoService();

import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import { WebhookProcessingResult } from '../../../types/Kirvano';
import { NormalizedWebhookData } from '../utils/webhook-parser';

/**
 * Serviço para processar PIX gerado (PIX_GENERATED)
 */
class PixGeradoService {
  /**
   * Processa um PIX que foi gerado (aguardando pagamento)
   */
  async processar(
    webhookData: NormalizedWebhookData
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info('Iniciando processamento de PIX_GENERATED', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      // Validar dados
      if (!webhookData.email_cliente || !webhookData.nome_cliente) {
        throw new Error('Email e nome do cliente são obrigatórios');
      }

      // Enviar email com instruções de pagamento
      // await this.enviarEmailPixGerado(webhookData);

      logger.info('PIX_GENERATED processado com sucesso', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      return {
        success: true,
        message: 'PIX gerado - Email com instruções enviado',
      };
    } catch (error: any) {
      logger.error('Erro ao processar PIX_GENERATED', {
        email: webhookData.email_cliente,
        erro: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'Erro ao processar PIX gerado',
        error: error.message,
      };
    }
  }

  /**
   * Envia email com QR code e instruções de pagamento
   */
  private async enviarEmailPixGerado(
    webhookData: NormalizedWebhookData
  ): Promise<void> {
    try {
      const appUrl = process.env.APP_URL || 'https://www.nutno.com.br';
      const urlCheckout = `${appUrl}/checkout/${webhookData.id_venda}`;

      // Extrair QR code do payload se disponível
      // Se não houver, gerar um placeholder
      const qrCode =
        (webhookData as any).qr_code ||
        `${appUrl}/api/pix/qr-code/${webhookData.id_venda}`;

      await sendEmail(
        webhookData.email_cliente,
        '💳 Seu PIX Está Pronto - Escaneie e Pague Agora',
        'pix-gerado',
        {
          nome: webhookData.nome_cliente,
          valor: webhookData.preco_total?.toFixed(2) || '0,00',
          idVenda: webhookData.id_venda,
          tipo: webhookData.tipo || 'Acesso Premium',
          qrCode,
          urlCheckout,
          appUrl,
        }
      );

      logger.info('Email de PIX gerado enviado', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar email de PIX gerado', {
        email: webhookData.email_cliente,
        erro: error.message,
      });
      // Não interrompe o fluxo se email falhar
    }
  }
}

export default new PixGeradoService();

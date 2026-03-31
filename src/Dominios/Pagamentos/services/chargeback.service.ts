import logger from '../../../config/logger';
import { getDiscordAlertService } from '../../../services/discord.alert.service';
import { sendEmail } from '../../../services/email.service';
import { WebhookProcessingResult } from '../../../types/Kirvano';
import Inscricao from '../../Inscricoes/model/inscricao.model';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import { NormalizedWebhookData } from '../utils/webhook-parser';

/**
 * Serviço para processar chargeback (SALE_CHARGEBACK)
 */
class ChargebackService {
  /**
   * Processa um chargeback de venda
   */
  async processar(
    webhookData: NormalizedWebhookData
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info('Iniciando processamento de SALE_CHARGEBACK', {
        email: webhookData.email_cliente,
        id_venda: webhookData.id_venda,
      });

      // Validar dados
      if (!webhookData.email_cliente || !webhookData.nome_cliente) {
        throw new Error('Email e nome do cliente são obrigatórios');
      }

      // 1. Buscar nutricionista
      const nutricionista = await Nutricionista.findOne({
        where: { email: webhookData.email_cliente },
      });

      if (nutricionista) {
        // 2. Desativar inscrição se existir
        await this.desativarInscricao(nutricionista.id);

        // 3. Desativar nutricionista
        await nutricionista.update({ ativo: false });
        logger.info('Nutricionista desativado por chargeback', {
          id: nutricionista.id,
        });

        // 4. Enviar email
        await this.enviarEmailChargeback(webhookData, nutricionista);

        // 5. Alertar Discord
        await this.alertarDiscordChargeback(webhookData, nutricionista);

        return {
          success: true,
          nutricionistaId: nutricionista.id,
          message: 'Chargeback processado - Nutricionista desativado',
        };
      } else {
        logger.info('Chargeback de cliente que não é nutricionista', {
          email: webhookData.email_cliente,
          id_venda: webhookData.id_venda,
        });

        return {
          success: true,
          message: 'Chargeback registrado - Cliente não é nutricionista',
        };
      }
    } catch (error: any) {
      logger.error('Erro ao processar SALE_CHARGEBACK', {
        email: webhookData.email_cliente,
        erro: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'Erro ao processar chargeback',
        error: error.message,
      };
    }
  }

  /**
   * Desativa todas as inscrições ativas do nutricionista
   */
  private async desativarInscricao(idNutricionista: number): Promise<void> {
    await Inscricao.update(
      { ativo: false },
      { where: { id_nutricionista: idNutricionista, ativo: true } }
    );

    logger.info('Inscrições desativadas por chargeback', {
      id_nutricionista: idNutricionista,
    });
  }

  /**
   * Envia email notificando chargeback
   */
  private async enviarEmailChargeback(
    webhookData: NormalizedWebhookData,
    nutricionista: Nutricionista
  ): Promise<void> {
    try {
      const appUrl = process.env.APP_URL || 'https://app.nutno.com.br';

      await sendEmail(
        nutricionista.email,
        '⚠️ Notificação Importante - Chargeback em Sua Conta',
        'chargeback-notificacao',
        {
          nome: nutricionista.nome,
          idVenda: webhookData.id_venda,
          appUrl,
        }
      );

      logger.info('Email de chargeback enviado', {
        nutricionistaId: nutricionista.id,
        email: nutricionista.email,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar email de chargeback', {
        nutricionistaId: nutricionista.id,
        erro: error.message,
      });
      // Não interrompe o fluxo se email falhar
    }
  }

  /**
   * Alerta Discord sobre chargeback
   */
  private async alertarDiscordChargeback(
    webhookData: NormalizedWebhookData,
    nutricionista: Nutricionista
  ): Promise<void> {
    try {
      const discordService = getDiscordAlertService();

      await discordService.enviarAlertaCadastroNutricionista({
        usuarioId: nutricionista.id,
        usuarioNome: nutricionista.nome,
        usuarioEmail: nutricionista.email,
        plano: `⚠️ CHARGEBACK - ${webhookData.tipo}`,
        dataVencimento: new Date(),
      });

      logger.info('Alerta Discord de chargeback enviado', {
        nutricionistaId: nutricionista.id,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar alerta Discord de chargeback', {
        nutricionistaId: nutricionista.id,
        erro: error.message,
      });
      // Não interrompe o fluxo se Discord falhar
    }
  }
}

export default new ChargebackService();

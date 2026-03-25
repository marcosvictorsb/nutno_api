import axios from 'axios';
import logger from '../config/logger';

export interface DiscordErrorAlert {
  message: string;
  error: string | Error;
  requestId?: string;
  userId?: number;
  timestamp: string;
  method?: string;
  path?: string;
  meta?: Record<string, any>;
}

class DiscordAlertService {
  private webhookUrl: string;
  private isProduction: boolean;

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Envia alerta de erro para o Discord via Webhook
   */
  async enviarAlertaErro(dados: DiscordErrorAlert): Promise<void> {
    // Só enviar em produção
    if (!this.isProduction) {
      return;
    }

    // Validar configuração
    if (!this.webhookUrl) {
      logger.warn('Discord webhook URL não configurada');
      return;
    }

    try {
      const embed = this.construirEmbed(dados);

      await axios.post(this.webhookUrl, {
        embeds: [embed],
      });
    } catch (erro: any) {
      // Não quebre a aplicação se Discord falhar
      logger.warn('Erro ao enviar alerta para Discord', {
        erro: erro.message,
        status: erro.response?.status,
      });
    }
  }

  /**
   * Constrói um embed formatado para o Discord
   */
  private construirEmbed(dados: DiscordErrorAlert): object {
    const { message, error, requestId, userId, timestamp, method, path, meta } =
      dados;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    // Campos do embed
    const fields: any[] = [];

    if (requestId) {
      fields.push({
        name: '🔗 Request ID',
        value: `\`${requestId}\``,
        inline: true,
      });
    }

    if (userId) {
      fields.push({
        name: '👤 User ID',
        value: `\`${userId}\``,
        inline: true,
      });
    }

    if (method && path) {
      fields.push({
        name: '📍 Rota',
        value: `\`${method} ${path}\``,
        inline: false,
      });
    }

    if (errorStack) {
      // Truncar stack para não exceder limite do Discord (1024 chars)
      const truncatedStack = errorStack.substring(0, 1020);
      fields.push({
        name: '📋 Stack Trace',
        value: `\`\`\`${truncatedStack}\`\`\``,
        inline: false,
      });
    }

    // Metadados adicionais
    if (meta && Object.keys(meta).length > 0) {
      const metaText = Object.entries(meta)
        .slice(0, 5) // Limitar a 5 entradas
        .map(([key, value]) => `• ${key}: ${String(value)}`)
        .join('\n');

      if (metaText) {
        fields.push({
          name: '📦 Metadados',
          value: metaText,
          inline: false,
        });
      }
    }

    return {
      title: '🚨 ERRO NA APLICAÇÃO',
      description: message,
      color: 0xff0000, // Vermelho
      fields,
      footer: {
        text: `${new Date(timestamp).toLocaleString('pt-BR')} | Nutno API`,
      },
      timestamp: new Date(timestamp).toISOString(),
    };
  }
}

// Singleton
let instance: DiscordAlertService | null = null;

export function getDiscordAlertService(): DiscordAlertService {
  if (!instance) {
    instance = new DiscordAlertService();
  }
  return instance;
}

export default getDiscordAlertService();

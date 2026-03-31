import crypto from 'crypto';
import logger from '../../../config/logger';
import { getDiscordAlertService } from '../../../services/discord.alert.service';
import { sendEmail } from '../../../services/email.service';
import { WebhookProcessingResult } from '../../../types/Kirvano';
import { hashPassword } from '../../../utils/password';
import Inscricao from '../../Inscricoes/model/inscricao.model';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import Plano from '../../Planos/model/plano.model';
import { NormalizedWebhookData } from '../utils/webhook-parser';

/**
 * Serviço para processar pagamentos aprovados (SALE_APPROVED)
 * Cria nutricionista (se necessário) e inscrição
 */
class SaleApprovedProcessorService {
  /**
   * Processa uma venda aprovada (PIX ou recorrente)
   */
  async processar(
    webhookData: NormalizedWebhookData
  ): Promise<WebhookProcessingResult> {
    try {
      logger.info('Iniciando processamento de SALE_APPROVED', {
        email: webhookData.email_cliente,
        tipo: webhookData.tipo,
        preco: webhookData.preco_total,
      });

      // 1. Validar dados do cliente
      this.validarDados(webhookData);

      // 2. Buscar ou criar nutricionista
      const { nutricionista, isNovo, senhaTemporaria } =
        await this.buscarOuCriarNutricionista(webhookData);

      // 3. Buscar plano default
      const plano = await this.buscarPlanoDefault();
      if (!plano) {
        throw new Error('Nenhum plano configurado no sistema');
      }

      // 4. Criar inscrição
      const inscricao = await this.criarInscricao(
        nutricionista.id,
        plano.id,
        webhookData
      );

      // 5. Enviar email de boas-vindas
      await this.enviarEmailBoasVindas(nutricionista, isNovo, senhaTemporaria);

      // 6. Alertar no Discord
      await this.alertarDiscord(nutricionista, inscricao, webhookData);

      logger.info('SALE_APPROVED processado com sucesso', {
        nutricionistaId: nutricionista.id,
        inscricaoId: inscricao.id,
        email: webhookData.email_cliente,
        nutricionistaNovoOrExistente: isNovo ? 'novo' : 'existente',
      });

      return {
        success: true,
        nutricionistaId: nutricionista.id,
        adesaoId: inscricao.id,
        message: 'Nutricionista e inscrição criados com sucesso',
      };
    } catch (error: any) {
      logger.error('Erro ao processar SALE_APPROVED', {
        erro: error.message,
        email: webhookData.email_cliente,
        stack: error.stack,
      });

      return {
        success: false,
        message: 'Erro ao processar pagamento aprovado',
        error: error.message,
      };
    }
  }

  /**
   * Valida dados obrigatórios
   */
  private validarDados(data: NormalizedWebhookData): void {
    if (!data.email_cliente || !data.nome_cliente) {
      throw new Error('Email e nome do cliente são obrigatórios');
    }
  }

  /**
   * Busca nutricionista por email ou cria um novo
   */
  private async buscarOuCriarNutricionista(
    webhookData: NormalizedWebhookData
  ): Promise<{
    nutricionista: Nutricionista;
    isNovo: boolean;
    senhaTemporaria?: string;
  }> {
    // Tentar buscar nutricionista existente
    let nutricionista = await Nutricionista.findOne({
      where: { email: webhookData.email_cliente },
    });

    if (nutricionista) {
      logger.info('Nutricionista existente encontrado', {
        id: nutricionista.id,
        email: webhookData.email_cliente,
      });

      // Reativar se estava inativo
      if (!nutricionista.ativo) {
        await nutricionista.update({ ativo: true });
        logger.info('Nutricionista reativado', { id: nutricionista.id });
      }

      return {
        nutricionista,
        isNovo: false,
      };
    }

    // Criar novo nutricionista
    logger.info('Criando novo nutricionista', {
      email: webhookData.email_cliente,
      nome: webhookData.nome_cliente,
    });

    const senhaTemporaria = this.gerarSenhaAleatoria();
    const senhaHash = await hashPassword(senhaTemporaria);

    nutricionista = await Nutricionista.create({
      nome: webhookData.nome_cliente,
      email: webhookData.email_cliente,
      telefone: webhookData.telefone_cliente,
      senha: senhaHash,
      ativo: true,
    });

    logger.info('Nutricionista criado com sucesso', {
      id: nutricionista.id,
      email: webhookData.email_cliente,
    });

    return {
      nutricionista,
      isNovo: true,
      senhaTemporaria,
    };
  }

  /**
   * Busca um plano padrão para atribuir
   * Busca por "Plano Pro" ou o primeiro plano disponível
   */
  private async buscarPlanoDefault(): Promise<Plano | null> {
    // Tentar buscar plano "Plano Pro"
    let plano = await Plano.findOne({
      where: {
        nome_plano: 'Plano Pro',
      },
    });

    // Se não encontrar, buscar qualquer plano que não seja gratuito
    if (!plano) {
      plano = await Plano.findOne({
        where: { gratuito: false },
        order: [['id', 'ASC']],
      });
    }

    // Se ainda não encontrar, buscar qualquer plano
    if (!plano) {
      plano = await Plano.findOne({
        order: [['id', 'ASC']],
      });
    }

    return plano;
  }

  /**
   * Cria inscrição para o nutricionista
   */
  private async criarInscricao(
    id_nutricionista: number,
    id_plano: number,
    webhookData: NormalizedWebhookData
  ): Promise<Inscricao> {
    const data_inicio = new Date();
    const data_vencimento = this.calcularDataVencimento(webhookData.tipo);

    const inscricao = await Inscricao.create({
      id_nutricionista,
      id_plano,
      data_inicio,
      data_vencimento,
      ativo: true,
      metodo_pagamento: webhookData.meio_pagamento,
    });

    logger.info('Inscrição criada com sucesso', {
      id: inscricao.id,
      id_nutricionista,
      id_plano,
      data_vencimento,
    });

    return inscricao;
  }

  /**
   * Calcula data de vencimento baseado no tipo de plano
   * ONE_TIME: 1 ano
   * RECURRING: próxima cobrança (mensal por padrão)
   */
  private calcularDataVencimento(tipo: string): Date {
    const hoje = new Date();
    const vencimento = new Date(hoje);

    if (tipo === 'ONE_TIME') {
      // Adiciona 1 ano
      vencimento.setFullYear(vencimento.getFullYear() + 1);
    } else if (tipo === 'RECURRING') {
      // Adiciona 1 mês (será renovado na próxima cobrança)
      vencimento.setMonth(vencimento.getMonth() + 1);
    }

    return vencimento;
  }

  /**
   * Envia email de boas-vindas ao nutricionista
   * Se novo: envia com senha temporária
   * Se existente: envia com link de reset de senha
   */
  private async enviarEmailBoasVindas(
    nutricionista: Nutricionista,
    isNovo: boolean,
    senhaTemporaria?: string
  ): Promise<void> {
    try {
      const appUrl = process.env.APP_URL || 'https://app.nutno.com.br';

      if (isNovo && senhaTemporaria) {
        // Email para nutricionista NOVO com senha temporária
        // Usar URL de login direto, sem token de reset
        const loginUrl = `${appUrl}/auth/login`;

        await sendEmail(
          nutricionista.email,
          '🔐 Bem-vindo ao Nutno - Suas Credenciais de Acesso',
          'nutricionista-com-senha-temporaria',
          {
            nome: nutricionista.nome,
            email: nutricionista.email,
            senhaTemporaria,
            appUrl,
          }
        );

        logger.info('Email com senha temporária enviado (nutricionista novo)', {
          nutricionistaId: nutricionista.id,
          email: nutricionista.email,
        });
      } else {
        // Email para nutricionista EXISTENTE (reativado) com link de reset de senha
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Salvar token no banco
        await nutricionista.update({
          reset_password_token: resetTokenHash,
          reset_password_expires: expiresAt,
        });

        const loginUrl = `${appUrl}/reset-senha/${resetToken}`;

        await sendEmail(
          nutricionista.email,
          '✅ Bem-vindo ao Nutno - Sua Inscrição Foi Aprovada!',
          'sucesso-cadastro-nutricionista',
          {
            nome: nutricionista.nome,
            loginUrl,
            appUrl,
          }
        );

        logger.info('Email de reativação enviado (nutricionista existente)', {
          nutricionistaId: nutricionista.id,
          email: nutricionista.email,
        });
      }
    } catch (error: any) {
      logger.warn('Erro ao enviar email de boas-vindas', {
        nutricionistaId: nutricionista.id,
        erro: error.message,
      });
      // Não interrompe o fluxo se email falhar
    }
  }

  /**
   * Alerta Discord sobre novo cadastro (no canal DISCORD_WEBHOOK_ADESAO_URL)
   */
  private async alertarDiscord(
    nutricionista: Nutricionista,
    inscricao: Inscricao,
    webhookData: NormalizedWebhookData
  ): Promise<void> {
    try {
      const discordService = getDiscordAlertService();

      await discordService.enviarAlertaCadastroNutricionista({
        usuarioId: nutricionista.id,
        usuarioNome: nutricionista.nome,
        usuarioEmail: nutricionista.email,
        plano: `PIX ${webhookData.tipo}`,
        dataVencimento: inscricao.data_vencimento || new Date(),
      });

      logger.info('Alerta Discord enviado', {
        nutricionistaId: nutricionista.id,
      });
    } catch (error: any) {
      logger.warn('Erro ao enviar alerta Discord', {
        nutricionistaId: nutricionista.id,
        erro: error.message,
      });
      // Não interrompe o fluxo se Discord falhar
    }
  }

  /**
   * Gera uma senha aleatória temporária
   */
  private gerarSenhaAleatoria(comprimento: number = 12): string {
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let senha = '';

    for (let i = 0; i < comprimento; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      senha += caracteres.charAt(indice);
    }

    return senha;
  }
}

export default new SaleApprovedProcessorService();

import logger from '../../../config/logger';
import { WebhookProcessingError } from '../../../types/Kirvano';

/**
 * Serviço para validar webhooks da Kirvano
 */
class WebhookValidatorService {
  /**
   * Valida o token de autenticação do webhook
   */
  validateToken(authHeader?: string): boolean {
    const expectedToken = process.env.KIRVANO_WEBHOOK_TOKEN;

    if (!expectedToken) {
      logger.warn('KIRVANO_WEBHOOK_TOKEN não configurada no .env');
      return false;
    }

    if (!authHeader) {
      logger.warn('Header Authorization não fornecido no webhook');
      return false;
    }

    // Esperado: "Bearer {token}"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Formato de Authorization inválido', { authHeader });
      return false;
    }

    const token = parts[1];
    const isValid = token === expectedToken;

    if (!isValid) {
      logger.warn('Token de webhook inválido', {
        token: token.substring(0, 10) + '...',
      });
    }

    return isValid;
  }

  /**
   * Valida o payload do webhook
   */
  validatePayload(payload: any): {
    valid: boolean;
    error?: WebhookProcessingError;
  } {
    // Validar campos obrigatórios
    const requiredFields = [
      'event',
      'event_description',
      'sale_id',
      'payment_method',
      'total_price',
      'type',
      'status',
      'created_at',
      'customer',
      'payment',
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        return {
          valid: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: `Campo obrigatório ausente: ${field}`,
            details: { field },
          },
        };
      }
    }

    // Validar estrutura de customer
    if (
      !payload.customer.name ||
      !payload.customer.email ||
      !payload.customer.document
    ) {
      return {
        valid: false,
        error: {
          code: 'INVALID_CUSTOMER',
          message:
            'Dados incompletos do cliente (name, email, document obrigatórios)',
        },
      };
    }

    // Validar email
    if (!this.isValidEmail(payload.customer.email)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Email do cliente inválido',
          details: { email: payload.customer.email },
        },
      };
    }

    // Validar documento (CPF básico)
    // if (!this.isValidCPF(payload.customer.document)) {
    //   return {
    //     valid: false,
    //     error: {
    //       code: 'INVALID_DOCUMENT',
    //       message: 'Documento (CPF) inválido',
    //       details: { document: payload.customer.document },
    //     },
    //   };
    // }

    // Validar tipo de evento
    const validEvents = [
      'PIX_GENERATED',
      'PIX_EXPIRED',
      'BANK_SLIP_GENERATED',
      'BANK_SLIP_EXPIRED',
      'SALE_APPROVED',
      'SALE_REFUSED',
      'SALE_CHARGEBACK',
    ];
    if (!validEvents.includes(payload.event)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_EVENT',
          message: 'Tipo de evento não suportado',
          details: { event: payload.event, validEvents },
        },
      };
    }

    // Validar status
    const validStatus = [
      'PENDING',
      'APPROVED',
      'CANCELED',
      'REFUSED',
      'CHARGEBACK',
    ];
    if (!validStatus.includes(payload.status)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status não suportado',
          details: { status: payload.status, validStatus },
        },
      };
    }

    // Validar tipo de venda
    const validTypes = ['ONE_TIME', 'RECURRING'];
    if (!validTypes.includes(payload.type)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_SALE_TYPE',
          message: 'Tipo de venda não suportado',
          details: { type: payload.type, validTypes },
        },
      };
    }

    // Validar method de pagamento (caso necessário)
    const validMethods = ['PIX', 'CREDIT_CARD', 'BANK_SLIP'];
    if (!validMethods.includes(payload.payment_method)) {
      logger.warn('Método de pagamento não suportado ou não esperado', {
        method: payload.payment_method,
      });
      // Não retornar erro pois pode chegar novos métodos no futuro
    }

    return { valid: true };
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida CPF (validação básica de formato e dígitos)
   */
  private isValidCPF(document: string): boolean {
    // Remove caracteres não numéricos
    const cpf = document.replace(/\D/g, '');

    // Deve ter 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Não pode ser sequência de números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validação dos dígitos verificadores (algoritmo do CPF)
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }

    return true;
  }
}

export default new WebhookValidatorService();

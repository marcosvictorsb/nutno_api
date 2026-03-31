import { KirvanoWebhookPayload } from '../../../types/Kirvano';

/**
 * Interface para dados normalizados do webhook
 * Converte de inglês (API Kirvano) para português (BD local)
 */
export interface NormalizedWebhookData {
  evento: string;
  descricao_evento: string;
  id_checkout?: string;
  id_venda: string;
  url_checkout?: string;
  meio_pagamento: string;
  preco_total: number;
  tipo: string;
  status: string;
  criado_em: Date;
  nome_cliente: string;
  documento_cliente: string;
  email_cliente: string;
  telefone_cliente?: string;
  payload: Record<string, any>;
}

/**
 * Serviço para parser/normalizar dados do webhook Kirvano
 */
class WebhookParserService {
  /**
   * Normaliza o payload do webhook para o formato do BD (em português)
   * Converte event → evento, sale_id → id_venda, etc
   */
  parseWebhookPayload(payload: KirvanoWebhookPayload): NormalizedWebhookData {
    // Parse do total_price (remove "R$ " e converte para número)
    const preco_total = this.parseCurrencyString(payload.total_price);

    return {
      evento: payload.event,
      descricao_evento: payload.event_description,
      id_checkout: payload.checkout_id,
      id_venda: payload.sale_id,
      url_checkout: payload.checkout_url,
      meio_pagamento: payload.payment_method,
      preco_total,
      tipo: payload.type,
      status: payload.status,
      criado_em: new Date(payload.created_at),
      nome_cliente: payload.customer.name,
      documento_cliente: payload.customer.document,
      email_cliente: payload.customer.email,
      telefone_cliente: payload.customer.phone_number,
      payload, // Armazenar payload completo para auditoria
    };
  }

  /**
   * Parse de string de moeda brasileira para número
   * "R$ 169,80" → 169.80
   */
  private parseCurrencyString(currencyStr: string): number {
    // Remove "R$" e espaços
    let cleaned = currencyStr.replace(/R\$\s*/g, '').trim();
    // Substitui . por "" e , por .
    cleaned = cleaned.replace(/\./g, '').replace(/,/, '.');
    return parseFloat(cleaned);
  }

  /**
   * Extrai informações de UTM se presente
   */
  getUTMData(payload: KirvanoWebhookPayload): Record<string, string> | null {
    if (!payload.utm) {
      return null;
    }

    return {
      source: payload.utm.utm_source || payload.utm.src || '',
      medium: payload.utm.utm_medium || '',
      campaign: payload.utm.utm_campaign || '',
      term: payload.utm.utm_term || '',
      content: payload.utm.utm_content || '',
    };
  }

  /**
   * Extrai informações de plano/assinatura
   */
  getPlanData(
    payload: KirvanoWebhookPayload
  ): { name: string; frequency: string; nextCharge: Date } | null {
    if (!payload.plan) {
      return null;
    }

    return {
      name: payload.plan.name,
      frequency: payload.plan.charge_frequency,
      nextCharge: new Date(payload.plan.next_charge_date),
    };
  }
}

export default new WebhookParserService();

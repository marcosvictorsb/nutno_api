/**
 * Tipos relacionados aos webhooks da Kirvano
 * Documentação: https://help.kirvano.com/hc/central-de-ajuda/articles/1765385505
 */

export type KirvanoEvent =
  | 'PIX_GENERATED'
  | 'PIX_EXPIRED'
  | 'BANK_SLIP_GENERATED'
  | 'BANK_SLIP_EXPIRED'
  | 'SALE_APPROVED'
  | 'SALE_REFUSED'
  | 'SALE_CHARGEBACK';

export type KirvanoPaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BANK_SLIP';

export type KirvanoStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'CANCELED'
  | 'REFUSED'
  | 'CHARGEBACK';

export type KirvanoSaleType = 'ONE_TIME' | 'RECURRING';

export type ChargeFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUALLY'
  | 'ANNUALLY';

export interface KirvanoCustomer {
  name: string;
  document: string;
  email: string;
  phone_number: string;
}

export interface KirvanoPayment {
  method: KirvanoPaymentMethod;
  qrcode?: string;
  qrcode_image?: string;
  digitable_line?: string;
  barcode?: string;
  link?: string;
  brand?: string;
  installments?: number;
  expires_at?: string;
  finished_at?: string;
}

export interface KirvanoProduct {
  id: string;
  name: string;
  offer_id: string;
  offer_name: string;
  description: string;
  price: string;
  photo: string;
  is_order_bump: boolean;
}

export interface KirvanovoPlan {
  name: string;
  charge_frequency: ChargeFrequency;
  next_charge_date: string;
}

export interface KirvanoUTM {
  src?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface KirvanoWebhookPayload {
  event: KirvanoEvent;
  event_description: string;
  checkout_id: string;
  sale_id: string;
  checkout_url?: string;
  payment_method: KirvanoPaymentMethod;
  total_price: string;
  type: KirvanoSaleType;
  status: KirvanoStatus;
  created_at: string;
  customer: KirvanoCustomer;
  payment: KirvanoPayment;
  products: KirvanoProduct[];
  plan?: KirvanovoPlan;
  utm?: KirvanoUTM;
}

export interface WebhookProcessingResult {
  success: boolean;
  webhookId?: number;
  nutricionistaId?: number;
  adesaoId?: number;
  message: string;
  error?: string;
}

export interface WebhookProcessingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

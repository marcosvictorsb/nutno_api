import { Client } from '@opensearch-project/opensearch';
import Transport from 'winston-transport';

/**
 * Configuração do OpenSearch
 */
export interface OpenSearchConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
  index: string;
  sslVerify: boolean;
}

/**
 * Valida e carrega as configurações do OpenSearch a partir das variáveis de ambiente
 */
export function loadOpenSearchConfig(): OpenSearchConfig {
  return {
    enabled: process.env.OPENSEARCH_ENABLED === 'true',
    url: process.env.OPENSEARCH_URL || '',
    username: process.env.OPENSEARCH_USERNAME || '',
    password: process.env.OPENSEARCH_PASSWORD || '',
    index: process.env.OPENSEARCH_INDEX || 'nutno-logs',
    sslVerify: process.env.OPENSEARCH_SSL_VERIFY !== 'false',
  };
}

/**
 * Custom Transport para enviar logs ao OpenSearch
 */
export class OpenSearchTransport extends Transport {
  private client: Client | null = null;
  private config: OpenSearchConfig;
  private queue: any[] = [];
  private isConnected = false;

  constructor(config: OpenSearchConfig) {
    super();
    this.config = config;

    if (config.enabled && config.url) {
      this.initializeClient();
    }
  }

  /**
   * Inicializa o cliente do OpenSearch
   */
  private initializeClient(): void {
    try {
      const clientConfig: any = {
        node: this.config.url,
        ssl: {
          rejectUnauthorized: this.config.sslVerify,
        },
      };

      if (this.config.username && this.config.password) {
        clientConfig.auth = {
          username: this.config.username,
          password: this.config.password,
        };
      }

      this.client = new Client(clientConfig);
      this.isConnected = true;

      console.log('[OpenSearch] Transport inicializado com sucesso', {
        opensearchUrl: this.config.url,
        opensearchIndex: this.config.index,
      });
    } catch (error: Error | any) {
      console.error('[OpenSearch] Erro ao inicializar OpenSearch Transport', {
        error: error.message,
      });
      this.isConnected = false;
    }
  }

  /**
   * Implementa o método log do Transport do Winston
   */
  log(info: any, callback: Function): void {
    if (!this.config.enabled || !this.client) {
      if (callback) {
        callback();
      }
      return;
    }

    setImmediate(async () => {
      try {
        const document = this.formatLog(info);
        await this.sendToOpenSearch(document);
      } catch (error: Error | any) {
        console.error('[OpenSearch] Erro ao enviar log para OpenSearch', {
          error: error.message,
        });
      }

      if (callback) {
        callback();
      }
    });
  }

  /**
   * Serializa valores para strings JSON quando necessário
   */
  private serializeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Se é uma string, verifica se já é JSON válido
    if (typeof value === 'string') {
      // Se já parece ser JSON, retorna como está
      if (
        (value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))
      ) {
        return value;
      }
      // Caso contrário, retorna a string como está
      return value;
    }

    // Se é um objeto simples (não array, não Date, não Error), converte para JSON
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof Error)
    ) {
      return JSON.stringify(value);
    }

    // Se é um array, converte para JSON
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Formata o log para enviar ao OpenSearch
   */
  private formatLog(info: any): Record<string, any> {
    // Separa os campos conhecidos e serializa o resto
    const {
      timestamp,
      level,
      message,
      stack,
      requestId,
      userId,
      method,
      path,
      ...rest
    } = info;

    // Serializa todos os valores para strings JSON quando apropriado
    const serializedRest: Record<string, any> = {};

    // Campos que devem ser mantidos/convertidos para objetos
    const objectFields = ['filtros'];

    for (const [key, value] of Object.entries(rest)) {
      if (objectFields.includes(key)) {
        // Para campos que devem ser objetos, faz parse se for string JSON
        if (typeof value === 'string') {
          try {
            serializedRest[key] = JSON.parse(value);
          } catch {
            // Se não conseguir fazer parse, mantém a string
            serializedRest[key] = value;
          }
        } else {
          serializedRest[key] = value;
        }
      } else {
        serializedRest[key] = this.serializeValue(value);
      }
    }

    return {
      '@timestamp': new Date(timestamp || Date.now()).toISOString(),
      level,
      message,
      stack: stack || null,
      meta: {
        requestId: requestId || null,
        userId: userId || null,
        method: method || null,
        path: path || null,
        ...serializedRest,
      },
      environment: process.env.NODE_ENV || 'development',
      service: 'nutno-api',
    };
  }

  /**
   * Envia o documento para o OpenSearch
   */
  private async sendToOpenSearch(document: Record<string, any>): Promise<void> {
    if (!this.client) {
      throw new Error('Cliente OpenSearch não inicializado');
    }

    try {
      const indexName = `${this.config.index}-${new Date().toISOString().split('T')[0]}`;

      await this.client.index({
        index: indexName,
        body: document,
      });
    } catch (error: Error | any) {
      // Tentar reconectar se a conexão foi perdida
      if (
        error.message?.includes('Connection refused') ||
        error.message?.includes('ECONNREFUSED')
      ) {
        console.warn('[OpenSearch] Conexão perdida, tentando reconectar', {
          error: error.message,
        });
        this.isConnected = false;
        this.initializeClient();
      }

      throw error;
    }
  }

  /**
   * Retorna informações sobre o status da conexão
   */
  getConnectionStatus(): {
    enabled: boolean;
    connected: boolean;
    url?: string;
    index?: string;
  } {
    return {
      enabled: this.config.enabled,
      connected: this.isConnected && !!this.client,
      url: this.config.enabled ? this.config.url : undefined,
      index: this.config.enabled ? this.config.index : undefined,
    };
  }
}

/**
 * Factory para criar uma instância do OpenSearch Transport
 */
export function createOpenSearchTransport(): OpenSearchTransport | null {
  const config = loadOpenSearchConfig();

  if (!config.enabled) {
    console.log('[OpenSearch] OpenSearch está desabilitado');
    return null;
  }

  if (!config.url) {
    console.warn(
      '[OpenSearch] OPENSEARCH_URL não configurada, OpenSearch será desabilitado'
    );
    return null;
  }

  return new OpenSearchTransport(config);
}

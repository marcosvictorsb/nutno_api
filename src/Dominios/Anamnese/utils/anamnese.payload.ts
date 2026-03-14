import logger from '../../../config/logger';

export interface AnamnesePayload {
  nome_completo?: string;
  como_prefere_ser_chamado?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'Outro';
  telefone?: string;
  whatsapp?: string;
  peso_atual?: number;
  altura?: number;
  tempo_nesse_peso?: string;
  fez_acompanhamento_antes?: boolean;
  qual_acompanhamento?: string;
  objetivo?:
    | 'emagrecer'
    | 'ganhar_massa'
    | 'melhorar_saude'
    | 'controlar_doenca'
    | 'melhorar_performance'
    | 'outro';
  objetivo_descricao?: string;
  maior_dificuldade_alimentacao?: string;
  horario_acorda?: string;
  horario_dorme?: string;
  horario_cafe_manha?: string;
  horario_almoco?: string;
  horario_jantar?: string;
  trabalha_casa_ou_fora?: 'casa' | 'fora' | 'hibrido';
  tempo_parar_cozinhar?: 'sempre' | 'as_vezes' | 'raramente';
  faz_exercicios?: boolean;
  qual_exercicio?: string;
  frequencia_exercicio_semana?: number;
  alimentos_que_ama?: string;
  alimentos_que_odeia?: string;
  restricao_alimentar?:
    | 'lactose'
    | 'gluten'
    | 'vegetariano'
    | 'vegano'
    | 'religiao'
    | 'nenhuma'
    | 'outra';
  restricao_descricao?: string;
  alergias_alimentares?: string;
  copos_agua_por_dia?: number;
  consumo_alcool?: 'nao' | 'socialmente' | 'frequentemente';
  doencas_diagnosticadas?: string;
  medicamentos?: string;
  historico_familiar?: string;
  qualidade_sono?: 'otimo' | 'bom' | 'ruim' | 'pessimo';
  nivel_estresse?: number;
  observacoes_livres?: string;
}

const CAMPOS_ANAMNESE: Array<keyof AnamnesePayload> = [
  'nome_completo',
  'como_prefere_ser_chamado',
  'data_nascimento',
  'sexo',
  'telefone',
  'whatsapp',
  'peso_atual',
  'altura',
  'tempo_nesse_peso',
  'fez_acompanhamento_antes',
  'qual_acompanhamento',
  'objetivo',
  'objetivo_descricao',
  'maior_dificuldade_alimentacao',
  'horario_acorda',
  'horario_dorme',
  'horario_cafe_manha',
  'horario_almoco',
  'horario_jantar',
  'trabalha_casa_ou_fora',
  'tempo_parar_cozinhar',
  'faz_exercicios',
  'qual_exercicio',
  'frequencia_exercicio_semana',
  'alimentos_que_ama',
  'alimentos_que_odeia',
  'restricao_alimentar',
  'restricao_descricao',
  'alergias_alimentares',
  'copos_agua_por_dia',
  'consumo_alcool',
  'doencas_diagnosticadas',
  'medicamentos',
  'historico_familiar',
  'qualidade_sono',
  'nivel_estresse',
  'observacoes_livres',
];

export function extrairCamposAnamnese(body: unknown): Partial<AnamnesePayload> {
  logger.info('Extraindo campos de anamnese do corpo da requisição', {
    body: JSON.stringify(body),
  });

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    logger.info('Corpo da requisição para anamnese é inválido', {
      body: JSON.stringify(body),
    });
    return {};
  }

  const payload: Partial<AnamnesePayload> = {};
  const bodyObj = body as Record<string, unknown>;

  CAMPOS_ANAMNESE.forEach((campo) => {
    if (bodyObj[campo] !== undefined) {
      payload[campo] = bodyObj[campo] as never;
    }
  });

  logger.info('Campos de anamnese extraídos do corpo da requisição', {
    payload: JSON.stringify(payload),
  });

  return payload;
}

export function payloadAnamneseVazio(
  payload: Partial<AnamnesePayload>
): boolean {
  return Object.keys(payload).length === 0;
}

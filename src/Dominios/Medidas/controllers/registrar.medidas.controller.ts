import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Medidas from '../model/medidas.model';

interface RegistrarMediasBody {
  id_paciente: number;
  data_avaliacao: string;
  peso?: number;
  altura?: number;
  perc_gordura_corporal?: number;
  perc_massa_magra?: number;
  idade_metabolica?: number;
  circunferencia_cintura?: number;
  circunferencia_quadril?: number;
  circunferencia_abdominal?: number;
  circunferencia_braco?: number;
  circunferencia_coxa_direita?: number;
  circunferencia_coxa_esquerda?: number;
  circunferencia_panturrilha?: number;
  circunferencia_torax?: number;
  dobra_subescapular?: number;
  dobra_tricipital?: number;
  dobra_bicipital?: number;
  dobra_suprailíaca?: number;
  dobra_abdominal?: number;
  dobra_coxal?: number;
  dobra_peitoral?: number;
  pressao_arterial_sistolica?: number;
  pressao_arterial_diastolica?: number;
  frequencia_cardiaca?: number;
  tmb?: number;
  gasto_energetico_total?: number;
  nivel_atividade?:
    | 'sedentario'
    | 'leve'
    | 'moderado'
    | 'intenso'
    | 'muito_intenso';
  observacoes?: string;
  imc?: number;
  fotos?: string[];
}

// Funções auxiliares para cálculos
const calcularIMC = (peso: number, altura: number): number => {
  if (!peso || !altura || altura === 0) return 0;
  return Number((peso / (altura * altura)).toFixed(2));
};

const calcularRCQ = (cintura: number, quadril: number): number => {
  if (!cintura || !quadril || quadril === 0) return 0;
  return Number((cintura / quadril).toFixed(2));
};

const calcularTMB = (
  peso: number,
  altura: number,
  idade: number,
  sexo: string
): number => {
  // Usando fórmula de Mifflin-St Jeor
  if (!peso || !altura) return 0;
  let tmb = 0;
  if (sexo === 'M') {
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
  }
  return Number(tmb.toFixed(2));
};

const calcularGET = (tmb: number, nivelAtividade: string): number => {
  if (!tmb) return 0;
  const fatoresAtividade: { [key: string]: number } = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9,
  };
  const fator = fatoresAtividade[nivelAtividade] || 1.2;
  return Number((tmb * fator).toFixed(2));
};

export const registrarMedidas = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Medidas>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    const { id: id_paciente } = req.params;

    logger.info('Requisição para registrar medidas recebida', {
      id_nutricionista,
      body: req.body,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou registrar medidas');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const {
      data_avaliacao,
      peso,
      altura,
      perc_gordura_corporal,
      perc_massa_magra,
      idade_metabolica,
      circunferencia_cintura,
      circunferencia_quadril,
      circunferencia_abdominal,
      circunferencia_braco,
      circunferencia_coxa_direita,
      circunferencia_coxa_esquerda,
      circunferencia_panturrilha,
      circunferencia_torax,
      dobra_subescapular,
      dobra_tricipital,
      dobra_bicipital,
      dobra_suprailíaca,
      dobra_abdominal,
      dobra_coxal,
      dobra_peitoral,
      pressao_arterial_sistolica,
      pressao_arterial_diastolica,
      frequencia_cardiaca,
      nivel_atividade,
      observacoes,
      fotos,
      imc,
      tmb,
      gasto_energetico_total,
    } = req.body as RegistrarMediasBody;

    // Validações
    console.log({
      a: !id_paciente,
      b: !Number.isInteger(id_paciente),
      c: Number(id_paciente) <= 0,
    });
    // if (
    //   !id_paciente ||
    //   !Number.isInteger(id_paciente) ||
    //   Number(id_paciente) <= 0
    // ) {
    //   logger.warn('ID de paciente invalido para registrar medidas', {
    //     id_nutricionista,
    //     id_paciente,
    //   });
    //   return res.status(400).json({
    //     success: false,
    //     message: 'ID de paciente invalido',
    //   });
    // }

    if (!data_avaliacao) {
      logger.warn('Data de avaliacao nao informada');
      return res.status(400).json({
        success: false,
        message: 'Data de avaliacao e obrigatoria',
      });
    }

    // Verificar se paciente existe e pertence ao nutricionista
    const paciente = await Paciente.findOne({
      where: {
        id: Number(id_paciente),
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente nao encontrado ou nao pertence ao nutricionista', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    // Calcular valores automaticamente
    let relacao_cintura_quadril = null;

    if (circunferencia_cintura && circunferencia_quadril) {
      relacao_cintura_quadril = calcularRCQ(
        circunferencia_cintura,
        circunferencia_quadril
      );
    }

    const novaAvaliacao = await Medidas.create({
      id_paciente: Number(id_paciente),
      id_nutricionista,
      data_avaliacao,
      peso: peso || null,
      altura: altura || null,
      imc: imc || null,
      perc_gordura_corporal: perc_gordura_corporal || null,
      perc_massa_magra: perc_massa_magra || null,
      idade_metabolica: idade_metabolica || null,
      circunferencia_cintura: circunferencia_cintura || null,
      circunferencia_quadril: circunferencia_quadril || null,
      relacao_cintura_quadril,
      circunferencia_abdominal: circunferencia_abdominal || null,
      circunferencia_braco: circunferencia_braco || null,
      circunferencia_coxa_direita: circunferencia_coxa_direita || null,
      circunferencia_coxa_esquerda: circunferencia_coxa_esquerda || null,
      circunferencia_panturrilha: circunferencia_panturrilha || null,
      circunferencia_torax: circunferencia_torax || null,
      dobra_subescapular: dobra_subescapular || null,
      dobra_tricipital: dobra_tricipital || null,
      dobra_bicipital: dobra_bicipital || null,
      dobra_suprailíaca: dobra_suprailíaca || null,
      dobra_abdominal: dobra_abdominal || null,
      dobra_coxal: dobra_coxal || null,
      dobra_peitoral: dobra_peitoral || null,
      pressao_arterial_sistolica: pressao_arterial_sistolica || null,
      pressao_arterial_diastolica: pressao_arterial_diastolica || null,
      frequencia_cardiaca: frequencia_cardiaca || null,
      tmb: tmb || null,
      gasto_energetico_total: gasto_energetico_total || null,
      nivel_atividade: nivel_atividade || null,
      observacoes: observacoes || null,
      fotos: fotos || [],
    });

    logger.info('Medidas registradas com sucesso', {
      id_nutricionista,
      id_paciente,
      id_medida: novaAvaliacao.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Medidas registradas com sucesso',
      data: novaAvaliacao,
    });
  } catch (error) {
    logger.error('Erro ao registrar medidas', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar medidas',
    });
  }
};

import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Medidas from '../model/medidas.model';

interface AtualizarMediasBody {
  data_avaliacao?: string;
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

export const atualizarMedida = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para atualizar medida recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
      body: JSON.stringify(req.body),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou atualizar medida', {
        endpoint: 'atualizar-medida',
      });
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    logger.info('Validando IDs de paciente e medida', {
      id_nutricionista,
      id_paciente: req.params.id,
      id_medida: req.params.medidaId,
    });

    const id_paciente = Number(req.params.id);
    const id_medida = Number(req.params.medidaId);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido para atualizar medida', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    if (!Number.isInteger(id_medida) || id_medida <= 0) {
      logger.warn('ID de medida invalido para atualizar', {
        id_nutricionista,
        id_medida,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de medida invalido',
      });
    }

    logger.info('Verificando se paciente existe e pertence ao nutricionista', {
      id_nutricionista,
      id_paciente,
    });

    // Verificar se paciente existe e pertence ao nutricionista
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn(
        'Paciente nao encontrado ou nao pertence ao nutricionista ao atualizar medida',
        {
          id_nutricionista,
          id_paciente,
        }
      );
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    logger.info('Paciente validado com sucesso', {
      id_nutricionista,
      id_paciente,
      paciente_nome: paciente.nome,
    });

    logger.info('Buscando medida para atualizar', {
      id_nutricionista,
      id_paciente,
      id_medida,
    });

    const medida = await Medidas.findOne({
      where: {
        id: id_medida,
        id_paciente,
        id_nutricionista,
      },
    });

    if (!medida) {
      logger.warn('Medida nao encontrada para atualizar', {
        id_nutricionista,
        id_paciente,
        id_medida,
      });
      return res.status(404).json({
        success: false,
        message: 'Medida nao encontrada',
      });
    }

    logger.info('Medida encontrada com sucesso', {
      id_nutricionista,
      id_paciente,
      id_medida,
      data_avaliacao: medida.data_avaliacao,
    });

    const dadosAtualizacao = req.body as AtualizarMediasBody;

    logger.info('Iniciando atualização dos dados da medida', {
      id_nutricionista,
      id_paciente,
      id_medida,
      campos_atualizados: Object.keys(dadosAtualizacao),
    });

    // Atualizar apenas os campos fornecidos
    if (dadosAtualizacao.data_avaliacao !== undefined) {
      medida.data_avaliacao = new Date(dadosAtualizacao.data_avaliacao);
      logger.info('Campo data_avaliacao atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.data_avaliacao,
      });
    }

    if (dadosAtualizacao.peso !== undefined) {
      medida.peso = dadosAtualizacao.peso;
      logger.debug('Campo peso atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.peso,
      });
    }

    if (dadosAtualizacao.altura !== undefined) {
      medida.altura = dadosAtualizacao.altura;
      logger.debug('Campo altura atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.altura,
      });
    }

    if (dadosAtualizacao.imc !== undefined) {
      medida.imc = dadosAtualizacao.imc;
      logger.debug('Campo imc atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.imc,
      });
    }

    if (dadosAtualizacao.perc_gordura_corporal !== undefined) {
      medida.perc_gordura_corporal = dadosAtualizacao.perc_gordura_corporal;
      logger.debug('Campo perc_gordura_corporal atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.perc_gordura_corporal,
      });
    }

    if (dadosAtualizacao.perc_massa_magra !== undefined) {
      medida.perc_massa_magra = dadosAtualizacao.perc_massa_magra;
      logger.debug('Campo perc_massa_magra atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.perc_massa_magra,
      });
    }

    if (dadosAtualizacao.idade_metabolica !== undefined) {
      medida.idade_metabolica = dadosAtualizacao.idade_metabolica;
      logger.debug('Campo idade_metabolica atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.idade_metabolica,
      });
    }

    if (dadosAtualizacao.circunferencia_cintura !== undefined) {
      medida.circunferencia_cintura = dadosAtualizacao.circunferencia_cintura;
      logger.debug('Campo circunferencia_cintura atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_cintura,
      });
    }

    if (dadosAtualizacao.circunferencia_quadril !== undefined) {
      medida.circunferencia_quadril = dadosAtualizacao.circunferencia_quadril;
      logger.debug('Campo circunferencia_quadril atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_quadril,
      });
    }

    if (dadosAtualizacao.circunferencia_abdominal !== undefined) {
      medida.circunferencia_abdominal =
        dadosAtualizacao.circunferencia_abdominal;
      logger.debug('Campo circunferencia_abdominal atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_abdominal,
      });
    }

    if (dadosAtualizacao.circunferencia_braco !== undefined) {
      medida.circunferencia_braco = dadosAtualizacao.circunferencia_braco;
      logger.debug('Campo circunferencia_braco atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_braco,
      });
    }

    if (dadosAtualizacao.circunferencia_coxa_direita !== undefined) {
      medida.circunferencia_coxa_direita =
        dadosAtualizacao.circunferencia_coxa_direita;
      logger.debug('Campo circunferencia_coxa_direita atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_coxa_direita,
      });
    }

    if (dadosAtualizacao.circunferencia_coxa_esquerda !== undefined) {
      medida.circunferencia_coxa_esquerda =
        dadosAtualizacao.circunferencia_coxa_esquerda;
      logger.debug('Campo circunferencia_coxa_esquerda atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_coxa_esquerda,
      });
    }

    if (dadosAtualizacao.circunferencia_panturrilha !== undefined) {
      medida.circunferencia_panturrilha =
        dadosAtualizacao.circunferencia_panturrilha;
      logger.debug('Campo circunferencia_panturrilha atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_panturrilha,
      });
    }

    if (dadosAtualizacao.circunferencia_torax !== undefined) {
      medida.circunferencia_torax = dadosAtualizacao.circunferencia_torax;
      logger.debug('Campo circunferencia_torax atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.circunferencia_torax,
      });
    }

    if (dadosAtualizacao.dobra_subescapular !== undefined) {
      medida.dobra_subescapular = dadosAtualizacao.dobra_subescapular;
      logger.debug('Campo dobra_subescapular atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_subescapular,
      });
    }

    if (dadosAtualizacao.dobra_tricipital !== undefined) {
      medida.dobra_tricipital = dadosAtualizacao.dobra_tricipital;
      logger.debug('Campo dobra_tricipital atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_tricipital,
      });
    }

    if (dadosAtualizacao.dobra_bicipital !== undefined) {
      medida.dobra_bicipital = dadosAtualizacao.dobra_bicipital;
      logger.debug('Campo dobra_bicipital atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_bicipital,
      });
    }

    if (dadosAtualizacao.dobra_suprailíaca !== undefined) {
      medida.dobra_suprailíaca = dadosAtualizacao.dobra_suprailíaca;
      logger.debug('Campo dobra_suprailíaca atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_suprailíaca,
      });
    }

    if (dadosAtualizacao.dobra_abdominal !== undefined) {
      medida.dobra_abdominal = dadosAtualizacao.dobra_abdominal;
      logger.debug('Campo dobra_abdominal atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_abdominal,
      });
    }

    if (dadosAtualizacao.dobra_coxal !== undefined) {
      medida.dobra_coxal = dadosAtualizacao.dobra_coxal;
      logger.debug('Campo dobra_coxal atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_coxal,
      });
    }

    if (dadosAtualizacao.dobra_peitoral !== undefined) {
      medida.dobra_peitoral = dadosAtualizacao.dobra_peitoral;
      logger.debug('Campo dobra_peitoral atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.dobra_peitoral,
      });
    }

    if (dadosAtualizacao.pressao_arterial_sistolica !== undefined) {
      medida.pressao_arterial_sistolica =
        dadosAtualizacao.pressao_arterial_sistolica;
      logger.debug('Campo pressao_arterial_sistolica atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.pressao_arterial_sistolica,
      });
    }

    if (dadosAtualizacao.pressao_arterial_diastolica !== undefined) {
      medida.pressao_arterial_diastolica =
        dadosAtualizacao.pressao_arterial_diastolica;
      logger.debug('Campo pressao_arterial_diastolica atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.pressao_arterial_diastolica,
      });
    }

    if (dadosAtualizacao.frequencia_cardiaca !== undefined) {
      medida.frequencia_cardiaca = dadosAtualizacao.frequencia_cardiaca;
      logger.debug('Campo frequencia_cardiaca atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.frequencia_cardiaca,
      });
    }

    if (dadosAtualizacao.tmb !== undefined) {
      medida.tmb = dadosAtualizacao.tmb;
      logger.debug('Campo tmb atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.tmb,
      });
    }

    if (dadosAtualizacao.gasto_energetico_total !== undefined) {
      medida.gasto_energetico_total = dadosAtualizacao.gasto_energetico_total;
      logger.debug('Campo gasto_energetico_total atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.gasto_energetico_total,
      });
    }

    if (dadosAtualizacao.nivel_atividade !== undefined) {
      medida.nivel_atividade = dadosAtualizacao.nivel_atividade;
      logger.debug('Campo nivel_atividade atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.nivel_atividade,
      });
    }

    if (dadosAtualizacao.observacoes !== undefined) {
      medida.observacoes = dadosAtualizacao.observacoes;
      logger.info('Campo observacoes atualizado', {
        id_medida,
        novo_valor: dadosAtualizacao.observacoes,
      });
    }

    if (dadosAtualizacao.fotos !== undefined) {
      medida.fotos = dadosAtualizacao.fotos;
      logger.info('Campo fotos atualizado', {
        id_medida,
        quantidade_fotos: dadosAtualizacao.fotos?.length || 0,
      });
    }

    logger.info('Salvando alterações da medida no banco de dados', {
      id_nutricionista,
      id_paciente,
      id_medida,
    });

    await medida.save();

    logger.info('Medida atualizada com sucesso', {
      id_nutricionista,
      id_paciente,
      id_medida,
      atualizado_em: medida.atualizado_em,
    });

    return res.status(200).json({
      success: true,
      message: 'Medida atualizada com sucesso',
      data: medida,
    });
  } catch (error) {
    logger.error('Erro ao atualizar medida', {
      error,
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id,
      id_medida: req.params.medidaId,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar medida',
    });
  }
};

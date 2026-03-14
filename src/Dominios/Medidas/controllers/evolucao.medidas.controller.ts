import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Medidas from '../model/medidas.model';
import Paciente from '../../Pacientes/model/paciente.model';

interface EvolucaoMedida {
  primeira_medicao: any;
  ultima_medicao: any;
  comparativo: {
    peso?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    altura?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    imc?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    perc_gordura_corporal?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    perc_massa_magra?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    circunferencia_cintura?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    circunferencia_quadril?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    relacao_cintura_quadril?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    circunferencia_abdominal?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    tmb?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
    gasto_energetico_total?: {
      primeira: number | null | undefined;
      ultima: number | null | undefined;
      diferenca_absoluta: number | null;
      diferenca_percentual: string;
    };
  };
}

const calcularDiferenca = (
  primeira: number | null | undefined,
  ultima: number | null | undefined
): { diferenca_absoluta: number | null; diferenca_percentual: string } => {
  if (
    primeira === null ||
    primeira === undefined ||
    ultima === null ||
    ultima === undefined
  ) {
    return {
      diferenca_absoluta: null,
      diferenca_percentual: 'N/A',
    };
  }

  const diferenca_absoluta = Number((ultima - primeira).toFixed(2));
  let diferenca_percentual = 'N/A';

  if (primeira !== 0) {
    const percentual = ((ultima - primeira) / primeira) * 100;
    diferenca_percentual = `${percentual > 0 ? '+' : ''}${percentual.toFixed(2)}%`;
  } else if (ultima !== 0) {
    diferenca_percentual = '+100%';
  }

  return { diferenca_absoluta, diferenca_percentual };
};

export const evoluçãoMedidas = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<EvolucaoMedida>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para evolução de medidas recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou ver evolução de medidas');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido para ver evolução de medidas', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    // Verificar se paciente existe e pertence ao nutricionista
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
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

    logger.info('Buscando medidas do paciente para evolução', {
      id_nutricionista,
      id_paciente,
    });

    // Buscar primeira medida (ordem crescente)
    const primeira_medicao = await Medidas.findOne({
      where: {
        id_paciente,
        id_nutricionista,
      },
      order: [['data_avaliacao', 'ASC']],
    });

    // Buscar última medida (ordem decrescente)
    const ultima_medicao = await Medidas.findOne({
      where: {
        id_paciente,
        id_nutricionista,
      },
      order: [['data_avaliacao', 'DESC']],
    });

    if (!primeira_medicao || !ultima_medicao) {
      logger.warn('Medidas nao encontradas para fazer evolução', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Nao ha registros de medidas suficientes para comparacao',
      });
    }

    // Construir objeto de comparativo
    const comparativo = {
      peso: {
        primeira: primeira_medicao.peso,
        ultima: ultima_medicao.peso,
        ...calcularDiferenca(primeira_medicao.peso, ultima_medicao.peso),
      },
      altura: {
        primeira: primeira_medicao.altura,
        ultima: ultima_medicao.altura,
        ...calcularDiferenca(primeira_medicao.altura, ultima_medicao.altura),
      },
      imc: {
        primeira: primeira_medicao.imc,
        ultima: ultima_medicao.imc,
        ...calcularDiferenca(primeira_medicao.imc, ultima_medicao.imc),
      },
      perc_gordura_corporal: {
        primeira: primeira_medicao.perc_gordura_corporal,
        ultima: ultima_medicao.perc_gordura_corporal,
        ...calcularDiferenca(
          primeira_medicao.perc_gordura_corporal,
          ultima_medicao.perc_gordura_corporal
        ),
      },
      perc_massa_magra: {
        primeira: primeira_medicao.perc_massa_magra,
        ultima: ultima_medicao.perc_massa_magra,
        ...calcularDiferenca(
          primeira_medicao.perc_massa_magra,
          ultima_medicao.perc_massa_magra
        ),
      },
      circunferencia_cintura: {
        primeira: primeira_medicao.circunferencia_cintura,
        ultima: ultima_medicao.circunferencia_cintura,
        ...calcularDiferenca(
          primeira_medicao.circunferencia_cintura,
          ultima_medicao.circunferencia_cintura
        ),
      },
      circunferencia_quadril: {
        primeira: primeira_medicao.circunferencia_quadril,
        ultima: ultima_medicao.circunferencia_quadril,
        ...calcularDiferenca(
          primeira_medicao.circunferencia_quadril,
          ultima_medicao.circunferencia_quadril
        ),
      },
      relacao_cintura_quadril: {
        primeira: primeira_medicao.relacao_cintura_quadril,
        ultima: ultima_medicao.relacao_cintura_quadril,
        ...calcularDiferenca(
          primeira_medicao.relacao_cintura_quadril,
          ultima_medicao.relacao_cintura_quadril
        ),
      },
      circunferencia_abdominal: {
        primeira: primeira_medicao.circunferencia_abdominal,
        ultima: ultima_medicao.circunferencia_abdominal,
        ...calcularDiferenca(
          primeira_medicao.circunferencia_abdominal,
          ultima_medicao.circunferencia_abdominal
        ),
      },
      tmb: {
        primeira: primeira_medicao.tmb,
        ultima: ultima_medicao.tmb,
        ...calcularDiferenca(primeira_medicao.tmb, ultima_medicao.tmb),
      },
      gasto_energetico_total: {
        primeira: primeira_medicao.gasto_energetico_total,
        ultima: ultima_medicao.gasto_energetico_total,
        ...calcularDiferenca(
          primeira_medicao.gasto_energetico_total,
          ultima_medicao.gasto_energetico_total
        ),
      },
    };

    const evolucao: EvolucaoMedida = {
      primeira_medicao,
      ultima_medicao,
      comparativo,
    };

    logger.info('Evolução de medidas calculada com sucesso', {
      id_nutricionista,
      id_paciente,
    });

    return res.status(200).json({
      success: true,
      message: 'Evolução de medidas calculada com sucesso',
      data: evolucao,
    });
  } catch (error) {
    logger.error('Erro ao calcular evolução de medidas', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao calcular evolução de medidas',
    });
  }
};

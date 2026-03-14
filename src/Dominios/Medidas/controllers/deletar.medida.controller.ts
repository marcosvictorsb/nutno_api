import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Medidas from '../model/medidas.model';
import Paciente from '../../Pacientes/model/paciente.model';

export const deletarMedida = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para deletar medida recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou deletar medida');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);
    const id_medida = Number(req.params.medidaId);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido para deletar medida', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    if (!Number.isInteger(id_medida) || id_medida <= 0) {
      logger.warn('ID de medida invalido', {
        id_nutricionista,
        id_medida,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de medida invalido',
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

    logger.info('Buscando medida para deletar', {
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
      logger.warn('Medida nao encontrada para deletar', {
        id_nutricionista,
        id_paciente,
        id_medida,
      });
      return res.status(404).json({
        success: false,
        message: 'Medida nao encontrada',
      });
    }

    await medida.destroy();

    logger.info('Medida deletada com sucesso', {
      id_nutricionista,
      id_paciente,
      id_medida,
    });

    return res.status(200).json({
      success: true,
      message: 'Medida deletada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar medida', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao deletar medida',
    });
  }
};

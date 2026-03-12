import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';

export const arquivarPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Paciente>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    logger.info('Requisição para arquivar paciente recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou arquivar paciente');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido fornecido para arquivar', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    logger.info('Buscando o paciente para arquivar id: ', { id_paciente });
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente nao encontrado para arquivar', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    await paciente.update({ status: 'arquivado' });

    logger.info('Paciente arquivado com sucesso', {
      id_nutricionista,
      id_paciente,
    });

    return res.status(200).json({
      success: true,
      message: 'Paciente arquivado com sucesso',
      data: paciente,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao arquivar paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao arquivar paciente',
      error: error.message,
    });
  }
};

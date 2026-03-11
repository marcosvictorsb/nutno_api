import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';

export const buscarPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Paciente>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    logger.info('Requisição para buscar paciente recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou buscar paciente');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    logger.info('Buscando paciente com ID', {
      id_nutricionista,
      id_paciente,
    });

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido fornecido', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    logger.info('Buscando o paciente id: ', { id_paciente });
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente nao encontrado', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Paciente encontrado',
      data: paciente,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao buscar paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar paciente',
      error: error.message,
    });
  }
};

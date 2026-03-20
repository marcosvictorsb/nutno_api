import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Anamnese from '../model/anamnese.model';

export const buscarAnamnese = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Anamnese>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    logger.info('Requisição para buscar anamnese recebida', {
      id_nutricionista,
      params: req.params,
    });

    if (!id_nutricionista) {
      logger.info('Usuario nao autenticado tentou buscar anamnese');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.info('ID de paciente invalido para buscar anamnese', {
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    logger.info('Validando existencia do paciente para buscar anamnese', {
      id_nutricionista,
      id_paciente,
    });
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.info('Paciente nao encontrado para buscar anamnese', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    if (!paciente) {
      logger.info('Paciente nao encontrado para buscar anamnese', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    logger.info('Buscando anamnese para paciente', {
      id_nutricionista,
      id_paciente,
    });

    const anamnese = await Anamnese.findOne({
      where: {
        id_paciente,
      },
      order: [['id', 'DESC']],
    });

    if (!anamnese) {
      logger.info('Anamnese nao encontrada para paciente', {
        id_nutricionista,
        id_paciente,
      });

      return res.status(404).json({
        success: false,
        message: 'Anamnese nao encontrada para este paciente',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Anamnese encontrada com sucesso',
      data: anamnese,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao buscar anamnese', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar anamnese',
      error: error.message,
    });
  }
};

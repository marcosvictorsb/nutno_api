import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Anamnese from '../model/anamnese.model';
import {
  extrairCamposAnamnese,
  payloadAnamneseVazio,
} from '../utils/anamnese.payload';

interface AtualizarAnamneseResponse {
  id_anamnese: number;
  id_paciente: number;
}

export const atualizarAnamnese = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<AtualizarAnamneseResponse>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para atualizar anamnese recebida', {
      id_nutricionista,
      params: req.params,
      body: JSON.stringify(req.body),
    });

    if (!id_nutricionista) {
      logger.info('Usuario nao autenticado tentou atualizar anamnese');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.info('ID de paciente invalido', { id_paciente });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    logger.info('Validando existencia do paciente para atualizar anamnese', {
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
      logger.info('Paciente nao encontrado para atualizar anamnese', {
        id_nutricionista,
        id_paciente,
      });

      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    const payload = extrairCamposAnamnese(req.body);

    if (payloadAnamneseVazio(payload)) {
      logger.info('Nenhum campo de anamnese enviado para atualizar', {
        id_nutricionista,
        id_paciente,
      });

      return res.status(400).json({
        success: false,
        message: 'Envie ao menos um campo da anamnese para atualizar',
      });
    }

    logger.info('Verificando se anamnese ja existe para paciente', {
      id_nutricionista,
      id_paciente,
    });
    const existente = await Anamnese.findOne({
      where: { id_paciente },
    });

    let id_anamnese: number;

    if (existente) {
      logger.info('Anamnese existente encontrada, atualizando', {
        id_nutricionista,
        id_paciente,
        id_anamnese: existente.id,
      });

      await existente.update(payload);
      id_anamnese = existente.id;
      await paciente.update({
        data_nascimento: payload.data_nascimento || paciente.data_nascimento,
        sexo: payload.sexo || paciente.sexo,
      });
    } else {
      logger.info('Nenhuma anamnese existente encontrada, criando nova', {
        id_nutricionista,
        id_paciente,
      });

      const criada = await Anamnese.create({
        id_paciente,
        ...payload,
      });

      id_anamnese = criada.id;

      await paciente.update({
        data_nascimento: payload.data_nascimento || paciente.data_nascimento,
        sexo: payload.sexo || paciente.sexo,
      });
    }

    if (!paciente.formulario_preenchido) {
      logger.info('Marcando formulario do paciente como preenchido', {
        id_nutricionista,
        id_paciente,
      });

      await paciente.update({
        formulario_preenchido: true,
        formulario_preenchido_em: new Date(),
        data_nascimento: payload.data_nascimento || paciente.data_nascimento,
        sexo: payload.sexo || paciente.sexo,
      });
    }

    logger.info('Anamnese atualizada por nutricionista', {
      id_nutricionista,
      id_paciente,
      id_anamnese,
    });

    return res.status(200).json({
      success: true,
      message: 'Anamnese atualizada com sucesso',
      data: {
        id_anamnese,
        id_paciente,
      },
    });
  } catch (error: Error | any) {
    logger.error('Erro ao atualizar anamnese', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar anamnese',
      error: error.message,
    });
  }
};

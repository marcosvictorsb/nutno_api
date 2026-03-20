import { Request, Response } from 'express';
import logger from '../../../config/logger';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Anamnese from '../model/anamnese.model';
import {
  extrairCamposAnamnese,
  payloadAnamneseVazio,
} from '../utils/anamnese.payload';

interface SalvarAnamneseResponse {
  id_anamnese: number;
  id_paciente: number;
}

export const salvarAnamnesePublica = async (
  req: Request,
  res: Response<ApiResponse<SalvarAnamneseResponse>>
) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token do formulario e obrigatorio',
      });
    }

    const paciente = await Paciente.findOne({
      where: { token_formulario: token },
    });

    if (!paciente) {
      logger.warn('Tentativa de salvar anamnese com token invalido', { token });
      return res.status(404).json({
        success: false,
        message: 'Formulario nao encontrado',
      });
    }

    const payload = extrairCamposAnamnese(req.body);

    if (payloadAnamneseVazio(payload)) {
      return res.status(400).json({
        success: false,
        message: 'Envie ao menos um campo da anamnese',
      });
    }

    const existente = await Anamnese.findOne({
      where: { id_paciente: paciente.id },
    });

    let anamneseId: number;

    if (existente) {
      await existente.update(payload);
      anamneseId = existente.id;
    } else {
      const criada = await Anamnese.create({
        id_paciente: paciente.id,
        ...payload,
      });
      anamneseId = criada.id;
    }

    await paciente.update({
      formulario_preenchido: true,
      formulario_preenchido_em: new Date(),
      data_nascimento: payload.data_nascimento || paciente.data_nascimento,
      sexo: payload.sexo || paciente.sexo,
    });

    logger.info('Anamnese salva via formulario publico', {
      id_paciente: paciente.id,
      id_anamnese: anamneseId,
    });

    return res.status(200).json({
      success: true,
      message: 'Anamnese salva com sucesso',
      data: {
        id_anamnese: anamneseId,
        id_paciente: paciente.id,
      },
    });
  } catch (error: Error | any) {
    logger.error('Erro ao salvar anamnese publica', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar anamnese publica',
      error: error.message,
    });
  }
};

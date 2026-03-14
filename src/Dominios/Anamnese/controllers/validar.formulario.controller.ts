import { Request, Response } from 'express';
import logger from '../../../config/logger';
import Nutricionista from '../../Nutricionista/model/nutricionista.model';
import Paciente from '../../Pacientes/model/paciente.model';
import { ApiResponse } from '../../../types/ApiResponse';

interface FormularioPublicoResponse {
  id_paciente: number;
  nome_paciente: string;
  nome_nutricionista: string;
  como_prefere_ser_chamado?: string;
  data_nascimento?: Date;
  sexo?: 'M' | 'F' | 'Outro';
  telefone?: string;
  whatsapp?: string;
  formulario_preenchido: boolean;
}

export const validarFormularioPublico = async (
  req: Request,
  res: Response<ApiResponse<FormularioPublicoResponse>>
) => {
  try {
    const token = req.params.token;
    logger.info('Requisição para validar formulario publico recebida', {
      token,
    });

    if (!token) {
      logger.warn('Token do formulario nao fornecido');
      return res.status(400).json({
        success: false,
        message: 'Token do formulario e obrigatorio',
      });
    }

    logger.info('Buscando paciente com token de formulario', { token });
    const paciente = await Paciente.findOne({
      where: { token_formulario: token },
    });

    if (!paciente) {
      logger.warn('Token de formulario invalido', { token });
      return res.status(404).json({
        success: false,
        message: 'Formulario nao encontrado',
      });
    }

    logger.info('Paciente encontrado para token de formulario', {
      id_paciente: paciente.id,
      nome_paciente: paciente.nome,
    });
    const nutricionista = await Nutricionista.findByPk(
      paciente.id_nutricionista
    );

    if (!nutricionista) {
      logger.error('Nutricionista nao encontrado para formulario publico', {
        id_paciente: paciente.id,
        id_nutricionista: paciente.id_nutricionista,
      });
      return res.status(404).json({
        success: false,
        message: 'Nutricionista nao encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Formulario validado com sucesso',
      data: {
        id_paciente: paciente.id,
        nome_paciente: paciente.nome,
        como_prefere_ser_chamado: paciente.como_prefere_ser_chamado,
        data_nascimento: paciente.data_nascimento,
        sexo: paciente.sexo,
        telefone: paciente.telefone,
        whatsapp: paciente.whatsapp,
        nome_nutricionista: nutricionista.nome,
        formulario_preenchido: paciente.formulario_preenchido,
      },
    });
  } catch (error: Error | any) {
    logger.error('Erro ao validar formulario publico', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar formulario publico',
      error: error.message,
    });
  }
};

import { Response } from 'express';
import { Op } from 'sequelize';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';

interface AtualizarPacienteBody {
  nome?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'Outro';
  como_prefere_ser_chamado?: string;
  foto_perfil?: string;
  status?: 'ativo' | 'inativo' | 'arquivado';
}

export const atualizarPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Paciente>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para atualizar paciente recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
      body: req.body,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou atualizar paciente');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido fornecido para atualizar', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    const body = req.body as AtualizarPacienteBody;
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      logger.warn('Body vazio enviado para atualizar paciente', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'Envie ao menos um campo para atualizar',
      });
    }

    logger.info('Buscando o paciente para atualizar id: ', { id_paciente });

    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.info('Paciente nao encontrado para atualizar', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    const {
      nome,
      email,
      telefone,
      whatsapp,
      data_nascimento,
      sexo,
      como_prefere_ser_chamado,
      foto_perfil,
      status,
    } = body;

    const atualizacoes: AtualizarPacienteBody = {};

    if (nome !== undefined) {
      if (!nome.trim()) {
        logger.warn('Nome do paciente nao pode ser vazio', {
          id_nutricionista,
          id_paciente,
        });

        return res.status(400).json({
          success: false,
          message: 'Nome do paciente nao pode ser vazio',
        });
      }
      atualizacoes.nome = nome.trim();
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();

      if (emailNormalizado) {
        logger.info(
          'Verificando se ja existe paciente com este email para atualizar',
          {
            id_nutricionista,
            email: emailNormalizado,
          }
        );

        const pacienteComMesmoEmail = await Paciente.findOne({
          where: {
            id_nutricionista,
            email: emailNormalizado,
            id: {
              [Op.ne]: id_paciente,
            },
          },
        });

        if (pacienteComMesmoEmail) {
          return res.status(409).json({
            success: false,
            message:
              'Você já possui paciente com esse email. Por favor, utilize outro email.',
          });
        }
      }

      atualizacoes.email = emailNormalizado || undefined;
    }

    if (telefone !== undefined) {
      atualizacoes.telefone = telefone.trim() || undefined;
    }

    if (whatsapp !== undefined) {
      atualizacoes.whatsapp = whatsapp.trim() || undefined;
    }

    if (data_nascimento !== undefined) {
      atualizacoes.data_nascimento = data_nascimento;
    }

    if (sexo !== undefined) {
      atualizacoes.sexo = sexo;
    }

    if (como_prefere_ser_chamado !== undefined) {
      atualizacoes.como_prefere_ser_chamado =
        como_prefere_ser_chamado.trim() || undefined;
    }

    if (foto_perfil !== undefined) {
      atualizacoes.foto_perfil = foto_perfil.trim() || undefined;
    }

    if (
      status !== undefined &&
      ['ativo', 'inativo', 'arquivado'].includes(status)
    ) {
      atualizacoes.status = status;
    }

    if (Object.keys(atualizacoes).length === 0) {
      logger.warn('Nenhum campo valido enviado para atualizar paciente', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo valido foi enviado para atualizacao',
      });
    }

    await paciente.update(atualizacoes);

    logger.info('Paciente atualizado com sucesso', {
      id_nutricionista,
      id_paciente,
    });

    return res.status(200).json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: paciente,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao atualizar paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar paciente',
      error: error.message,
    });
  }
};

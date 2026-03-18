import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../models/nutricionista.model';

interface AtualizarDadosPessoaisBody {
  nome?: string;
  email?: string;
  crn?: string | null;
  telefone?: string | null;
  especialidade?: string | null;
}

export const atualizarDadosPessoais = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Nutricionista>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info(
      'Requisição para atualizar dados pessoais do nutricionista recebida',
      {
        id_nutricionista,
        body: req.body,
      }
    );

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou atualizar dados pessoais');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    logger.info('Buscando nutricionista para atualizar dados pessoais', {
      id_nutricionista,
    });

    const nutricionista = await Nutricionista.findByPk(id_nutricionista);

    if (!nutricionista) {
      logger.warn(
        'Nutricionista não encontrado para atualizar dados pessoais',
        {
          id_nutricionista,
        }
      );
      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    const { nome, email, crn, telefone, especialidade } =
      req.body as AtualizarDadosPessoaisBody;

    // Verificar se email já está em uso por outro nutricionista
    if (email && email !== nutricionista.email) {
      logger.info('Verificando disponibilidade do novo email', {
        id_nutricionista,
        novo_email: email,
      });

      const emailEmUso = await Nutricionista.findOne({
        where: { email },
      });

      if (emailEmUso) {
        logger.warn('Email já está em uso por outro nutricionista', {
          id_nutricionista,
          email,
        });
        return res.status(409).json({
          success: false,
          message: 'Este email já está em uso',
        });
      }
    }

    // Verificar se CRN já está em uso por outro nutricionista
    if (crn && crn !== nutricionista.crn) {
      logger.info('Verificando disponibilidade do novo CRN', {
        id_nutricionista,
        novo_crn: crn,
      });

      const crnEmUso = await Nutricionista.findOne({
        where: { crn },
      });

      if (crnEmUso) {
        logger.warn('CRN já está em uso por outro nutricionista', {
          id_nutricionista,
          crn,
        });
        return res.status(409).json({
          success: false,
          message: 'Este CRN já está em uso',
        });
      }
    }

    logger.info('Atualizando dados pessoais do nutricionista', {
      id_nutricionista,
      campos_atualizados: {
        nome: !!nome,
        email: !!email,
        crn: !!crn,
        telefone: !!telefone,
        especialidade: !!especialidade,
      },
    });

    // Atualizar campos fornecidos
    if (nome) nutricionista.nome = nome;
    if (email) nutricionista.email = email;
    if (crn !== undefined) nutricionista.crn = crn || undefined;
    if (telefone !== undefined) nutricionista.telefone = telefone || undefined;
    if (especialidade !== undefined)
      nutricionista.especialidade = especialidade || undefined;
    nutricionista.updated_at = new Date();

    await nutricionista.save();

    logger.info('Dados pessoais do nutricionista atualizados com sucesso', {
      id_nutricionista,
      nome: nutricionista.nome,
      email: nutricionista.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Dados pessoais atualizados com sucesso',
      data: nutricionista,
    });
  } catch (error) {
    logger.error('Erro ao atualizar dados pessoais do nutricionista', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar dados pessoais',
    });
  }
};

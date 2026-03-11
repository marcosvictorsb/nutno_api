import { Response } from 'express';
import { Op } from 'sequelize';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';
import { log } from 'console';

export const listarPacientes = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Paciente[]>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para listar pacientes recebida', {
      id_nutricionista,
      query: JSON.stringify(req.query),
    });

    if (!id_nutricionista) {
      logger.info('Usuario nao autenticado tentou listar pacientes');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const statusQuery = req.query.status;
    const buscaQuery = req.query.busca;

    const where: {
      id_nutricionista: number;
      status?: 'ativo' | 'inativo' | 'arquivado';
      nome?: { [Op.like]: string };
    } = {
      id_nutricionista,
    };

    if (
      typeof statusQuery === 'string' &&
      ['ativo', 'inativo', 'arquivado'].includes(statusQuery)
    ) {
      where.status = statusQuery as 'ativo' | 'inativo' | 'arquivado';
    }

    if (typeof buscaQuery === 'string' && buscaQuery.trim().length > 0) {
      where.nome = {
        [Op.like]: `%${buscaQuery.trim()}%`,
      };
    }

    logger.info('Listando pacientes com filtros', {
      id_nutricionista,
      filtros: where,
    });

    const pacientes = await Paciente.findAll({
      where,
      order: [['criado_em', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Pacientes listados com sucesso',
      data: pacientes,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao listar pacientes', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar pacientes',
      error: error.message,
    });
  }
};

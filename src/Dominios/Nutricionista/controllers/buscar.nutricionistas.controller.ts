import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../models/nutricionista.model';

type ResponseNutricionista = Pick<
  Nutricionista,
  | 'nome'
  | 'email'
  | 'telefone'
  | 'especialidade'
  | 'bio'
  | 'caminho_foto'
  | 'crn'
>;

export const buscarNutricionistas = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ResponseNutricionista>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para buscar nutricionistas recebida', {
      id_nutricionista,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou buscar nutricionistas');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    logger.info('Executando query de busca de nutricionistas', {
      id_nutricionista,
    });

    const nutricionista = await Nutricionista.findByPk(id_nutricionista);

    if (!nutricionista) {
      logger.warn('Nutricionista não encontrado', {
        id_nutricionista,
      });
      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Nutricionistas encontrados',
      data: {
        nome: nutricionista?.nome,
        email: nutricionista?.email,
        telefone: nutricionista?.telefone,
        especialidade: nutricionista?.especialidade,
        bio: nutricionista?.bio,
        caminho_foto: nutricionista?.caminho_foto,
        crn: nutricionista?.crn,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar nutricionistas', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar nutricionistas',
    });
  }
};

export const obterNutricionistaById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Nutricionista>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    const { id } = req.params;

    logger.info('Requisição para obter nutricionista por ID recebida', {
      id_nutricionista,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou obter nutricionista');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    if (!id) {
      logger.warn('ID do nutricionista não fornecido', {
        id_nutricionista,
      });
      return res.status(400).json({
        success: false,
        message: 'ID do nutricionista é obrigatório',
      });
    }

    logger.info('Buscando nutricionista no banco de dados', {
      id_nutricionista,
      id,
    });

    const nutricionista = await Nutricionista.findByPk(id_nutricionista);

    if (!nutricionista) {
      logger.warn('Nutricionista não encontrado', {
        id_nutricionista,
        id,
      });
      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    if (!nutricionista.ativo) {
      logger.warn('Tentativa de acessar nutricionista inativo', {
        id_nutricionista,
        id,
      });
      return res.status(410).json({
        success: false,
        message: 'Nutricionista não está disponível',
      });
    }

    logger.info('Nutricionista obtido com sucesso', {
      id_nutricionista,
      id,
      nome: nutricionista.nome,
    });

    return res.status(200).json({
      success: true,
      message: 'Nutricionista obtido com sucesso',
      data: nutricionista,
    });
  } catch (error) {
    logger.error('Erro ao obter nutricionista', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      nutricionista_id: req.params.id,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter nutricionista',
    });
  }
};

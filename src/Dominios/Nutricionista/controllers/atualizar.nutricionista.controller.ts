import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../models/nutricionista.model';

interface AtualizarNutricionistaBody {
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  bio?: string;
  caminho_foto?: string;
}

export const atualizarNutricionista = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Nutricionista>>
) => {
  try {
    const id_usuario = req.user?.id;
    const nutricionista_id = req.params.id;

    logger.info('Requisição para atualizar nutricionista recebida', {
      id_usuario,
      nutricionista_id,
      body: req.body,
    });

    if (!id_usuario) {
      logger.warn('Usuario nao autenticado tentou atualizar nutricionista');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    if (!nutricionista_id) {
      logger.warn('ID do nutricionista não fornecido', {
        id_usuario,
      });
      return res.status(400).json({
        success: false,
        message: 'ID do nutricionista é obrigatório',
      });
    }

    logger.info('Buscando nutricionista para atualizar', {
      id_usuario,
      nutricionista_id,
    });

    const nutricionista = await Nutricionista.findByPk(id_usuario);

    if (!nutricionista) {
      logger.warn('Nutricionista não encontrado para atualizar', {
        id_usuario,
        nutricionista_id,
      });
      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    const { nome, email, telefone, especialidade, bio, caminho_foto } =
      req.body as AtualizarNutricionistaBody;

    // Verificar se email já está em uso por outro nutricionista
    if (email && email !== nutricionista.email) {
      logger.info('Verificando disponibilidade do novo email', {
        id_usuario,
        nutricionista_id,
        novo_email: email,
      });

      const emailEmUso = await Nutricionista.findOne({
        where: { email },
      });

      if (emailEmUso) {
        logger.warn('Email já está em uso por outro nutricionista', {
          id_usuario,
          nutricionista_id,
          email,
        });
        return res.status(409).json({
          success: false,
          message: 'Este email já está em uso',
        });
      }
    }

    logger.info('Atualizando dados do nutricionista', {
      id_usuario,
      nutricionista_id,
      campos_atualizados: {
        nome: !!nome,
        email: !!email,
        telefone: !!telefone,
        especialidade: !!especialidade,
        bio: !!bio,
        caminho_foto: !!caminho_foto,
      },
    });

    // Atualizar campos fornecidos
    if (nome) nutricionista.nome = nome;
    if (email) nutricionista.email = email;
    if (telefone !== undefined) nutricionista.telefone = telefone;
    if (especialidade !== undefined)
      nutricionista.especialidade = especialidade;
    if (bio !== undefined) nutricionista.bio = bio;
    if (caminho_foto !== undefined) nutricionista.caminho_foto = caminho_foto;
    nutricionista.updated_at = new Date();

    await nutricionista.save();

    logger.info('Nutricionista atualizado com sucesso', {
      id_usuario,
      nutricionista_id,
      nome: nutricionista.nome,
      email: nutricionista.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Nutricionista atualizado com sucesso',
      data: nutricionista,
    });
  } catch (error) {
    logger.error('Erro ao atualizar nutricionista', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      nutricionista_id: req.params.id,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar nutricionista',
    });
  }
};

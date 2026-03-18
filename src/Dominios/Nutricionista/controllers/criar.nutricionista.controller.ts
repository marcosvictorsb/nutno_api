import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { hashPassword } from '../../../utils/password';
import Nutricionista from '../models/nutricionista.model';

interface CriarNutricionistaBody {
  nome: string;
  email: string;
  senha: string;
  crn?: string;
  telefone?: string;
  especialidade?: string;
  bio?: string;
  caminho_foto?: string;
}

export const criarNutricionista = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Nutricionista>>
) => {
  try {
    const id_usuario = req.user?.id;

    logger.info('Requisição para criar nutricionista recebida', {
      id_usuario,
      body: req.body,
    });

    if (!id_usuario) {
      logger.warn('Usuario nao autenticado tentou criar nutricionista');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const { nome, email, senha, crn, telefone, especialidade, bio } =
      req.body as CriarNutricionistaBody;

    // Validações básicas
    if (!nome || !email || !senha) {
      logger.warn('Campos obrigatórios ausentes na criação de nutricionista', {
        id_usuario,
        nome: !!nome,
        email: !!email,
        senha: !!senha,
      });
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios',
      });
    }

    // Validar força da senha
    if (senha.length < 8) {
      logger.warn('Senha fraca fornecida', {
        id_usuario,
        senha_length: senha.length,
      });
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres',
      });
    }

    // Verificar se já existe nutricionista com este email
    logger.info('Verificando disponibilidade do email', {
      id_usuario,
      email,
    });

    const nutricionistaExistente = await Nutricionista.findOne({
      where: { email },
    });

    if (nutricionistaExistente) {
      logger.warn('Tentativa de criar nutricionista com email duplicado', {
        id_usuario,
        email,
      });
      return res.status(409).json({
        success: false,
        message: 'Já existe nutricionista cadastrado com este email',
      });
    }

    // Verificar se já existe nutricionista com este CRN (se fornecido)
    if (crn) {
      logger.info('Verificando disponibilidade do CRN', {
        id_usuario,
        crn,
      });

      const nutricionistaCRNExistente = await Nutricionista.findOne({
        where: { crn },
      });

      if (nutricionistaCRNExistente) {
        logger.warn('Tentativa de criar nutricionista com CRN duplicado', {
          id_usuario,
          crn,
        });
        return res.status(409).json({
          success: false,
          message: 'Já existe nutricionista cadastrado com este CRN',
        });
      }
    }

    logger.info('Gerando hash da senha', {
      id_usuario,
    });

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    logger.info('Criando novo nutricionista no banco de dados', {
      id_usuario,
      nome,
      email,
      crn,
    });

    const novoNutricionista = await Nutricionista.create({
      nome,
      email,
      senha: senhaHash,
      crn,
      telefone,
      especialidade,
      bio,
      ativo: true,
    });

    logger.info('Nutricionista criado com sucesso', {
      id_usuario,
      nutricionista_id: novoNutricionista.id,
      nome: novoNutricionista.nome,
    });

    return res.status(201).json({
      success: true,
      message: 'Nutricionista criado com sucesso',
      data: novoNutricionista,
    });
  } catch (error) {
    logger.error('Erro ao criar nutricionista', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar nutricionista',
    });
  }
};

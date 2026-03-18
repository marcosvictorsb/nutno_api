import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { comparePassword, hashPassword } from '../../../utils/password';
import Nutricionista from '../models/nutricionista.model';

interface AtualizarSegurancaBody {
  senha_atual: string;
  senha_nova: string;
  senha_confirmacao?: string;
}

export const atualizarSeguranca = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<void>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info(
      'Requisição para atualizar segurança (senha) do nutricionista recebida',
      {
        id_nutricionista,
      }
    );

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou atualizar segurança');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const { senha_atual, senha_nova, senha_confirmacao } =
      req.body as AtualizarSegurancaBody;

    // Validações básicas
    if (!senha_atual || !senha_nova) {
      logger.warn('Campos obrigatórios ausentes na atualização de segurança', {
        id_nutricionista,
        senha_atual: !!senha_atual,
        senha_nova: !!senha_nova,
      });
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias',
      });
    }

    // Validar força da nova senha
    if (senha_nova.length < 8) {
      logger.warn('Nova senha fraca fornecida', {
        id_nutricionista,
        senha_nova_length: senha_nova.length,
      });
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter pelo menos 8 caracteres',
      });
    }

    // Validar se as senhas batem (se confirmação foi fornecida)
    if (senha_confirmacao && senha_nova !== senha_confirmacao) {
      logger.warn('Senha nova e confirmação não batem', {
        id_nutricionista,
      });
      return res.status(400).json({
        success: false,
        message: 'Senha nova e confirmação não conferem',
      });
    }

    logger.info('Buscando nutricionista para atualizar segurança', {
      id_nutricionista,
    });

    const nutricionista = await Nutricionista.findByPk(id_nutricionista);

    if (!nutricionista) {
      logger.warn('Nutricionista não encontrado para atualizar segurança', {
        id_nutricionista,
      });
      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    logger.info('Validando senha atual', {
      id_nutricionista,
    });

    // Validar se a senha atual está correta
    const senhaAtualValida = await comparePassword(
      senha_atual,
      nutricionista.senha
    );

    if (!senhaAtualValida) {
      logger.warn(
        'Senha atual inválida na tentativa de alteração de segurança',
        {
          id_nutricionista,
        }
      );
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta',
      });
    }

    // Verificar se a nova senha é diferente da atual
    const novaSenhaIgualAnterior = await comparePassword(
      senha_nova,
      nutricionista.senha
    );

    if (novaSenhaIgualAnterior) {
      logger.warn('Tentativa de alterar senha com a mesma senha atual', {
        id_nutricionista,
      });
      return res.status(400).json({
        success: false,
        message: 'A nova senha não pode ser igual à senha atual',
      });
    }

    logger.info('Gerando hash da nova senha', {
      id_nutricionista,
    });

    // Gerar hash da nova senha
    const novaSenhaHash = await hashPassword(senha_nova);

    logger.info('Atualizando senha do nutricionista', {
      id_nutricionista,
    });

    // Atualizar senha
    nutricionista.senha = novaSenhaHash;
    nutricionista.updated_at = new Date();
    await nutricionista.save();

    logger.info('Senha do nutricionista atualizada com sucesso', {
      id_nutricionista,
    });

    return res.status(200).json({
      success: true,
      message: 'Senha atualizada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao atualizar segurança (senha) do nutricionista', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar senha',
    });
  }
};

import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../../../config/logger';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import { hashPassword } from '../../../utils/password';

interface RedefinirSenhaRequest {
  nova_senha: string;
}

/**
 * Redefine a senha usando o token de reset
 * Query params: token
 * Body: nova_senha
 */
export const redefinirSenha = async (
  req: Request<{}, {}, RedefinirSenhaRequest>,
  res: Response<ApiResponse<{ sucesso: boolean }>>
) => {
  try {
    const { token } = req.query;
    const { nova_senha } = req.body;
    const requestId = req.headers['x-request-id'];

    logger.info('Requisição para redefinir senha', {
      requestId,
      temToken: !!token,
      temSenha: !!nova_senha,
    });

    // Validar se o token foi fornecido
    if (!token || typeof token !== 'string') {
      logger.warn('Token não fornecido ou inválido', {
        requestId,
      });
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório',
        data: {
          sucesso: false,
        },
      });
    }

    // Validar se a nova senha foi fornecida
    if (!nova_senha || typeof nova_senha !== 'string') {
      logger.warn('Nova senha não fornecida ou inválida', {
        requestId,
      });
      return res.status(400).json({
        success: false,
        message: 'Nova senha é obrigatória',
        data: {
          sucesso: false,
        },
      });
    }

    // Validar comprimento mínimo da senha
    if (nova_senha.length < 6) {
      logger.warn('Senha muito curta', {
        requestId,
        tamanhoSenha: nova_senha.length,
      });
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres',
        data: {
          sucesso: false,
        },
      });
    }

    logger.debug('Validando token de reset', {
      requestId,
      tokenLength: token.length,
    });

    // Fazer hash do token para comparar com o banco
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    logger.debug('Buscando nutricionista com token de reset', {
      requestId,
      tokenHashLength: tokenHash.length,
    });

    // Buscar nutricionista com o token hasheado
    const nutricionista = await Nutricionista.findOne({
      where: {
        reset_password_token: tokenHash,
      },
    });

    // Se não encontrou o nutricionista com este token
    if (!nutricionista) {
      logger.warn('Token de reset não encontrado', {
        requestId,
      });
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou não encontrado',
        data: {
          sucesso: false,
        },
      });
    }

    logger.debug('Nutricionista encontrado, verificando validade do token', {
      requestId,
      nutricionistaId: nutricionista.id,
    });

    // Verificar se o token ainda está dentro da validade
    const agora = new Date();
    const expires = nutricionista.reset_password_expires;

    if (!expires || agora > expires) {
      logger.warn('Token de reset expirado', {
        requestId,
        nutricionistaId: nutricionista.id,
        expiradoEm: expires?.toISOString(),
      });
      return res.status(400).json({
        success: false,
        message: 'Token expirado',
        data: {
          sucesso: false,
        },
      });
    }

    logger.debug('Token válido, fazendo hash da nova senha', {
      requestId,
      nutricionistaId: nutricionista.id,
    });

    // Fazer hash da nova senha
    const senhaHasheada = await hashPassword(nova_senha);

    logger.info('Atualizando senha do nutricionista', {
      requestId,
      nutricionistaId: nutricionista.id,
      email: nutricionista.email,
    });

    // Atualizar senha e limpar token
    await nutricionista.update({
      senha: senhaHasheada,
      reset_password_token: null,
      reset_password_expires: null,
    });

    logger.info('Senha redefinida com sucesso', {
      requestId,
      nutricionistaId: nutricionista.id,
      email: nutricionista.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso',
      data: {
        sucesso: true,
      },
    });
  } catch (error) {
    logger.error('Erro ao redefinir senha', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.headers['x-request-id'],
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha',
      data: {
        sucesso: false,
      },
    });
  }
};

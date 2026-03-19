import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../../../config/logger';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import { query } from 'winston';

/**
 * Verifica se um token de reset de senha é válido
 * Query params: token
 */
export const verificarTokenResetSenha = async (
  req: Request,
  res: Response<ApiResponse<{ valido: boolean }>>
) => {
  try {
    console.log({
      query: req.query,
      params: req.params,
    });

    const { reset_password_token: token } = req.query;
    const requestId = req.headers['x-request-id'];

    logger.info('Requisição para verificar token de reset de senha', {
      requestId,
      temToken: !!token,
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
          valido: false,
        },
      });
    }

    logger.debug('Buscando nutricionista com token de reset', {
      requestId,
      tokenLength: token.length,
    });

    // Fazer hash do token para comparar com o banco
    // (o token armazenado no banco é um hash SHA256)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    logger.debug('Token hasheado para comparação', {
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
      return res.status(200).json({
        success: true,
        message: 'Token inválido ou não encontrado',
        data: {
          valido: false,
        },
      });
    }

    // Verificar se o token ainda está dentro da validade
    const agora = new Date();
    const expires = nutricionista.reset_password_expires;

    logger.debug('Verificando validade do token', {
      requestId,
      agora: agora.toISOString(),
      expira: expires?.toISOString(),
      nutricionistaId: nutricionista.id,
    });

    if (!expires || agora > expires) {
      logger.warn('Token de reset expirado', {
        requestId,
        nutricionistaId: nutricionista.id,
        expiradoEm: expires?.toISOString(),
      });
      return res.status(200).json({
        success: true,
        message: 'Token expirado',
        data: {
          valido: false,
        },
      });
    }

    // Token válido
    logger.info('Token de reset válido', {
      requestId,
      nutricionistaId: nutricionista.id,
      expiraEm: expires.toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        valido: true,
      },
    });
  } catch (error) {
    logger.error('Erro ao verificar token de reset', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.headers['x-request-id'],
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar token',
      data: {
        valido: false,
      },
    });
  }
};

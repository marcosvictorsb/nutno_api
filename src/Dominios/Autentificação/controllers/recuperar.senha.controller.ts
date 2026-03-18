import { Response, Request } from 'express';
import crypto from 'crypto';
import logger from '../../../config/logger';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import { sendEmail } from '../../../services/email.service';
import { ApiResponse } from '../../../types/ApiResponse';

interface RecuperarSenhaRequest {
  email: string;
}

export const recuperarSenha = async (
  req: Request<{}, {}, RecuperarSenhaRequest>,
  res: Response<ApiResponse>
) => {
  try {
    const { email } = req.body;

    logger.info('Tentativa de recuperação de senha', { email });

    // Validar email
    if (!email) {
      logger.warn('Email não fornecido', { email });
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório',
      });
    }

    // Buscar nutricionista pelo email
    const nutricionista = await Nutricionista.findOne({ where: { email } });

    if (!nutricionista) {
      // Não informar se o email existe ou não (segurança)
      logger.warn('Email não encontrado', { email });
      return res.status(200).json({
        success: true,
        message:
          'Se o email existe em nossa base, você receberá um link para recuperar a senha',
      });
    }

    // Gerar token aleatório de reset (24 horas de validade)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Salvar token no banco
    await nutricionista.update({
      reset_password_token: resetTokenHash,
      reset_password_expires: expiresAt,
    });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-senha/${resetToken}`;

    // Enviar email usando template
    try {
      logger.info('Email vai ser enviado');
      if (process.env.NODE_ENV === 'production') {
        await sendEmail(
          email,
          '🔐 Recupere sua Senha - Nutno',
          'recuperar-senha',
          {
            NOME: nutricionista.nome,
            LINK_RESET: resetUrl,
          }
        );
      }

      logger.info('Email de recuperação de senha enviado com sucesso', {
        email,
      });
    } catch (emailError) {
      logger.error('Erro ao enviar email de recuperação', {
        email,
        error: emailError,
      });

      await nutricionista.update({
        reset_password_token: null,
        reset_password_expires: null,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Se o email existe em nossa base, você receberá um link para recuperar a senha',
    });
  } catch (error: Error | any) {
    logger.error('Erro ao recuperar senha', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar recuperação de senha',
      error: error.message,
    });
  }
};

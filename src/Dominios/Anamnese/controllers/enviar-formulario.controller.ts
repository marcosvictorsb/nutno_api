import { Request, Response } from 'express';
import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';

interface EnviarFormularioRequest {
  email: string;
  paciente_id: number;
}

/**
 * Envia um email para o paciente preenchendo a anamnese inicial
 * Verifica se o formulário já foi preenchido
 */
export const enviarFormularioAnamnese = async (
  req: Request<{}, {}, EnviarFormularioRequest>,
  res: Response<ApiResponse<{ enviado: boolean }>>
) => {
  try {
    const { email, paciente_id } = req.body;
    const requestId = req.headers['x-request-id'];

    logger.info('Requisição para enviar formulário de anamnese', {
      requestId,
      email,
    });

    // Validar email e
    if (!email || typeof email !== 'string') {
      logger.warn('Email não fornecido ou inválido', {
        requestId,
      });
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório',
        data: {
          enviado: false,
        },
      });
    }

    logger.debug('Buscando paciente pelo email e token do formulário', {
      requestId,
      email,
    });

    // Buscar paciente pelo email e  para maior segurança
    const paciente = await Paciente.findOne({
      where: {
        email,
        id: paciente_id,
      },
    });

    // Se não encontrou o paciente
    if (!paciente) {
      logger.warn('Paciente não encontrado com email e token do formulário', {
        requestId,
        email,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente ou token de formulário não encontrado',
        data: {
          enviado: false,
        },
      });
    }

    logger.debug('Verificando se formulário já foi preenchido', {
      requestId,
      pacienteId: paciente.id,
      formularioPreenchido: paciente.formulario_preenchido,
    });

    // Verificar se o formulário já foi preenchido
    if (paciente.formulario_preenchido) {
      logger.info('Formulário já foi preenchido', {
        requestId,
        pacienteId: paciente.id,
        email,
      });
      return res.status(200).json({
        success: true,
        message: 'Formulário já foi preenchido',
        data: {
          enviado: false,
        },
      });
    }

    logger.debug('Preparando URL do formulário', {
      requestId,
      pacienteId: paciente.id,
      tokenFormulario: paciente.token_formulario,
    });

    // Construir URL do formulário
    const urlFormulario = `${process.env.APP_URL_FRONTEND || 'http://localhost:5173'}/formulario/${paciente.token_formulario}`;

    logger.info('Enviando email de formulário de anamnese', {
      requestId,
      pacienteId: paciente.id,
      email,
      urlFormulario,
    });

    // Enviar email com template
    try {
      await sendEmail(
        paciente.email || email,
        '📋 Complete sua Anamnese - Nutno',
        'anamnese-formulario',
        {
          NOME: paciente.nome || 'Paciente',
          LINK_FORMULARIO: urlFormulario,
        }
      );

      logger.info('Email de formulário de anamnese enviado com sucesso', {
        requestId,
        pacienteId: paciente.id,
        email,
      });

      return res.status(200).json({
        success: true,
        message: 'Email enviado com sucesso',
        data: {
          enviado: true,
        },
      });
    } catch (emailError) {
      logger.error('Erro ao enviar email de formulário de anamnese', {
        requestId,
        pacienteId: paciente.id,
        email,
        error: emailError,
      });

      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email',
        data: {
          enviado: false,
        },
      });
    }
  } catch (error) {
    logger.error('Erro ao enviar formulário de anamnese', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.headers['x-request-id'],
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
      data: {
        enviado: false,
      },
    });
  }
};

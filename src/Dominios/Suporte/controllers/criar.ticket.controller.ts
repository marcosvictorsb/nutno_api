import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Ticket } from '../models';

interface CriarTicketBody {
  assunto: 'registro' | 'inscricao' | 'bug' | 'duvida' | 'sugestao' | 'outro';
  mensagem: string;
  emailUsuario?: string;
}

export const criarTicket = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Ticket>>
) => {
  try {
    const nutricionistaId = req.user?.id;
    const { assunto, mensagem, emailUsuario } = req.body as CriarTicketBody;

    logger.info('Requisição para criar ticket recebida', {
      nutricionistaId,
      assunto,
    });

    // Validar dados obrigatórios
    if (!assunto || !mensagem) {
      logger.warn('Campos obrigatórios faltando na criação de ticket', {
        assunto,
        mensagem,
      });
      return res.status(400).json({
        success: false,
        message: 'Os campos assunto e mensagem são obrigatórios',
      });
    }

    if (!nutricionistaId) {
      logger.warn('Usuário não autenticado tentou criar ticket');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    // Usar email fornecido ou extrair do token
    const email = emailUsuario || req.user?.email;

    if (!email) {
      logger.warn('Email não disponível para criar ticket', {
        nutricionistaId,
      });
      return res.status(400).json({
        success: false,
        message: 'Email do usuário não disponível',
      });
    }

    // Criar novo ticket
    const novoTicket = await Ticket.create({
      id_nutricionista: nutricionistaId,
      assunto,
      mensagem,
      status: 'aberto',
      email_usuario: email,
    });

    logger.info('Ticket criado com sucesso', {
      ticketId: novoTicket.id,
      nutricionistaId,
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket criado com sucesso',
      data: novoTicket,
    });
  } catch (error) {
    logger.error('Erro ao criar ticket', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return res.status(500).json({
      success: false,
      message: 'Erro ao criar ticket',
    });
  }
};

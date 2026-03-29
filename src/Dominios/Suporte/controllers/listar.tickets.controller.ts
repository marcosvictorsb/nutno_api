import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Ticket } from '../models';

export const listarTickets = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Ticket[]>>
) => {
  try {
    const nutricionistaId = req.user?.id;

    if (!nutricionistaId) {
      logger.warn('Usuário não autenticado tentou listar tickets');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    logger.info('Requisição para listar tickets recebida', {
      nutricionistaId,
    });

    // Buscar todos os tickets do nutricionista
    const tickets = await Ticket.findAll({
      where: {
        id_nutricionista: nutricionistaId,
      },
      order: [['criadoEm', 'DESC']],
    });

    logger.info('Tickets listados com sucesso', {
      id_nutricionista: nutricionistaId,
      quantidade: tickets.length,
    });

    return res.status(200).json({
      success: true,
      message: 'Tickets listados com sucesso',
      data: tickets,
    });
  } catch (error) {
    logger.error('Erro ao listar tickets', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar tickets',
    });
  }
};

import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Ticket } from '../models';

export const obterTicket = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Ticket>>
) => {
  try {
    const nutricionistaId = req.user?.id;
    const { id } = req.params;

    if (!nutricionistaId) {
      logger.warn('Usuário não autenticado tentou obter detalhes do ticket');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    logger.info('Requisição para obter detalhes do ticket recebida', {
      idTicket: id,
      nutricionistaId,
    });

    // Buscar ticket pelo ID
    const ticket = await Ticket.findByPk(id as string);

    if (!ticket) {
      logger.warn('Ticket não encontrado', {
        idTicket: id,
      });
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado',
      });
    }

    // Verificar se o ticket pertence ao usuário autenticado
    if (ticket.id_nutricionista !== nutricionistaId) {
      logger.warn('Tentativa de acessar ticket de outro usuário', {
        idTicket: id,
        nutricionistaId,
        idNutricionistaDono: ticket.id_nutricionista,
      });
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este ticket',
      });
    }

    logger.info('Detalhes do ticket obtidos com sucesso', {
      idTicket: id,
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket obtido com sucesso',
      data: ticket,
    });
  } catch (error) {
    logger.error('Erro ao obter detalhes do ticket', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return res.status(500).json({
      success: false,
      message: 'Erro ao obter detalhes do ticket',
    });
  }
};

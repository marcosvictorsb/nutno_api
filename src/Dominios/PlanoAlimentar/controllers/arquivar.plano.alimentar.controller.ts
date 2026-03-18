import { Request, Response } from 'express';
import logger from '../../../config/logger';
import PlanoAlimentar from '../models/PlanoAlimentar';

export const arquivarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;

    logger.info('Requisição para arquivar plano alimentar recebida', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
    });

    const plano = await PlanoAlimentar.findOne({
      where: {
        id: planoId,
        id_paciente: parseInt(id_paciente as string),
        id_nutricionista,
        deletado_em: null,
      },
    });

    if (!plano) {
      logger.warn('Plano alimentar não encontrado para arquivamento', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    if (plano.status === 'arquivado') {
      logger.warn('Tentativa de arquivar plano que já está arquivado', {
        id_nutricionista,
        id_plano: plano.id,
      });
      return res.status(400).json({ erro: 'Plano já está arquivado' });
    }

    logger.info('Plano alimentar arquivado com sucesso', {
      id_nutricionista,
      id_plano: plano.id,
      nome: plano.nome,
    });

    return res.json({
      mensagem: 'Plano alimentar arquivado com sucesso',
      dados: plano,
    });
  } catch (erro) {
    logger.error('Erro ao arquivar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      id_plano: req.params.planoId,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao arquivar plano alimentar' });
  }
};

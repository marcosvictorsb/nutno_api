import { Request, Response } from 'express';
import logger from '../../../config/logger';
import PlanoAlimentar from '../models/PlanoAlimentar';

export const ativarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;

    logger.info('Requisição para ativar plano alimentar recebida', {
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
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    if (plano.status === 'ativo') {
      return res.status(400).json({ erro: 'Plano já está ativo' });
    }

    // Desativar outros planos ativos do paciente
    // await PlanoAlimentar.update(
    //   { status: 'rascunho' },
    //   {
    //     where: {
    //       id_paciente: parseInt(id_paciente as string),
    //       status: 'ativo',
    //       deletado_em: null,
    //     },
    //   }
    // );

    // Ativar este plano
    await plano.update({ status: 'ativo', enviado_em: new Date() });

    return res.json({
      mensagem: 'Plano alimentar ativado com sucesso',
      dados: plano,
    });
  } catch (erro) {
    logger.error('Erro ao ativar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      id_plano: req.params.planoId,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao ativar plano alimentar' });
  }
};

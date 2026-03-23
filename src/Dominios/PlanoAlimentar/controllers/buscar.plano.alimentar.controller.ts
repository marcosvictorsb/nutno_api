import { Request, Response } from 'express';
import logger from '../../../config/logger';
import Alimento from '../../Alimentos/models/Alimento';
import ItemRefeicao from '../models/ItemRefeicao';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';

export const buscarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;

    logger.info('Requisição para buscar plano alimentar recebida', {
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
      include: [
        {
          model: Refeicao,
          as: 'refeicoes',
          where: { deletado_em: null },
          required: false,
          include: [
            {
              model: ItemRefeicao,
              as: 'itens',
              where: { deletado_em: null },
              required: false,
              include: [
                {
                  model: Alimento,
                  as: 'alimento',
                  attributes: [
                    'id',
                    'nome',
                    'grupo',
                    'fonte',
                    'energia_kcal',
                    'proteina',
                    'carboidrato',
                    'lipidios',
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!plano) {
      logger.info('Plano alimentar não encontrado', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    return res.json({
      dados: plano,
    });
  } catch (erro) {
    logger.error('Erro ao buscar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      id_plano: req.params.planoId,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao buscar plano alimentar' });
  }
};

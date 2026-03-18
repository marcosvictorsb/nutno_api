import { Request, Response } from 'express';
import logger from '../../../config/logger';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';
import ItemRefeicao from '../models/ItemRefeicao';
import Alimento from '../../Alimentos/models/Alimento';

export const visualizarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    logger.info('Requisição para visualizar plano alimentar publicamente', {
      token: token,
    });

    const plano = await PlanoAlimentar.findOne({
      where: {
        token_visualizacao: token,
        deletado_em: null,
      },
      include: [
        {
          model: Refeicao,
          as: 'refeicoes',
          where: { deletado_em: null },
          required: false,
          order: [['ordem', 'ASC']],
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
      logger.warn('Tentativa de acesso a plano não encontrado ou expirado', {
        token: token,
      });
      return res.status(404).json({
        erro: 'Plano não encontrado ou acesso expirado',
      });
    }

    if (plano.status !== 'ativo') {
      logger.warn('Tentativa de acesso a plano que não está ativo', {
        id_plano: plano.id,
        status: plano.status,
      });
      return res.status(403).json({
        erro: 'Este plano não está disponível para visualização',
      });
    }

    // Calcular totais automáticos
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    if (plano.refeicoes && Array.isArray(plano.refeicoes)) {
      for (const refeicao of plano.refeicoes) {
        if (refeicao.itens && Array.isArray(refeicao.itens)) {
          for (const item of refeicao.itens) {
            totalCalorias += item.calorias_calculadas || 0;
            totalProteinas += item.proteinas_calculadas || 0;
            totalCarboidratos += item.carboidratos_calculados || 0;
            totalGorduras += item.gorduras_calculadas || 0;
          }
        }
      }
    }

    logger.info('Plano alimentar acessado publicamente com sucesso', {
      id_plano: plano.id,
      nome: plano.nome,
      totalRefeicoes: plano.refeicoes?.length || 0,
    });

    return res.json({
      dados: {
        ...plano.toJSON(),
        totaisCalculados: {
          calorias: Math.round(totalCalorias * 100) / 100,
          proteinas: Math.round(totalProteinas * 100) / 100,
          carboidratos: Math.round(totalCarboidratos * 100) / 100,
          gorduras: Math.round(totalGorduras * 100) / 100,
        },
      },
    });
  } catch (erro) {
    logger.error('Erro ao visualizar plano alimentar publicamente', {
      token: req.params.token,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao visualizar plano alimentar' });
  }
};

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../../config/logger';
import Alimento from '../../Alimentos/models/Alimento';
import ItemRefeicao from '../models/ItemRefeicao';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';

export const criarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente } = req.params;

    logger.info('Requisição para criar plano alimentar recebida', {
      id_nutricionista,
      id_paciente,
      nome: req.body.nome,
    });
    const {
      nome,
      objetivo,
      observacoes,
      calorias_objetivo,
      proteinas_objetivo_pct,
      carboidratos_objetivo_pct,
      gorduras_objetivo_pct,
      refeicoes,
    } = req.body;

    // Validações básicas
    if (!nome || !objetivo || !calorias_objetivo) {
      logger.warn(
        'Dados obrigatórios ausentes para criação de plano alimentar',
        {
          id_nutricionista,
          id_paciente,
          nome: nome,
          objetivo: objetivo,
          calorias_objetivo: calorias_objetivo,
        }
      );
      return res.status(400).json({
        erro: 'Nome, objetivo e calorias_objetivo são obrigatórios',
      });
    }

    // Verificar se a soma dos percentuais é 100%
    const totalPct =
      proteinas_objetivo_pct +
      carboidratos_objetivo_pct +
      gorduras_objetivo_pct;
    if (Math.abs(totalPct - 100) > 0.1) {
      logger.warn('A soma dos percentuais de macros não é 100%', {
        id_nutricionista,
        id_paciente,
        proteinas_objetivo_pct,
        carboidratos_objetivo_pct,
        gorduras_objetivo_pct,
      });
      return res.status(400).json({
        erro: 'A soma dos percentuais de macros deve ser 100%',
      });
    }

    // Criar plano
    logger.info('Criando plano alimentar');

    const plano = await PlanoAlimentar.create({
      id_paciente: parseInt(id_paciente as string),
      id_nutricionista,
      nome,
      objetivo,
      observacoes,
      calorias_objetivo,
      proteinas_objetivo_pct,
      carboidratos_objetivo_pct,
      gorduras_objetivo_pct,
      status: 'ativo',
      token_visualizacao: uuidv4(),
    });

    logger.info('Plano alimentar criado com ID', {
      id_plano: plano.id,
    });

    // Criar refeições e itens se fornecidos
    if (refeicoes && Array.isArray(refeicoes)) {
      for (const refeicaoData of refeicoes) {
        logger.info('Criando refeição', {
          id_plano: plano.id,
          nome: refeicaoData.nome,
          horario_sugerido: refeicaoData.horario_sugerido,
        });

        const refeicao = await Refeicao.create({
          plano_alimentar_id: plano.id,
          nome: refeicaoData.nome,
          horario_sugerido: refeicaoData.horario_sugerido,
          ordem: refeicaoData.ordem,
          observacoes: refeicaoData.observacoes,
        });

        // Criar itens da refeição
        if (refeicaoData.itens && Array.isArray(refeicaoData.itens)) {
          for (const itemData of refeicaoData.itens) {
            // Buscar alimento para calcular macros
            const alimento = await Alimento.findByPk(itemData.id_alimento);

            const quantidadeEmGramas = itemData.quantidade; // Assume que conversão já foi feita no frontend

            logger.info('Criando item de refeição', {
              id_refeicao: refeicao.id,
              id_alimento: itemData.id_alimento,
              quantidade: itemData.quantidade,
              unidade: itemData.unidade,
            });

            await ItemRefeicao.create({
              refeicao_id: refeicao.id,
              alimento_id: itemData.id_alimento,
              quantidade: itemData.quantidade,
              unidade: itemData.unidade,
              calorias_calculadas: alimento?.energia_kcal
                ? (alimento.energia_kcal * quantidadeEmGramas) / 100
                : null,
              proteinas_calculadas: alimento?.proteina
                ? (alimento.proteina * quantidadeEmGramas) / 100
                : null,
              carboidratos_calculados: alimento?.carboidrato
                ? (alimento.carboidrato * quantidadeEmGramas) / 100
                : null,
              gorduras_calculadas: alimento?.lipidios
                ? (alimento.lipidios * quantidadeEmGramas) / 100
                : null,
              observacoes: itemData.observacoes,
            });
          }
        }
      }
    }

    // Retornar plano criado
    logger.info('Plano alimentar criado com sucesso', {
      id_plano: plano.id,
      id_nutricionista,
    });
    const planoCompleto = await PlanoAlimentar.findByPk(plano.id, {
      include: [
        {
          model: Refeicao,
          as: 'refeicoes',
          include: [
            {
              model: ItemRefeicao,
              as: 'itens',
              include: [
                {
                  model: Alimento,
                  as: 'alimento',
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      mensagem: 'Plano alimentar criado com sucesso',
      dados: planoCompleto,
    });
  } catch (erro) {
    logger.error('Erro ao criar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao criar plano alimentar' });
  }
};

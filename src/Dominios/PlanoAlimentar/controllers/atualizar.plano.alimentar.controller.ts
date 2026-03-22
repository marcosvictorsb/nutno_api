import { Request, Response } from 'express';
import logger from '../../../config/logger';
import Alimento from '../../Alimentos/models/Alimento';
import ItemRefeicao from '../models/ItemRefeicao';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';

export const atualizarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;

    logger.info('Verificando req.body', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      tem_body: !!req.body,
      tipo_body: typeof req.body,
    });

    // Validar se req.body existe
    if (!req.body) {
      logger.error('req.body está undefined ou vazio', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(400).json({
        erro: 'Corpo da requisição está vazio. Certifique-se de enviar um JSON válido.',
      });
    }

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

    logger.info('Requisição para atualizar plano alimentar recebida', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      nome,
      objetivo,
    });

    // Buscar plano
    logger.info('Buscando plano alimentar para atualização', {
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
      logger.info('Plano alimentar não encontrado para atualização', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    // Atualizar dados do plano
    if (nome) plano.nome = nome;
    if (objetivo) plano.objetivo = objetivo;
    if (observacoes !== undefined) plano.observacoes = observacoes;
    if (calorias_objetivo) plano.calorias_objetivo = calorias_objetivo;
    if (proteinas_objetivo_pct)
      plano.proteinas_objetivo_pct = proteinas_objetivo_pct;
    if (carboidratos_objetivo_pct)
      plano.carboidratos_objetivo_pct = carboidratos_objetivo_pct;
    if (gorduras_objetivo_pct)
      plano.gorduras_objetivo_pct = gorduras_objetivo_pct;

    await plano.save();

    // Buscar refeições atuais do plano
    logger.info('Buscando refeições atuais do plano alimentar', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
    });
    const refeicoesCatuais = await Refeicao.findAll({
      where: {
        plano_alimentar_id: plano.id,
        deletado_em: null,
      },
      include: [
        {
          model: ItemRefeicao,
          as: 'itens',
          where: { deletado_em: null },
          required: false,
        },
      ],
    });

    logger.info('Refeições atuais encontradas', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      quantidade_refeicoes_atuais: refeicoesCatuais.length,
    });

    // Processar refeições
    if (refeicoes && Array.isArray(refeicoes)) {
      logger.info('Iniciando processamento de refeições', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
        quantidade_refeicoes_recebidas: refeicoes.length,
      });

      const idsRefeicoesMantidas: number[] = [];

      for (const refeicaoData of refeicoes) {
        if (refeicaoData.id) {
          // Atualizar refeição existente
          logger.info('Atualizando refeição existente', {
            id_nutricionista,
            id_paciente,
            id_plano: planoId,
            id_refeicao: refeicaoData.id,
          });

          const refeicao = refeicoesCatuais.find(
            (r) => r.id === refeicaoData.id
          );

          if (refeicao) {
            if (refeicaoData.nome) refeicao.nome = refeicaoData.nome;
            if (refeicaoData.horario_sugerido)
              refeicao.horario_sugerido = refeicaoData.horario_sugerido;
            if (refeicaoData.ordem) refeicao.ordem = refeicaoData.ordem;
            if (refeicaoData.observacoes !== undefined)
              refeicao.observacoes = refeicaoData.observacoes;
            refeicao.deletado_em = undefined; // Restaurar se estava deletada

            await refeicao.save();
            idsRefeicoesMantidas.push(refeicao.id);

            // Processar itens da refeição
            await processarItensRefeicao(refeicao, refeicaoData.itens || []);
          }
        } else {
          // Criar nova refeição
          logger.info('Criando nova refeição', {
            id_nutricionista,
            id_paciente,
            id_plano: planoId,
            nome: refeicaoData.nome,
          });

          const novaRefeicao = await Refeicao.create({
            plano_alimentar_id: plano.id,
            nome: refeicaoData.nome,
            horario_sugerido: refeicaoData.horario_sugerido,
            ordem: refeicaoData.ordem,
            observacoes: refeicaoData.observacoes,
          });

          idsRefeicoesMantidas.push(novaRefeicao.id);

          // Processar itens da nova refeição
          await processarItensRefeicao(novaRefeicao, refeicaoData.itens || []);
        }
      }

      // Fazer soft delete de refeições que não foram mantidas
      const refeicoesDeletadas = refeicoesCatuais.filter(
        (r) => !idsRefeicoesMantidas.includes(r.id)
      );

      logger.info('Resumo de processamento de refeições', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
        refeicoes_mantidas: idsRefeicoesMantidas.length,
        refeicoes_para_deletar: refeicoesDeletadas.length,
      });

      for (const refeicao of refeicoesDeletadas) {
        logger.info('Deletando refeição', {
          id_nutricionista,
          id_paciente,
          id_plano: planoId,
          id_refeicao: refeicao.id,
        });

        // Fazer soft delete dos itens primeiro
        await ItemRefeicao.update(
          { deletado_em: new Date() },
          {
            where: {
              refeicao_id: refeicao.id,
              deletado_em: null,
            },
          }
        );

        logger.info('Itens da refeição deletados', {
          id_nutricionista,
          id_paciente,
          id_plano: planoId,
          id_refeicao: refeicao.id,
        });

        // Fazer soft delete da refeição
        refeicao.deletado_em = new Date();
        await refeicao.save();

        logger.info('Refeição deletada com sucesso', {
          id_nutricionista,
          id_paciente,
          id_plano: planoId,
          id_refeicao: refeicao.id,
        });
      }
    }

    // Buscar plano atualizado
    logger.info('Buscando plano alimentar atualizado', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
    });

    const planoAtualizado = await PlanoAlimentar.findByPk(plano.id, {
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
                },
              ],
            },
          ],
        },
      ],
    });

    logger.info('Plano alimentar atualizado com sucesso', {
      id_nutriconista: id_nutricionista,
      id_paciente,
      id_plano: planoId,
      quantidade_refeicoes_finais: planoAtualizado?.refeicoes?.length || 0,
    });

    return res.json({
      mensagem: 'Plano alimentar atualizado com sucesso',
      dados: planoAtualizado,
    });
  } catch (erro) {
    logger.error('Erro ao atualizar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      id_plano: req.params.planoId,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao atualizar plano alimentar' });
  }
};

async function processarItensRefeicao(
  refeicao: any,
  itensData: any[]
): Promise<void> {
  // Buscar itens atuais da refeição
  logger.info('Buscando itens atuais da refeição', {
    id_refeicao: refeicao.id,
  });

  const itensAtuais = await ItemRefeicao.findAll({
    where: {
      refeicao_id: refeicao.id,
      deletado_em: null,
    },
  });

  logger.info('Itens atuais da refeição encontrados', {
    id_refeicao: refeicao.id,
    quantidade_itens_atuais: itensAtuais.length,
  });

  const idsItensMantidos: number[] = [];

  // Processar itens recebidos
  logger.info('Iniciando processamento de itens', {
    id_refeicao: refeicao.id,
    quantidade_itens_recebidos: itensData.length,
  });

  for (const itemData of itensData) {
    if (itemData.id) {
      // Atualizar item existente
      logger.info('Atualizando item existente', {
        id_refeicao: refeicao.id,
        id_item: itemData.id,
        id_alimento: itemData.id_alimento,
        quantidade: itemData.quantidade,
        unidade: itemData.unidade,
      });

      const item = itensAtuais.find((i) => i.id === itemData.id);
      if (item) {
        if (itemData.id_alimento) item.alimento_id = itemData.id_alimento;
        if (itemData.quantidade) item.quantidade = itemData.quantidade;
        if (itemData.unidade) item.unidade = itemData.unidade;
        if (itemData.observacoes !== undefined)
          item.observacoes = itemData.observacoes;
        item.deletado_em = undefined; // Restaurar se estava deletado

        await item.save();
        idsItensMantidos.push(item.id);

        logger.info('Item atualizado com sucesso', {
          id_refeicao: refeicao.id,
          id_item: itemData.id,
        });
      } else {
        logger.warn('Item a ser atualizado não encontrado', {
          id_refeicao: refeicao.id,
          id_item: itemData.id,
        });
      }
    } else {
      // Criar novo item
      logger.info('Criando novo item', {
        id_refeicao: refeicao.id,
        id_alimento: itemData.id_alimento,
        quantidade: itemData.quantidade,
        unidade: itemData.unidade,
      });

      const novoItem = await ItemRefeicao.create({
        refeicao_id: refeicao.id,
        alimento_id: itemData.id_alimento,
        quantidade: itemData.quantidade,
        unidade: itemData.unidade,
        observacoes: itemData.observacoes,
      });

      idsItensMantidos.push(novoItem.id);

      logger.info('Novo item criado com sucesso', {
        id_refeicao: refeicao.id,
        id_item: novoItem.id,
      });
    }
  }

  // Fazer soft delete de itens que não foram mantidos
  const itensDeletados = itensAtuais.filter(
    (i) => !idsItensMantidos.includes(i.id)
  );

  logger.info('Resumo de processamento de itens', {
    id_refeicao: refeicao.id,
    itens_mantidos: idsItensMantidos.length,
    itens_para_deletar: itensDeletados.length,
  });

  for (const item of itensDeletados) {
    logger.info('Deletando item', {
      id_refeicao: refeicao.id,
      id_item: item.id,
    });

    item.deletado_em = new Date();
    await item.save();

    logger.info('Item deletado com sucesso', {
      id_refeicao: refeicao.id,
      id_item: item.id,
    });
  }
}

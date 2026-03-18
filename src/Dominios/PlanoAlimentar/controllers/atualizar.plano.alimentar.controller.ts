import { Request, Response } from 'express';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';
import ItemRefeicao from '../models/ItemRefeicao';
import Alimento from '../../Alimentos/models/Alimento';

export const atualizarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;
    const { nome, objetivo, observacoes, calorias_objetivo, refeicoes, itens } =
      req.body;

    // Buscar plano
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

    // Atualizar dados do plano
    if (nome) plano.nome = nome;
    if (objetivo) plano.objetivo = objetivo;
    if (observacoes !== undefined) plano.observacoes = observacoes;
    if (calorias_objetivo) plano.calorias_objetivo = calorias_objetivo;

    await plano.save();

    // Atualizar refeições se fornecidas
    if (refeicoes && Array.isArray(refeicoes)) {
      for (const refeicaoData of refeicoes) {
        if (refeicaoData.id) {
          // Atualizar refeição existente
          const refeicao = await Refeicao.findByPk(refeicaoData.id);
          if (refeicao) {
            if (refeicaoData.nome) refeicao.nome = refeicaoData.nome;
            if (refeicaoData.horario_sugerido)
              refeicao.horario_sugerido = refeicaoData.horario_sugerido;
            if (refeicaoData.ordem) refeicao.ordem = refeicaoData.ordem;
            if (refeicaoData.observacoes !== undefined)
              refeicao.observacoes = refeicaoData.observacoes;
            await refeicao.save();
          }
        }
      }
    }

    // Buscar plano atualizado
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

    return res.json({
      mensagem: 'Plano alimentar atualizado com sucesso',
      dados: planoAtualizado,
    });
  } catch (erro) {
    console.error('Erro ao atualizar plano:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar plano alimentar' });
  }
};

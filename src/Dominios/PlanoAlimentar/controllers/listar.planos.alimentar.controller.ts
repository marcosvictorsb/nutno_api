import { Request, Response } from 'express';
import logger from '../../../config/logger';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';
import ItemRefeicao from '../models/ItemRefeicao';
import Alimento from '../../Alimentos/models/Alimento';

export const listarPlanosAlimentares = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente } = req.params;
    const { status, pagina = 1, limite = 20 } = req.query;

    logger.info('Requisição para listar planos alimentares recebida', {
      id_nutricionista,
      id_paciente,
      query: JSON.stringify({
        status: status || 'todos',
        pagina,
        limite,
      }),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou listar planos alimentares');
      return res.status(401).json({ erro: 'Usuario nao autenticado' });
    }

    const paginaNum = parseInt(pagina as string) || 1;
    const limiteNum = parseInt(limite as string) || 20;
    const offset = (paginaNum - 1) * limiteNum;

    logger.info('Parametros de paginação validados', {
      id_nutricionista,
      pagina: paginaNum,
      limite: limiteNum,
      offset,
    });

    // Montar where clause
    const where: any = {
      id_paciente: parseInt(id_paciente as string),
      id_nutricionista,
      deletado_em: null,
    };

    if (status) {
      where.status = status;
      logger.info('Filtro de status aplicado', {
        id_nutricionista,
        status,
      });
    }

    logger.info('Iniciando busca de planos alimentares no banco', {
      id_nutricionista,
      id_paciente,
      where: JSON.stringify(where),
    });

    // Buscar planos
    const { count, rows } = await PlanoAlimentar.findAndCountAll({
      where,
      offset,
      limit: limiteNum,
      order: [['criado_em', 'DESC']],
      include: [
        {
          model: Refeicao,
          as: 'refeicoes',
          where: { deletado_em: null },
          required: false,
        },
      ],
    });

    const totalPaginas = Math.ceil(count / limiteNum);

    logger.info('Planos alimentares listados com sucesso', {
      id_nutricionista,
      id_paciente,
      total: count,
      resultados: rows.length,
      pagina: paginaNum,
      totalPaginas,
    });

    return res.json({
      dados: rows,
      total: count,
      pagina: paginaNum,
      totalPaginas,
    });
  } catch (erro) {
    logger.error('Erro ao listar planos alimentares', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao listar planos alimentares' });
  }
};

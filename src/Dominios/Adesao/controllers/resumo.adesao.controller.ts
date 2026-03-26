import { Response } from 'express';
import { Op } from 'sequelize';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Refeicao from '../../PlanoAlimentar/models/Refeicao';
import Adesao from '../models/Adesao';

/**
 * Retorna resumo estatístico de adesões de um paciente
 * Rota Autenticada - Apenas o nutricionista pode acessar
 *
 * GET /api/pacientes/:id/adesao/resumo
 * Query params: data_inicio, data_fim, plano_id
 */
export const resumoAdesaoPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    const id_paciente = Number(req.params.id);

    logger.info('Requisição para resumo adesão recebida', {
      id_nutricionista,
      id_paciente,
    });

    // Validar autenticação
    if (!id_nutricionista) {
      logger.warn('Usuário não autenticado tentou acessar resumo de adesões');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    // REGRA 5: Verificar que o paciente pertence ao nutricionista
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente não encontrado ou não pertence ao nutricionista', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(403).json({
        success: false,
        message: 'Paciente não autorizado',
      });
    }

    // Definir período padrão
    const hoje = new Date();
    const dataFim =
      (req.query.data_fim as string) || hoje.toISOString().split('T')[0];

    const data_inicio_default = new Date();
    data_inicio_default.setDate(data_inicio_default.getDate() - 30);
    const dataInicio =
      (req.query.data_inicio as string) ||
      data_inicio_default.toISOString().split('T')[0];

    // Montar o where
    const where: any = {
      paciente_id: id_paciente,
      data: {
        [Op.between]: [dataInicio, dataFim],
      },
    };

    if (req.query.plano_id) {
      where.plano_alimentar_id = Number(req.query.plano_id);
    }

    // 1. Buscar todas as adesões do período
    const adesoes = await Adesao.findAll({
      where,
      include: [
        {
          model: Refeicao,
          as: 'refeicao',
          attributes: ['id', 'nome'],
        },
      ],
    });

    // 2. Calcular estatísticas gerais
    const totalRegistros = adesoes.length;
    const seguiu = adesoes.filter((a) => a.status === 'seguiu').length;
    const parcial = adesoes.filter((a) => a.status === 'parcial').length;
    const pulou = adesoes.filter((a) => a.status === 'pulou').length;
    const percentualAdesao =
      totalRegistros > 0
        ? parseFloat(((seguiu / totalRegistros) * 100).toFixed(1))
        : 0;

    const geral = {
      total_registros: totalRegistros,
      seguiu,
      parcial,
      pulou,
      percentual_adesao: percentualAdesao,
    };

    // 3. Calcular estatísticas por refeição
    const porRefeicaoMap = new Map<number, any>();

    adesoes.forEach((adesao) => {
      const refId = adesao.refeicao_id;
      const refNome = adesao.refeicao?.nome || 'Sem nome';

      if (!porRefeicaoMap.has(refId)) {
        porRefeicaoMap.set(refId, {
          nome_refeicao: refNome,
          total: 0,
          seguiu: 0,
          parcial: 0,
          pulou: 0,
        });
      }

      const stat = porRefeicaoMap.get(refId)!;
      stat.total++;
      if (adesao.status === 'seguiu') stat.seguiu++;
      else if (adesao.status === 'parcial') stat.parcial++;
      else if (adesao.status === 'pulou') stat.pulou++;
    });

    const porRefeicao = Array.from(porRefeicaoMap.values()).map((stat) => ({
      ...stat,
      percentual_adesao:
        stat.total > 0
          ? parseFloat(((stat.seguiu / stat.total) * 100).toFixed(1))
          : 0,
    }));

    // 4. Calcular adesão por dia da semana
    const porDiaSemana = [0, 1, 2, 3, 4, 5, 6].map((dia) => {
      const adesoesDia = adesoes.filter((a) => {
        const d = new Date(a.data + 'T00:00:00');
        return d.getDay() === dia;
      });

      const totalDia = adesoesDia.length;
      const seguiuDia = adesoesDia.filter((a) => a.status === 'seguiu').length;

      return {
        dia_semana: [
          'Domingo',
          'Segunda',
          'Terça',
          'Quarta',
          'Quinta',
          'Sexta',
          'Sábado',
        ][dia],
        total: totalDia,
        percentual_adesao:
          totalDia > 0
            ? parseFloat(((seguiuDia / totalDia) * 100).toFixed(1))
            : 0,
      };
    });

    logger.info('Resumo de adesão calculado com sucesso', {
      id_paciente,
      total_registros: totalRegistros,
      percentual_adesao: percentualAdesao,
    });

    return res.status(200).json({
      success: true,
      data: {
        geral,
        por_refeicao: porRefeicao,
        por_dia_semana: porDiaSemana,
        periodo: {
          data_inicio: dataInicio,
          data_fim: dataFim,
        },
      },
    });
  } catch (error: Error | any) {
    logger.error('Erro ao calcular resumo de adesão', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao calcular resumo de adesão',
      error: error.message,
    });
  }
};

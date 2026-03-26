import { Response } from 'express';
import { Op } from 'sequelize';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Refeicao from '../../PlanoAlimentar/models/Refeicao';
import Adesao from '../models/Adesao';

/**
 * Lista histórico de adesões de um paciente
 * Rota Autenticada - Apenas o nutricionista pode acessar
 *
 * GET /api/pacientes/:id/adesao
 * Query params: data_inicio, data_fim, plano_id
 */
export const listarAdesaoPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const id_nutricionista = req.user?.id;
    const id_paciente = Number(req.params.id);

    logger.info('Requisição para listar adesão paciente recebida', {
      id_nutricionista,
      id_paciente,
      query: JSON.stringify(req.query),
    });

    // Validar autenticação
    if (!id_nutricionista) {
      logger.warn('Usuário não autenticado tentou listar adesões');
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

    // Definir período padrão: 30 dias atrás até hoje
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

    // Se plano_id informado, filtrar
    if (req.query.plano_id) {
      where.plano_alimentar_id = Number(req.query.plano_id);
    }

    logger.info('Buscando adesões com filtros', {
      id_paciente,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });

    // Buscar adesões com includes
    const adesoes = await Adesao.findAll({
      where,
      include: [
        {
          model: Refeicao,
          as: 'refeicao',
          attributes: ['id', 'nome', 'horario_sugerido', 'ordem'],
        },
      ],
      order: [
        ['data', 'DESC'],
        ['refeicao', 'ordem', 'ASC'],
      ],
    });

    // Agrupar por data
    const agrupado = adesoes.reduce((acc: any, adesao: any) => {
      const data = adesao.data;
      const dataIdx = acc.findIndex((d: any) => d.data === data);

      if (dataIdx === -1) {
        acc.push({
          data,
          adesoes: [
            {
              refeicao_id: adesao.refeicao_id,
              refeicao_nome: adesao.refeicao?.nome,
              refeicao_horario: adesao.refeicao?.horario_sugerido,
              status: adesao.status,
              observacao: adesao.observacao,
            },
          ],
        });
      } else {
        acc[dataIdx].adesoes.push({
          refeicao_id: adesao.refeicao_id,
          refeicao_nome: adesao.refeicao?.nome,
          refeicao_horario: adesao.refeicao?.horario_sugerido,
          status: adesao.status,
          observacao: adesao.observacao,
        });
      }

      return acc;
    }, []);

    logger.info('Adesões listadas com sucesso', {
      id_paciente,
      total_registros: adesoes.length,
      dias: agrupado.length,
    });

    return res.status(200).json({
      success: true,
      data: agrupado,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao listar adesões do paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar adesões',
      error: error.message,
    });
  }
};

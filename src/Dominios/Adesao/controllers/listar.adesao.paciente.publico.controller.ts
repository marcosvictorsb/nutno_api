import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import { PlanoAlimentar } from '../../PlanoAlimentar/models';
import ItemRefeicao from '../../PlanoAlimentar/models/ItemRefeicao';
import Refeicao from '../../PlanoAlimentar/models/Refeicao';
import Adesao from '../models/Adesao';

interface RefeicaoFormatada {
  id: number;
  nome: string;
  horario_sugerido: string | null | undefined;
  dia_semana: string;
  preenchida: boolean;
  adesao: {
    status: 'seguiu' | 'parcial' | 'pulou';
    observacao?: string;
  } | null;
}

interface PlanoAlimentarPublico {
  id: number;
  nome: string;
  status: string;
  paciente_nome: string;
  id_paciente: number;
  data_atual: string;
  plano_alimentar_criado_em: string;
  dia_semana: string;
  refeicoes: RefeicaoFormatada[];
}

/**
 * Lista refeições de um plano alimentar acessível por token público
 * Rota Pública - Acesso via token de visualização
 *
 * GET /api/plano-alimentar/:token
 */
export const listarAdesaoPacientePublico = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const token = req.params.token;
    const data = req.query.data as string;

    logger.info('Requisição para listar plano alimentar paciente recebida', {
      token: token,
      data: data,
    });

    const dataAtual = new Date();
    const opcoesDia: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const diaSemanaNome = dataAtual.toLocaleDateString('pt-BR', opcoesDia);
    const dataAtualFormatada = dataAtual.toISOString().split('T')[0];
    const dataFiltro = data || dataAtualFormatada;
    logger.info('Data atual formatada', {
      dataAtualFormatada,
      dataFiltro,
      diaSemanaNome,
    });

    // Buscar plano alimentar pelo token com includes
    logger.info('Buscando plano alimentar pelo token', { token });
    const planoAlimentar = await PlanoAlimentar.findOne({
      where: {
        token_visualizacao: token,
      },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome'],
        },
        {
          model: Refeicao,
          as: 'refeicoes',
          attributes: ['id', 'nome', 'horario_sugerido', 'ordem'],
          order: [['ordem', 'ASC']],
          include: [
            {
              model: ItemRefeicao,
              as: 'itens',
              attributes: ['id'],
            },
            {
              model: Adesao,
              as: 'adesoes',
              attributes: ['status', 'observacao'],
              where: { data: dataFiltro },
              required: false,
            },
          ],
        },
      ],
    });

    if (!planoAlimentar) {
      logger.warn('Plano alimentar não encontrado para o token', { token });
      return res.status(404).json({
        success: false,
        message: 'Plano alimentar não encontrado',
      });
    }

    logger.info('Montando refeições formatadas');

    const refeicoesFormatadas: RefeicaoFormatada[] = (
      planoAlimentar.refeicoes || []
    ).map((refeicao) => {
      // Verificar se refeição está preenchida (tem itens alimentares)
      const preenchida = (refeicao.itens || []).length > 0;

      // Obter informações de adesão (se existir para a data atual)
      const adesaoRegistrada = (refeicao.adesoes || [])[0];

      return {
        id: refeicao.id,
        nome: refeicao.nome,
        horario_sugerido: refeicao.horario_sugerido,
        dia_semana: diaSemanaNome,
        preenchida,
        adesao: adesaoRegistrada
          ? {
              status: adesaoRegistrada.status,
              observacao: adesaoRegistrada.observacao,
            }
          : null,
      };
    });

    // Montar resposta estruturada
    logger.info('Montando resposta estruturada para o plano alimentar');
    const resposta: PlanoAlimentarPublico = {
      id: planoAlimentar.id,
      nome: planoAlimentar.nome,
      status: planoAlimentar.status,
      paciente_nome: (planoAlimentar.paciente as any)?.nome || 'Não informado',
      id_paciente: planoAlimentar.id_paciente,
      plano_alimentar_criado_em: planoAlimentar.criado_em
        .toISOString()
        .split('T')[0],
      data_atual: dataAtualFormatada,
      dia_semana: diaSemanaNome,
      refeicoes: refeicoesFormatadas,
    };

    return res.status(200).json({
      success: true,
      data: resposta,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao listar plano alimentar do paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar plano alimentar',
      error: error.message,
    });
  }
};

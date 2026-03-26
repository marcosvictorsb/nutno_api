import { Request, Response } from 'express';
import logger from '../../../config/logger';
import { ApiResponse } from '../../../types/ApiResponse';
import PlanoAlimentar from '../../PlanoAlimentar/models/PlanoAlimentar';
import Refeicao from '../../PlanoAlimentar/models/Refeicao';
import Adesao from '../models/Adesao';

/**
 * Registra uma adesão do paciente a uma refeição
 * Rota Pública - Acesso via token do plano
 *
 * POST /api/adesao/:token
 */
export const registrarAdesao = async (
  req: Request<
    { token: string },
    {},
    {
      refeicao_id: number;
      status: 'seguiu' | 'parcial' | 'pulou';
      observacao?: string;
      data?: string;
    }
  >,
  res: Response<ApiResponse<Adesao>>
) => {
  try {
    const { token } = req.params;
    const { refeicao_id, status, observacao, data: dataBody } = req.body;

    logger.info('Requisição para registrar adesão recebida', {
      token: token.substring(0, 8) + '...',
      refeicao_id,
      status,
    });

    // 1. Buscar o plano pelo token_visualizacao
    const plano = await PlanoAlimentar.findOne({
      where: { token_visualizacao: token },
    });

    if (!plano) {
      logger.warn('Plano não encontrado para token', {
        token: token.substring(0, 8) + '...',
      });
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado',
      });
    }

    // 2. Verificar se o plano está ativo
    // if (plano.status !== 'ativo' || plano.status !== 'enviado') {
    //   logger.warn('Tentativa de registrar adesão em plano inativo', {
    //     token: token.substring(0, 8) + '...',
    //     status_plano: plano.status,
    //   });
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Plano não está ativo',
    //   });
    // }

    // 3. Verificar se a refeicao_id pertence ao plano encontrado
    const refeicao = await Refeicao.findOne({
      where: {
        id: refeicao_id,
        plano_alimentar_id: plano.id,
      },
    });

    if (!refeicao) {
      logger.warn('Refeição não pertence ao plano', {
        refeicao_id,
        plano_id: plano.id,
      });
      return res.status(400).json({
        success: false,
        message: 'Refeição não pertence a este plano',
      });
    }

    // 4. Definir a data (YYYY-MM-DD)
    let dataRegistro: string;
    if (dataBody) {
      dataRegistro = dataBody;
    } else {
      const hoje = new Date();
      dataRegistro = hoje.toISOString().split('T')[0];
    }

    // REGRA 3: Não aceitar datas futuras
    const dataAtual = new Date().toISOString().split('T')[0];
    if (dataRegistro > dataAtual) {
      logger.warn('Tentativa de registrar adesão com data futura', {
        data_registro: dataRegistro,
        data_atual: dataAtual,
      });
      return res.status(400).json({
        success: false,
        message: 'Não é possível registrar adesão para datas futuras',
      });
    }

    // REGRA 4: Janela de registro retroativo (até 7 dias atrás)
    const dataMinima = new Date();
    dataMinima.setDate(dataMinima.getDate() - 7);
    const dataMinimaStr = dataMinima.toISOString().split('T')[0];

    if (dataRegistro < dataMinimaStr) {
      logger.warn('Tentativa de registrar adesão muito antiga', {
        data_registro: dataRegistro,
        data_minima: dataMinimaStr,
      });
      return res.status(400).json({
        success: false,
        message: 'Registros só são aceitos com até 7 dias de atraso',
      });
    }

    // 5. Usar findOrCreate para criar ou atualizar
    const [adesao, created] = await Adesao.findOrCreate({
      where: {
        refeicao_id,
        data: dataRegistro,
      },
      defaults: {
        plano_alimentar_id: plano.id,
        paciente_id: plano.id_paciente,
        status,
        observacao,
      },
    });

    // 6. Se o registro já existia, atualizar
    if (!created) {
      await adesao.update({
        status,
        observacao,
      });
    }

    logger.info('Adesão registrada com sucesso', {
      adesao_id: adesao.id,
      refeicao_id,
      data: dataRegistro,
      novo_registro: created,
    });

    // 7. Retornar a adesão
    return res.status(201).json({
      success: true,
      message: 'Adesão registrada com sucesso',
      data: adesao,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao registrar adesão', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar adesão',
      error: error.message,
    });
  }
};

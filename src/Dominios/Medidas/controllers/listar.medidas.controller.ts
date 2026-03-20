import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../../Pacientes/model/paciente.model';
import Medidas from '../model/medidas.model';

interface ListarMediasQuery {
  pagina?: string;
  limite?: string;
  ordenarPor?: 'data_asc' | 'data_desc';
}

export const listarMedidas = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Medidas[]>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para listar medidas recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
      query: JSON.stringify(req.query),
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou listar medidas');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido para listar medidas', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    // Verificar se paciente existe e pertence ao nutricionista
    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente nao encontrado ou nao pertence ao nutricionista', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    const {
      pagina = '1',
      limite = '10',
      ordenarPor = 'data_desc',
    } = req.query as ListarMediasQuery;

    const numeroPagina = Math.max(1, Number(pagina) || 1);
    const quantidadePorPagina = Math.min(
      100,
      Math.max(1, Number(limite) || 10)
    );
    const offset = (numeroPagina - 1) * quantidadePorPagina;

    // const order: any[] =
    //   ordenarPor === 'data_asc'
    //     ? [['data_avaliacao', 'ASC']]
    //     : [['data_avaliacao', 'DESC']];

    logger.info('Buscando medidas do paciente', {
      id_nutricionista,
      id_paciente,
      pagina: numeroPagina,
      limite: quantidadePorPagina,
    });

    const { count, rows } = await Medidas.findAndCountAll({
      where: {
        id_paciente,
        id_nutricionista,
      },
      order: [['id', 'DESC']],
      limit: quantidadePorPagina,
      offset,
    });

    logger.info('Medidas listadas com sucesso', {
      id_nutricionista,
      id_paciente,
      total: count,
      retornados: rows.length,
    });

    return res.status(200).json({
      success: true,
      message: 'Medidas listadas com sucesso',
      data: rows,
    });
  } catch (error) {
    logger.error('Erro ao listar medidas', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar medidas',
    });
  }
};

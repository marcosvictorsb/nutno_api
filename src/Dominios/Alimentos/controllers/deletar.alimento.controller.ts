import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Alimento } from '../models';

export const deletarAlimento = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
) => {
  try {
    const nutricionistaId = req.user?.id;
    const alimentoId = parseInt(String(req.params.id), 10);

    logger.info('Requisição para deletar alimento recebida', {
      nutricionistaId,
      alimentoId,
    });

    if (!nutricionistaId) {
      logger.warn('Usuario nao autenticado tentou deletar alimento');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    logger.info('Buscando alimento para deletar', { alimentoId });
    const alimento = await Alimento.findByPk(alimentoId);

    if (!alimento) {
      logger.warn('Alimento nao encontrado', { alimentoId });
      return res.status(404).json({
        success: false,
        message: 'Alimento nao encontrado',
      });
    }

    logger.info('Validando se o alimento pode ser deletado pelo fonte', {
      nome: alimento.nome,
      fonte: alimento.fonte,
    });

    if (alimento.fonte !== 'personalizado') {
      logger.warn('Tentativa de deletar alimento nao personalizado', {
        alimentoId,
        fonte: alimento.fonte,
        nutricionistaId,
      });
      return res.status(403).json({
        success: false,
        message: 'Apenas alimentos personalizados podem ser deletados',
      });
    }

    logger.info('Validando se o alimento pertence ao nutricionista', {
      alimentoId,
      proprietarioId: alimento.id_nutricionista,
      usuarioId: nutricionistaId,
    });

    if (alimento.id_nutricionista !== nutricionistaId) {
      logger.warn('Usuario tentou deletar alimento de outro nutricionista', {
        alimentoId,
        proprietarioId: alimento.id_nutricionista,
        usuarioId: nutricionistaId,
      });
      return res.status(403).json({
        success: false,
        message: 'Voce nao tem permissao para deletar este alimento',
      });
    }

    // TODO: Quando o model ItemRefeicao estiver criado, adicionar validação:
    // Verificar se o alimento está sendo usado em algum ItemRefeicao ativo
    // const itemRefeicaoEmUso = await ItemRefeicao.findOne({
    //   where: {
    //     alimento_id: alimentoId,
    //   },
    //   include: [
    //     {
    //       model: Refeicao,
    //       include: [
    //         {
    //           model: PlanoAlimentar,
    //           where: { status: 'ativo' },
    //         },
    //       ],
    //     },
    //   ],
    // });
    //
    // if (itemRefeicaoEmUso) {
    //   logger.warn('Tentativa de deletar alimento em uso', {
    //     alimentoId,
    //     nutricionistaId,
    //   });
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Este alimento esta sendo usado em um plano ativo. Remova-o do plano antes de deletar.',
    //   });
    // }

    // Deletar alimento
    await alimento.destroy();

    logger.info('Alimento deletado com sucesso', {
      alimentoId,
      nutricionistaId,
    });

    return res.status(204).send();
  } catch (error) {
    logger.error('Erro ao deletar alimento', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao deletar alimento',
    });
  }
};

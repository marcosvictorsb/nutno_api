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
    const id_nutricionista = req.user?.id;
    const id_alimento = parseInt(String(req.params.id), 10);

    logger.info('Requisição para deletar alimento recebida', {
      id_nutricionista,
      id_alimento,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou deletar alimento');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    logger.info('Buscando alimento para deletar', { id_alimento });
    const alimento = await Alimento.findByPk(id_alimento);

    if (!alimento) {
      logger.warn('Alimento nao encontrado', { id_alimento });
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
        id_alimento,
        fonte: alimento.fonte,
        id_nutricionista,
      });
      return res.status(403).json({
        success: false,
        message: 'Apenas alimentos personalizados podem ser deletados',
      });
    }

    logger.info('Validando se o alimento pertence ao nutricionista', {
      id_alimento,
      proprietarioId: alimento.id_nutricionista,
      usuarioId: id_nutricionista,
    });

    if (alimento.id_nutricionista !== id_nutricionista) {
      logger.warn('Usuario tentou deletar alimento de outro nutricionista', {
        id_alimento,
        proprietarioId: alimento.id_nutricionista,
        usuarioId: id_nutricionista,
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
    //     alimento_id: id_alimento,
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
    //     id_alimento,
    //     id_nutricionista,
    //   });
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Este alimento esta sendo usado em um plano ativo. Remova-o do plano antes de deletar.',
    //   });
    // }

    // Deletar alimento
    await alimento.destroy();

    logger.info('Alimento deletado com sucesso', {
      id_alimento,
      id_nutricionista,
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

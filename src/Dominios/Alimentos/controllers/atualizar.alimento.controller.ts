import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Alimento } from '../models';

export const atualizarAlimento = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Alimento>>
) => {
  try {
    const nutricionistaId = req.user?.id;
    const alimentoId = parseInt(String(req.params.id), 10);

    logger.info('Requisição para atualizar alimento recebida', {
      nutricionistaId,
      alimentoId,
      body: req.body,
    });

    if (!nutricionistaId) {
      logger.warn('Usuario nao autenticado tentou atualizar alimento');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    // Buscar alimento
    const alimento = await Alimento.findByPk(alimentoId);

    if (!alimento) {
      logger.warn('Alimento nao encontrado', { alimentoId });
      return res.status(404).json({
        success: false,
        message: 'Alimento nao encontrado',
      });
    }

    // Validar se é personalizado
    if (alimento.fonte !== 'personalizado') {
      logger.warn('Tentativa de editar alimento nao personalizado', {
        alimentoId,
        fonte: alimento.fonte,
        nutricionistaId,
      });
      return res.status(403).json({
        success: false,
        message:
          'Alimentos da tabela oficial nao podem ser editados. Cadastre uma versao personalizada.',
      });
    }

    // Validar se pertence ao nutricionista logado
    if (alimento.id_nutricionista !== nutricionistaId) {
      logger.warn('Usuario tentou editar alimento de outro nutricionista', {
        alimentoId,
        proprietarioId: alimento.id_nutricionista,
        usuarioId: nutricionistaId,
      });
      return res.status(403).json({
        success: false,
        message: 'Voce nao tem permissao para editar este alimento',
      });
    }

    // Atualizar apenas campos enviados (PATCH parcial)
    const camposAtualizaveis = [
      'nome',
      'grupo',
      'energia_kcal',
      'energia_kj',
      'umidade',
      'proteina',
      'lipidios',
      'carboidrato',
      'fibra',
      'cinzas',
      'colesterol',
      'calcio',
      'magnesio',
      'manganes',
      'fosforo',
      'ferro',
      'sodio',
      'potassio',
      'cobre',
      'zinco',
      'selenio',
      'vitamina_c',
      'tiamina',
      'riboflavina',
      'piridoxina',
      'niacina',
      'vitamina_a_re',
      'vitamina_a_rae',
      'vitamina_d',
      'vitamina_e',
      'vitamina_b12',
      'folato',
      'gordura_saturada',
      'gordura_monoinsaturada',
      'gordura_poliinsaturada',
      'gorduras_trans',
      'ativo',
    ];

    const mapeamentoCamelParaSnake: { [key: string]: string } = {
      nome: 'nome',
      grupo: 'grupo',
      energiaKcal: 'energia_kcal',
      energiaKj: 'energia_kj',
      umidade: 'umidade',
      proteina: 'proteina',
      lipidios: 'lipidios',
      carboidrato: 'carboidrato',
      fibra: 'fibra',
      cinzas: 'cinzas',
      colesterol: 'colesterol',
      calcio: 'calcio',
      magnesio: 'magnesio',
      manganes: 'manganes',
      fosforo: 'fosforo',
      ferro: 'ferro',
      sodio: 'sodio',
      potassio: 'potassio',
      cobre: 'cobre',
      zinco: 'zinco',
      selenio: 'selenio',
      vitaminaC: 'vitamina_c',
      tiamina: 'tiamina',
      riboflavina: 'riboflavina',
      piridoxina: 'piridoxina',
      niacina: 'niacina',
      vitaminaARe: 'vitamina_a_re',
      vitaminaArae: 'vitamina_a_rae',
      vitaminaD: 'vitamina_d',
      vitaminaE: 'vitamina_e',
      vitaminaB12: 'vitamina_b12',
      folato: 'folato',
      gorduraSaturada: 'gordura_saturada',
      gorduraMonoinsaturada: 'gordura_monoinsaturada',
      gorduraPoliinsaturada: 'gordura_poliinsaturada',
      gordurasTrans: 'gorduras_trans',
      ativo: 'ativo',
    };

    // Montar objeto de atualização
    const atualizacoes: any = {};

    for (const [key, field] of Object.entries(mapeamentoCamelParaSnake)) {
      if (key in req.body && camposAtualizaveis.includes(field)) {
        const valor = req.body[key];

        // Validações básicas
        if (key === 'nome' && valor) {
          if (String(valor).trim().length < 3 || String(valor).length > 255) {
            logger.warn('Nome invalido para atualizar alimento', { valor });
            return res.status(400).json({
              success: false,
              message: 'Nome deve ter entre 3 e 255 caracteres',
            });
          }
        }

        // Validação de números positivos
        if (
          ['energiaKcal', 'proteina', 'lipidios', 'carboidrato'].includes(
            key
          ) &&
          valor !== null &&
          valor < 0
        ) {
          logger.warn('Valor numerico invalido', { key, valor });
          return res.status(400).json({
            success: false,
            message: `${key} deve ser um numero >= 0`,
          });
        }

        (atualizacoes as any)[field] = valor;
      }
    }

    // Se nenhum campo foi informado para atualizar
    if (Object.keys(atualizacoes).length === 0) {
      logger.warn('Nenhum campo para atualizar', { alimentoId });
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar foi informado',
      });
    }

    // Atualizar alimento
    await alimento.update(atualizacoes);

    logger.info('Alimento atualizado com sucesso', {
      alimentoId,
      nutricionistaId,
      camposAtualizados: Object.keys(atualizacoes),
    });

    return res.status(200).json({
      success: true,
      message: 'Alimento atualizado com sucesso',
      data: alimento,
    });
  } catch (error) {
    logger.error('Erro ao atualizar alimento', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar alimento',
    });
  }
};

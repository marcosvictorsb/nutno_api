import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Alimento } from '../models';

interface CriarAlimentoBody {
  nome: string;
  grupo: string;
  energiaKcal: number;
  energiaKj?: number;
  umidade?: number;
  proteina: number;
  lipidios: number;
  carboidrato: number;
  fibra?: number;
  cinzas?: number;
  colesterol?: number;
  calcio?: number;
  magnesio?: number;
  manganes?: number;
  fosforo?: number;
  ferro?: number;
  sodio?: number;
  potassio?: number;
  cobre?: number;
  zinco?: number;
  selenio?: number;
  vitaminaC?: number;
  tiamina?: number;
  riboflavina?: number;
  piridoxina?: number;
  niacina?: number;
  vitaminaARe?: number;
  vitaminaArae?: number;
  vitaminaD?: number;
  vitaminaE?: number;
  vitaminaB12?: number;
  folato?: number;
  gorduraSaturada?: number;
  gorduraMonoinsaturada?: number;
  gorduraPoliinsaturada?: number;
  gordurasTrans?: number;
}

export const criarAlimento = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Alimento>>
) => {
  try {
    const nutricionistaId = req.user?.id;

    logger.info('Requisição para criar alimento recebida', {
      nutricionistaId,
      body: req.body,
    });

    if (!nutricionistaId) {
      logger.warn('Usuario nao autenticado tentou criar alimento');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const {
      nome,
      grupo,
      energiaKcal,
      energiaKj,
      umidade,
      proteina,
      lipidios,
      carboidrato,
      fibra,
      cinzas,
      colesterol,
      calcio,
      magnesio,
      manganes,
      fosforo,
      ferro,
      sodio,
      potassio,
      cobre,
      zinco,
      selenio,
      vitaminaC,
      tiamina,
      riboflavina,
      piridoxina,
      niacina,
      vitaminaARe,
      vitaminaArae,
      vitaminaD,
      vitaminaE,
      vitaminaB12,
      folato,
      gorduraSaturada,
      gorduraMonoinsaturada,
      gorduraPoliinsaturada,
      gordurasTrans,
    } = req.body as CriarAlimentoBody;

    // Validações
    if (!nome || nome.trim().length < 3 || nome.length > 255) {
      logger.warn('Nome invalido para alimento', { nome });
      return res.status(400).json({
        success: false,
        message: 'Nome do alimento deve ter entre 3 e 255 caracteres',
      });
    }

    if (!grupo || grupo.trim().length === 0) {
      logger.warn('Grupo nao informado para alimento');
      return res.status(400).json({
        success: false,
        message: 'Grupo do alimento e obrigatorio',
      });
    }

    if (energiaKcal === undefined || energiaKcal === null || energiaKcal < 0) {
      logger.warn('Energia em kcal invalida', { energiaKcal });
      return res.status(400).json({
        success: false,
        message: 'Energia em kcal e obrigatoria e deve ser um numero positivo',
      });
    }

    if (proteina === undefined || proteina === null || proteina < 0) {
      logger.warn('Proteina invalida', { proteina });
      return res.status(400).json({
        success: false,
        message: 'Proteina e obrigatoria e deve ser um numero >= 0',
      });
    }

    if (lipidios === undefined || lipidios === null || lipidios < 0) {
      logger.warn('Lipidios invalidos', { lipidios });
      return res.status(400).json({
        success: false,
        message: 'Lipidios e obrigatorio e deve ser um numero >= 0',
      });
    }

    if (carboidrato === undefined || carboidrato === null || carboidrato < 0) {
      logger.warn('Carboidrato invalido', { carboidrato });
      return res.status(400).json({
        success: false,
        message: 'Carboidrato e obrigatorio e deve ser um numero >= 0',
      });
    }

    // Verificar se já existe alimento com mesmo nome para este nutricionista
    const alimentoJaExiste = await Alimento.findOne({
      where: {
        nome: nome.trim(),
        id_nutricionista: nutricionistaId,
        fonte: 'personalizado',
      },
    });

    if (alimentoJaExiste) {
      logger.warn('Alimento com este nome ja existe para este nutricionista', {
        nutricionistaId,
        nome: nome.trim(),
      });
      return res.status(409).json({
        success: false,
        message: 'Ja existe alimento com este nome para este nutricionista',
      });
    }

    // Criar alimento
    const novoAlimento = await Alimento.create({
      id_nutricionista: nutricionistaId,
      nome: nome.trim(),
      grupo: grupo.trim(),
      fonte: 'personalizado',
      ativo: true,
      energia_kcal: energiaKcal,
      energia_kj: energiaKj,
      umidade,
      proteina,
      lipidios,
      carboidrato,
      fibra,
      cinzas,
      colesterol,
      calcio,
      magnesio,
      manganes,
      fosforo,
      ferro,
      sodio,
      potassio,
      cobre,
      zinco,
      selenio,
      vitamina_c: vitaminaC,
      tiamina,
      riboflavina,
      piridoxina,
      niacina,
      vitamina_a_re: vitaminaARe,
      vitamina_a_rae: vitaminaArae,
      vitamina_d: vitaminaD,
      vitamina_e: vitaminaE,
      vitamina_b12: vitaminaB12,
      folato,
      gordura_saturada: gorduraSaturada,
      gordura_monoinsaturada: gorduraMonoinsaturada,
      gordura_poliinsaturada: gorduraPoliinsaturada,
      gorduras_trans: gordurasTrans,
    });

    logger.info('Alimento criado com sucesso', {
      alimentoId: novoAlimento.id,
      nutricionistaId,
    });

    return res.status(201).json({
      success: true,
      message: 'Alimento criado com sucesso',
      data: novoAlimento,
    });
  } catch (error) {
    logger.error('Erro ao criar alimento', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar alimento',
    });
  }
};

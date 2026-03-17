import { Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import { Alimento } from '../models';

export const buscarAlimentos = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para buscar alimentos recebida', {
      id_nutricionista,
      query: req.query,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou buscar alimentos');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    // Extrair query params
    const busca = req.query.busca ? String(req.query.busca).trim() : '';
    const grupo = req.query.grupo ? String(req.query.grupo).trim() : '';
    const fonte = req.query.fonte ? String(req.query.fonte).trim() : '';
    const pagina = Math.max(1, parseInt(String(req.query.pagina || 1), 10));
    const limite = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limite || 20), 10))
    );

    const offset = (pagina - 1) * limite;

    // Validar se ao menos um parâmetro de busca foi informado
    // if (!busca && !grupo) {
    //   logger.warn('Nenhum parametro de busca informado');
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Informe pelo menos "busca" ou "grupo"',
    //   });
    // }

    // Montar cláusula WHERE
    const where: any = {
      ativo: true,
      [Op.or]: [
        { id_nutricionista: null }, // Alimentos TACO/TBCA
        { id_nutricionista: id_nutricionista }, // Alimentos personalizados do nutricionista
      ],
    };

    // Filtro de grupo
    if (grupo) {
      where.grupo = grupo;
    }

    // Filtro de fonte
    if (fonte && ['taco', 'tbca', 'personalizado'].includes(fonte)) {
      where.fonte = fonte;
    }

    // Filtro de busca com FULLTEXT
    let alimentosBuscados;

    if (busca) {
      try {
        // Buscar com LIKE (começa com)
        logger.info('Realizando busca por alimentos', {
          id_nutricionista,
          busca,
          grupo,
          fonte,
        });

        alimentosBuscados = await sequelize.query(
          `
          SELECT * FROM alimentos
          WHERE ativo = TRUE
            AND (id_nutricionista IS NULL OR id_nutricionista = ?)
            ${grupo ? 'AND grupo = ?' : ''}
            ${fonte ? 'AND fonte = ?' : ''}
            AND nome LIKE ?
          ORDER BY 
            CASE WHEN fonte IN ('taco', 'tbca') THEN 0 ELSE 1 END,
            nome ASC
          LIMIT ? OFFSET ?
          `,
          {
            replacements: [
              id_nutricionista,
              ...(grupo ? [grupo] : []),
              ...(fonte ? [fonte] : []),
              `${busca}%`,
              limite,
              offset,
            ],
            type: QueryTypes.SELECT,
          }
        );

        logger.info('Busca retornou resultados', {
          id_nutricionista,
          busca,
          grupo,
          fonte,
          resultados: alimentosBuscados.length,
        });
      } catch (error) {
        logger.warn('Erro ao fazer busca, usando ORM', { error });
        // Fallback para ORM
        alimentosBuscados = await Alimento.findAll({
          where: {
            ...where,
            nome: { [Op.like]: `${busca}%` },
          },
          order: [
            [
              sequelize.literal(
                `CASE WHEN fonte IN ('taco', 'tbca') THEN 0 ELSE 1 END`
              ),
              'ASC',
            ],
            ['nome', 'ASC'],
          ],
          limit: limite,
          offset: offset,
        });
      }
    } else {
      alimentosBuscados = await Alimento.findAll({
        where,
        order: [
          [
            sequelize.literal(
              `CASE WHEN fonte IN ('taco', 'tbca') THEN 0 ELSE 1 END`
            ),
            'ASC',
          ],
          ['nome', 'ASC'],
        ],
        limit: limite,
        offset: offset,
      });
    }

    // Buscar total de registros
    const total = await Alimento.count({
      where: {
        ...where,
        ...(busca && { nome: { [Op.like]: `${busca}%` } }),
      },
    });

    const totalPaginas = Math.ceil(total / limite);

    // Formatar resultado (converter snake_case para camelCase)
    const dados = alimentosBuscados.map((alimento: any) => ({
      id: alimento.id,
      nome: alimento.nome,
      nomeCientifico: alimento.nome_cientifico,
      grupo: alimento.grupo,
      fonte: alimento.fonte,
      ativo: alimento.ativo,
      energiaKcal: alimento.energia_kcal,
      energiaKj: alimento.energia_kj,
      umidade: alimento.umidade,
      proteina: alimento.proteina,
      lipidios: alimento.lipidios,
      carboidrato: alimento.carboidrato,
      fibra: alimento.fibra,
      cinzas: alimento.cinzas,
      colesterol: alimento.colesterol,
      calcio: alimento.calcio,
      magnesio: alimento.magnesio,
      manganes: alimento.manganes,
      fosforo: alimento.fosforo,
      ferro: alimento.ferro,
      sodio: alimento.sodio,
      potassio: alimento.potassio,
      cobre: alimento.cobre,
      zinco: alimento.zinco,
      selenio: alimento.selenio,
      vitaminaC: alimento.vitamina_c,
      tiamina: alimento.tiamina,
      riboflavina: alimento.riboflavina,
      piridoxina: alimento.piridoxina,
      niacina: alimento.niacina,
      vitaminaARe: alimento.vitamina_a_re,
      vitaminaArae: alimento.vitamina_a_rae,
      vitaminaD: alimento.vitamina_d,
      vitaminaE: alimento.vitamina_e,
      vitaminaB12: alimento.vitamina_b12,
      folato: alimento.folato,
      gorduraSaturada: alimento.gordura_saturada,
      gorduraMonoinsaturada: alimento.gordura_monoinsaturada,
      gorduraPoliinsaturada: alimento.gordura_poliinsaturada,
      gordurasTrans: alimento.gorduras_trans,
    }));

    logger.info('Alimentos encontrados com sucesso', {
      total,
      pagina,
      limite,
      totalPaginas,
    });

    return res.status(200).json({
      success: true,
      message: 'Alimentos encontrados com sucesso',
      data: {
        dados,
        total,
        pagina,
        totalPaginas,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar alimentos', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar alimentos',
    });
  }
};

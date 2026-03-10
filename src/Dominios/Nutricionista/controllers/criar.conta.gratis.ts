import { Response, Request } from 'express';
import Nutricionista from '../model/nutricionista.model';
import logger from '../../../config/logger';

export const criarContaGratis = async (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;
    logger.info({ email }, 'Criando conta grátis');

    const nutricionista = await Nutricionista.findOne({ where: { email } });

    if (nutricionista) {
      logger.warn({ email }, 'Email já em uso');
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso',
      });
    }

    await Nutricionista.create({ email, senha, nome });
    logger.info({ email }, 'Conta grátis criada com sucesso');

    return res.status(201).json({
      success: true,
      message: 'Conta grátis criada com sucesso',
      data: {
        email,
      },
    });
  } catch (error: Error | any) {
    logger.error({ error }, 'Erro ao criar conta grátis');
    return res.status(500).json({
      success: false,
      message: 'Falha ao criar conta grátis',
      error: error.message,
    });
  }
};

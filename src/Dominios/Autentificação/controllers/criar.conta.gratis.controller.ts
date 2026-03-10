import { Response, Request } from 'express';
import logger from '../../../config/logger';
import Nutricionista from '../../Nutricionista/model/nutricionista.model';
import { hashPassword } from '../../../utils/password';

export const criarContaGratis = async (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;
    logger.info({ email }, 'Criando conta grátis');

    if (!email || !senha || !nome) {
      logger.warn({ email }, 'Dados incompletos para criação de conta');
      return res.status(400).json({
        success: false,
        message: 'Email, senha e nome são obrigatórios',
      });
    }

    const nutricionista = await Nutricionista.findOne({ where: { email } });

    if (nutricionista) {
      logger.warn({ email }, 'Email já em uso');
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso',
      });
    }

    // Criptografar senha
    const senhaHash = await hashPassword(senha);

    await Nutricionista.create({ email, senha: senhaHash, nome });
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

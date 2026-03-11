import { Response, Request } from 'express';
import logger from '../../../config/logger';
import Nutricionista from '../../Nutricionista/model/nutricionista.model';
import Plano from '../../Planos/model/plano.model';
import Inscricao from '../../Inscricoes/model/inscricao.model';
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

    const nutricionistaCriado = await Nutricionista.create({
      email,
      senha: senhaHash,
      nome,
    });
    logger.info(
      { email, id: nutricionistaCriado.id },
      'Nutricionista criado com sucesso'
    );

    // Buscar plano gratuito
    logger.info({ email }, 'Buscando plano gratuito');
    const planoGratuito = await Plano.findOne({ where: { gratuito: true } });

    if (!planoGratuito) {
      logger.error({ email }, 'Plano gratuito não encontrado');
      return res.status(500).json({
        success: false,
        message: 'Erro ao configurar inscrição. Plano gratuito não encontrado',
      });
    }

    // Calcular data de vencimento (30 dias)
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    // Criar inscrição
    logger.info(
      {
        email,
        id_nutricionista: nutricionistaCriado.id,
        id_plano: planoGratuito.id,
      },
      'Criando inscrição do nutricionista'
    );
    await Inscricao.create({
      id_nutricionista: nutricionistaCriado.id,
      id_plano: planoGratuito.id,
      data_inicio: new Date(),
      data_vencimento: dataVencimento,
      ativo: true,
    });

    logger.info({ email }, 'Inscrição criada com sucesso');

    return res.status(201).json({
      success: true,
      message: 'Conta grátis criada com sucesso',
      data: {
        email,
        plano: planoGratuito.nome_plano,
        data_vencimento: dataVencimento,
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

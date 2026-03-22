import { Request, Response } from 'express';
import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import PlanoAlimentar from '../models/PlanoAlimentar';

export const enviarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;
    const { canal, email, whatsapp } = req.body;

    logger.info('Requisição para enviar plano alimentar recebida', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      canal,
    });

    // if (!canal || !['email', 'whatsapp'].includes(canal)) {
    //   logger.warn('Canal inválido para envio de plano', {
    //     id_nutricionista,
    //     canal,
    //   });
    //   return res
    //     .status(400)
    //     .json({ erro: 'Canal deve ser "email" ou "whatsapp"' });
    // }

    logger.info('Dados de contato para envio de plano', {
      id_nutricionista,
      email,
    });
    const plano = await PlanoAlimentar.findOne({
      where: {
        id: planoId,
        id_paciente: parseInt(id_paciente as string),
        id_nutricionista,
        deletado_em: null,
      },
    });

    if (!plano) {
      logger.warn('Plano alimentar não encontrado para envio', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    const urlPlano = `${process.env.FRONTEND_URL}/planos/visualizar/${plano.token_visualizacao}`;

    // Enviar por email
    logger.info('Enviando plano alimentar por email', {
      id_nutricionista,
      email,
    });
    await sendEmail(
      email,
      `Seu Plano Alimentar - ${plano.nome}`,
      'plano-alimentar',
      {
        URL_PLANO: urlPlano,
        NOME_PLANO: plano.nome,
      }
    );

    await plano.update({ enviado_em: new Date() });

    logger.info('Plano alimentar enviado com sucesso', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
    });

    return res.json({
      mensagem: `Plano alimentar enviado por ${canal} com sucesso`,
      dados: plano,
    });
  } catch (erro) {
    logger.error('Erro ao enviar plano alimentar', {
      id_nutricionista: (req as any).user?.id,
      id_paciente: req.params.id_paciente,
      id_plano: req.params.planoId,
      erro,
    });
    return res.status(500).json({ erro: 'Erro ao enviar plano alimentar' });
  }
};

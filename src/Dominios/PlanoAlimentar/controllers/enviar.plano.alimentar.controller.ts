import { Request, Response } from 'express';
import logger from '../../../config/logger';
import PlanoAlimentar from '../models/PlanoAlimentar';
import { sendEmail } from '../../../services/email.service';

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

    if (!canal || !['email', 'whatsapp'].includes(canal)) {
      logger.warn('Canal inválido para envio de plano', {
        id_nutricionista,
        canal,
      });
      return res
        .status(400)
        .json({ erro: 'Canal deve ser "email" ou "whatsapp"' });
    }

    const plano = await PlanoAlimentar.findOne({
      where: {
        id: planoId,
        id_paciente: parseInt(id_paciente as string),
        id_nutricionista,
        deletado_em: null,
      },
    });

    if (!plano) {
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    const urlPlano = `${process.env.FRONTEND_URL}/planos/visualizar/${plano.token_visualizacao}`;

    // Enviar por email
    await sendEmail(
      email,
      `Seu Plano Alimentar - ${plano.nome}`,
      'plano-alimentar',
      {
        URL_PLANO: urlPlano,
        NOME_PLANO: plano.nome,
      }
    );

    plano.enviado_em = new Date();
    await plano.save();

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

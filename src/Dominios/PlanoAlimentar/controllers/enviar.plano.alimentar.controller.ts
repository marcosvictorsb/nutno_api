import { Request, Response } from 'express';
import logger from '../../../config/logger';
import { sendEmail } from '../../../services/email.service';
import {
  gerarHtmlPlanoAlimentar,
  gerarPdfPlanoAlimentar,
} from '../../../services/pdf.service';
import Alimento from '../../Alimentos/models/Alimento';
import Nutricionista from '../../Nutricionista/models/nutricionista.model';
import Paciente from '../../Pacientes/model/paciente.model';
import ItemRefeicao from '../models/ItemRefeicao';
import PlanoAlimentar from '../models/PlanoAlimentar';
import Refeicao from '../models/Refeicao';

export const enviarPlanoAlimentar = async (req: Request, res: Response) => {
  try {
    const id_nutricionista = (req as any).user.id;
    const { id_paciente, planoId } = req.params;
    const { email, mensagem } = req.body;

    logger.info('Requisição para enviar plano alimentar recebida', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      email,
    });

    if (!email) {
      logger.warn('Email não fornecido para envio de plano', {
        id_nutricionista,
        id_plano: planoId,
      });
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    logger.info('Buscando plano alimentar com todos os dados', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
    });

    // Buscar plano com includes completos
    const plano = await PlanoAlimentar.findOne({
      where: {
        id: planoId,
        id_paciente: parseInt(id_paciente as string),
        id_nutricionista,
        deletado_em: null,
      },
      include: [
        {
          model: Refeicao,
          as: 'refeicoes',
          where: { deletado_em: null },
          required: false,
          include: [
            {
              model: ItemRefeicao,
              as: 'itens',
              where: { deletado_em: null },
              required: false,
              include: [
                {
                  model: Alimento,
                  as: 'alimento',
                  attributes: [
                    'id',
                    'nome',
                    'grupo',
                    'fonte',
                    'energia_kcal',
                    'proteina',
                    'carboidrato',
                    'lipidios',
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!plano) {
      logger.warn('Plano alimentar não encontrado para envio', {
        id_nutricionista,
        id_paciente,
        id_plano: planoId,
      });
      return res.status(404).json({ erro: 'Plano alimentar não encontrado' });
    }

    logger.info('Plano alimentar encontrado', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      refeicoes: plano.refeicoes?.length || 0,
    });

    // Buscar dados do nutricionista e paciente
    logger.info('Buscando dados do nutricionista e paciente', {
      id_nutricionista,
      id_paciente,
    });

    const nutricionista = await Nutricionista.findByPk(id_nutricionista, {
      attributes: ['id', 'nome', 'email'],
    });

    const paciente = await Paciente.findByPk(parseInt(id_paciente as string), {
      attributes: ['id', 'nome', 'email'],
    });

    logger.info('Dados do nutricionista e paciente obtidos', {
      nutricionista: nutricionista?.nome,
      paciente: paciente?.nome,
    });

    // Gerar HTML do plano
    logger.info('Gerando HTML do plano alimentar', {
      id_plano: planoId,
    });

    const html = gerarHtmlPlanoAlimentar({
      plano: plano.toJSON(),
      nutricionista: nutricionista?.toJSON(),
      paciente: paciente?.toJSON(),
    });

    // Gerar PDF
    logger.info('Gerando PDF do plano alimentar', {
      id_plano: planoId,
    });

    const pdfBuffer = await gerarPdfPlanoAlimentar(html);

    logger.info('PDF gerado com sucesso', {
      id_plano: planoId,
      tamanho: pdfBuffer.length,
    });

    // Enviar por email
    logger.info('Enviando plano alimentar por email', {
      id_nutricionista,
      email,
      id_plano: planoId,
    });

    // Calcular macronutrientes em gramas
    const caloriesTotal = parseFloat(
      plano.calorias_objetivo as unknown as string
    );
    const proteinaPercent = parseFloat(
      plano.proteinas_objetivo_pct as unknown as string
    );
    const carboidratoPercent = parseFloat(
      plano.carboidratos_objetivo_pct as unknown as string
    );
    const gorduraPercent = parseFloat(
      plano.gorduras_objetivo_pct as unknown as string
    );

    const proteinaGramas = Math.round(
      (caloriesTotal * proteinaPercent) / 100 / 4
    );
    const carboidratoGramas = Math.round(
      (caloriesTotal * carboidratoPercent) / 100 / 4
    );
    const gorduraGramas = Math.round(
      (caloriesTotal * gorduraPercent) / 100 / 9
    );

    logger.info('Macronutrientes calculados', {
      id_plano: planoId,
      calorias: caloriesTotal,
      proteina_gramas: proteinaGramas,
      carboidrato_gramas: carboidratoGramas,
      gordura_gramas: gorduraGramas,
    });

    // Construir URL pública do plano baseado no APP_URL do .env
    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const planoLink = `${baseUrl}/paciente/plano/${plano.token_visualizacao}`;

    logger.info('Link público do plano gerado', {
      id_plano: planoId,
      plano_link: planoLink,
      app_url: baseUrl,
    });

    // Enviar email com PDF anexado
    await sendEmail(
      email,
      `Seu Plano Alimentar - ${plano.nome}`,
      'plano-alimentar',
      {
        NOME_PLANO: plano.nome,
        PACIENTE_NOME: paciente?.nome || 'Paciente',
        NUTRICIONISTA_NOME: nutricionista?.nome || 'Nutricionista',
        CALORIAS_META: Math.round(caloriesTotal),
        PROTEINAS_GRAMAS: proteinaGramas,
        CARBOIDRATOS_GRAMAS: carboidratoGramas,
        GORDURAS_GRAMAS: gorduraGramas,
        PROTEINAS_PCT: Math.round(proteinaPercent),
        CARBOIDRATOS_PCT: Math.round(carboidratoPercent),
        GORDURAS_PCT: Math.round(gorduraPercent),
        MENSAGEM_NUTRICIONISTA: mensagem || '',
        PLANO_LINK: planoLink,
      },
      [
        {
          filename: `plano-alimentar-${planoId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    );

    // Atualizar status do plano
    await plano.update({ enviado_em: new Date(), status: 'enviado' });

    logger.info('Plano alimentar enviado por email com sucesso', {
      id_nutricionista,
      id_paciente,
      id_plano: planoId,
      email,
    });

    return res.json({
      mensagem: 'Plano alimentar enviado por email com sucesso',
      dados: {
        id: plano.id,
        nome: plano.nome,
        email_enviado_para: email,
        status: 'enviado',
        enviado_em: new Date(),
      },
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

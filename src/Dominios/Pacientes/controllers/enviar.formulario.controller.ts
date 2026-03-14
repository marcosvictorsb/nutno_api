import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';
import {
  criarMensagemWhatsApp,
  enviarFormularioPorEmail,
  gerarLinkWhatsApp,
} from '../services/formulario.publico.service';

interface EnviarFormularioBody {
  canal: 'email' | 'whatsapp';
}

interface EnviarFormularioResponse {
  canal: 'email' | 'whatsapp';
  link_formulario: string;
  link_whatsapp?: string;
}

export const enviarFormularioPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<EnviarFormularioResponse>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para enviar formulario para paciente recebida', {
      id_nutricionista,
      params: JSON.stringify(req.params),
      body: req.body,
    });

    if (!id_nutricionista) {
      logger.warn(
        'Usuario nao autenticado tentou enviar formulario para paciente'
      );
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const id_paciente = Number(req.params.id);

    if (!Number.isInteger(id_paciente) || id_paciente <= 0) {
      logger.warn('ID de paciente invalido fornecido para enviar formulario', {
        id_nutricionista,
        id_paciente,
      });
      return res.status(400).json({
        success: false,
        message: 'ID de paciente invalido',
      });
    }

    const { canal } = req.body as EnviarFormularioBody;

    if (canal !== 'email' && canal !== 'whatsapp') {
      logger.warn('Canal invalido fornecido para enviar formulario', {
        id_nutricionista,
        id_paciente,
        canal,
      });

      return res.status(400).json({
        success: false,
        message: 'Canal invalido. Use email ou whatsapp',
      });
    }

    const paciente = await Paciente.findOne({
      where: {
        id: id_paciente,
        id_nutricionista,
      },
    });

    if (!paciente) {
      logger.warn('Paciente nao encontrado para enviar formulario', {
        id_nutricionista,
        id_paciente,
      });

      return res.status(404).json({
        success: false,
        message: 'Paciente nao encontrado',
      });
    }

    const baseFormulario = `${process.env.APP_URL}/formulario`;
    const link_formulario = `${baseFormulario}/${paciente.token_formulario}`;

    if (!paciente.email) {
      logger.warn(
        'Paciente nao possui email cadastrado para enviar formulario',
        {
          id_nutricionista,
          id_paciente,
        }
      );
      return res.status(400).json({
        success: false,
        message: 'Paciente nao possui email cadastrado',
      });
    }

    await enviarFormularioPorEmail({
      email: paciente.email,
      nomePaciente: paciente.nome,
      nomeNutricionista: req.user?.nome || 'Nutricionista',
      linkFormulario: link_formulario,
    });

    logger.info('Formulario enviado para paciente', {
      id_nutricionista,
      id_paciente,
      canal,
    });

    return res.status(200).json({
      success: true,
      message: 'Formulario enviado por email com sucesso',
      data: {
        canal,
        link_formulario,
      },
    });

    // if (!paciente.whatsapp) {
    //   logger.info(
    //     'Paciente nao possui whatsapp cadastrado para enviar formulario',
    //     {
    //       id_nutricionista,
    //       id_paciente,
    //     }
    //   );

    //   return res.status(400).json({
    //     success: false,
    //     message: 'Paciente nao possui whatsapp cadastrado',
    //   });
    // }

    // const mensagem = criarMensagemWhatsApp(
    //   paciente.nome,
    //   req.user?.nome || 'Nutricionista',
    //   link_formulario
    // );
    // const link_whatsapp = gerarLinkWhatsApp(paciente.whatsapp, mensagem);

    // logger.info('Link de whatsapp gerado para envio de formulario', {
    //   id_nutricionista,
    //   id_paciente,
    //   canal,
    // });

    // return res.status(200).json({
    //   success: true,
    //   message: 'Link de whatsapp gerado com sucesso',
    //   data: {
    //     canal,
    //     link_formulario,
    //     link_whatsapp,
    //   },
    // });
  } catch (error: Error | any) {
    logger.error('Erro ao enviar formulario para paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao enviar formulario para paciente',
      error: error.message,
    });
  }
};

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';

interface CriarPacienteBody {
  nome: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F' | 'Outro';
  como_prefere_ser_chamado?: string;
  foto_perfil?: string;
  status?: 'ativo' | 'inativo' | 'arquivado';
}

export const criarPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Paciente>>
) => {
  try {
    const id_nutricionista = req.user?.id;

    logger.info('Requisição para criar paciente recebida', {
      id_nutricionista,
      body: req.body,
    });

    if (!id_nutricionista) {
      logger.warn('Usuario nao autenticado tentou criar paciente');
      return res.status(401).json({
        success: false,
        message: 'Usuario nao autenticado',
      });
    }

    const {
      nome,
      email,
      telefone,
      whatsapp,
      data_nascimento,
      sexo,
      como_prefere_ser_chamado,
      foto_perfil,
      status,
    } = req.body as CriarPacienteBody;

    if (!nome || nome.trim().length === 0) {
      logger.warn('Nome do paciente nao informado');
      return res.status(400).json({
        success: false,
        message: 'Nome do paciente e obrigatorio',
      });
    }

    const emailNormalizado = email?.trim().toLowerCase();

    if (emailNormalizado) {
      logger.info('Verificando se ja existe paciente com este email', {
        id_nutricionista,
        email: emailNormalizado,
      });
      const pacienteComMesmoEmail = await Paciente.findOne({
        where: {
          id_nutricionista,
          email: emailNormalizado,
        },
      });

      if (pacienteComMesmoEmail) {
        logger.warn(
          'Ja existe paciente com este email para este nutricionista',
          {
            id_nutricionista,
            email: emailNormalizado,
          }
        );
        return res.status(409).json({
          success: false,
          message: 'Ja existe paciente com este email para este nutricionista',
        });
      }
    }

    const novoPaciente = await Paciente.create({
      id_nutricionista,
      nome: nome.trim(),
      email: emailNormalizado,
      telefone: telefone?.trim(),
      whatsapp: whatsapp?.trim(),
      data_nascimento,
      sexo,
      como_prefere_ser_chamado: como_prefere_ser_chamado?.trim(),
      foto_perfil: foto_perfil?.trim(),
      status: status || 'ativo',
      token_formulario: uuidv4(),
      formulario_preenchido: false,
      formulario_preenchido_em: null,
    });

    logger.info('Paciente criado com sucesso', {
      id_nutricionista,
      id_paciente: novoPaciente.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: novoPaciente,
    });
  } catch (error: Error | any) {
    logger.error('Erro ao criar paciente', { error });
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar paciente',
      error: error.message,
    });
  }
};

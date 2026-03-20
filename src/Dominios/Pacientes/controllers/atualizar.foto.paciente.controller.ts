import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Paciente from '../model/paciente.model';

export const atualizarFotoPaciente = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    const { pacienteId } = req.params;

    logger.info('Iniciando atualização de foto do paciente', {
      requestId: req.headers['x-request-id'],
      userId: req.user?.id,
      pacienteId,
    });

    // Validar se o usuário está autenticado
    if (!req.user?.id) {
      logger.warn('Tentativa de atualizar foto sem autenticação', {
        requestId: req.headers['x-request-id'],
      });
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    // Validar se o arquivo foi enviado
    if (!req.file) {
      logger.warn('Tentativa de atualizar foto sem enviar arquivo', {
        requestId: req.headers['x-request-id'],
        userId: req.user.id,
        pacienteId,
      });
      return res.status(400).json({
        success: false,
        message: 'Nenhuma foto foi enviada',
      });
    }

    logger.debug('Arquivo recebido com sucesso', {
      userId: req.user.id,
      pacienteId,
      nomeArquivo: req.file.filename,
      tamanhoArquivo: req.file.size,
      mimetype: req.file.mimetype,
      caminhoTemporario: req.file.path,
    });

    // Buscar paciente no banco de dados
    logger.debug('Buscando paciente no banco de dados', {
      pacienteId,
    });
    const paciente = await Paciente.findByPk(Number(pacienteId));

    if (!paciente) {
      logger.warn('Paciente não encontrado', {
        pacienteId,
        requestId: req.headers['x-request-id'],
      });
      // Deletar arquivo enviado se paciente não existir
      fs.unlink(req.file.path, (err) => {
        if (err) logger.warn('Erro ao deletar arquivo temporário:', err);
      });

      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado',
      });
    }

    logger.debug('Paciente encontrado', {
      pacienteId,
      nome: paciente.nome,
    });

    // Validar se o paciente pertence ao nutricionista autenticado
    if (paciente.id_nutricionista !== req.user.id) {
      logger.warn(
        'Tentativa de atualizar foto de paciente de outro nutricionista',
        {
          pacienteId,
          userId: req.user.id,
          pacienteNutricionistaId: paciente.id_nutricionista,
          requestId: req.headers['x-request-id'],
        }
      );
      // Deletar arquivo enviado
      fs.unlink(req.file.path, (err) => {
        if (err) logger.warn('Erro ao deletar arquivo:', err);
      });

      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar a foto deste paciente',
      });
    }

    // Armazenar o caminho da foto anterior (para deletar depois)
    const fotoAnteriorCaminho = paciente.foto_perfil;

    // Salvar o caminho relativo da foto NOVA (para armazenar no banco)
    const caminhoRelativo = `uploads/pacientes/perfil/${req.file.filename}`;

    logger.debug('Atualizando registro no banco de dados com a nova foto', {
      pacienteId,
      novoCaminho: caminhoRelativo,
      fotoAnterior: fotoAnteriorCaminho,
    });

    // PRIMEIRO: Atualizar paciente com o novo caminho da foto no banco
    await paciente.update({
      foto_perfil: caminhoRelativo,
    });

    logger.info('Nova foto salva no banco de dados com sucesso', {
      pacienteId,
      userId: req.user.id,
      arquivo: req.file.filename,
      caminhoFinal: caminhoRelativo,
      tamanho: req.file.size,
      requestId: req.headers['x-request-id'],
    });

    // DEPOIS: Deletar a foto anterior (se existia)
    if (fotoAnteriorCaminho) {
      logger.debug('Deletando foto anterior', {
        pacienteId,
        caminhoAnterior: fotoAnteriorCaminho,
      });
      const caminhoAnterior = path.join(
        process.cwd(),
        'src',
        fotoAnteriorCaminho
      );

      logger.debug('Caminho absoluto para deletar', {
        caminhoAnterior,
        existe: fs.existsSync(caminhoAnterior),
      });

      fs.unlink(caminhoAnterior, (err) => {
        if (err) {
          logger.warn('Erro ao deletar foto anterior', {
            erro: err.message,
            caminho: caminhoAnterior,
            pacienteId,
          });
        } else {
          logger.debug('Foto anterior deletada com sucesso', {
            pacienteId,
            caminhoAnterior,
          });
        }
      });
    } else {
      logger.debug('Nenhuma foto anterior encontrada', {
        pacienteId,
      });
    }

    logger.info('Foto do paciente atualizada com sucesso', {
      pacienteId,
      userId: req.user.id,
      arquivo: req.file.filename,
      caminhoFinal: caminhoRelativo,
      fotoAnteriorDeletada: !!fotoAnteriorCaminho,
      tamanho: req.file.size,
      requestId: req.headers['x-request-id'],
      originalFilename: req.file.originalname,
    });

    return res.status(200).json({
      success: true,
      message: 'Foto atualizada com sucesso',
      data: {
        id: paciente.id,
        foto_perfil: paciente.foto_perfil,
        fotoAnterior: fotoAnteriorCaminho || null,
      },
    });
  } catch (error) {
    // Deletar arquivo se houve erro
    if (req.file) {
      logger.debug('Deletando arquivo após erro', {
        arquivo: req.file.filename,
        userId: req.user?.id,
      });
      fs.unlink(req.file.path, (err) => {
        if (err) {
          logger.warn('Erro ao deletar arquivo após erro', {
            erro: err.message,
            arquivo: req.file?.filename,
            userId: req.user?.id,
          });
        } else {
          logger.debug('Arquivo deletado com sucesso após erro', {
            arquivo: req.file?.filename,
          });
        }
      });
    }

    logger.error('Erro ao atualizar foto do paciente', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.headers['x-request-id'],
      userId: req.user?.id,
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
    });
  }
};

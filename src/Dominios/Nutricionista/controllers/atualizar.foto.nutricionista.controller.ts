import { Response } from 'express';
import logger from '../../../config/logger';
import { AuthenticatedRequest } from '../../../middlewares/auth';
import { ApiResponse } from '../../../types/ApiResponse';
import Nutricionista from '../models/nutricionista.model';
import fs from 'fs';
import path from 'path';

export const atualizarFotoNutricionista = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
) => {
  try {
    logger.info('Iniciando atualização de foto do nutricionista', {
      requestId: req.headers['x-request-id'],
      userId: req.user?.id,
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
      });
      return res.status(400).json({
        success: false,
        message: 'Nenhuma foto foi enviada',
      });
    }

    logger.debug('Arquivo recebido com sucesso', {
      userId: req.user.id,
      nomeArquivo: req.file.filename,
      tamanhoArquivo: req.file.size,
      mimetype: req.file.mimetype,
      caminhoTemporario: req.file.path,
    });

    // Buscar nutricionista no banco de dados
    logger.debug('Buscando nutricionista no banco de dados', {
      userId: req.user.id,
    });
    const nutricionista = await Nutricionista.findByPk(req.user.id);

    if (!nutricionista) {
      logger.warn('Nutricionista não encontrado', {
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });
      // Deletar arquivo enviado se nutricionista não existir
      fs.unlink(req.file.path, (err) => {
        if (err) logger.warn('Erro ao deletar arquivo temporário:', err);
      });

      return res.status(404).json({
        success: false,
        message: 'Nutricionista não encontrado',
      });
    }

    logger.debug('Nutricionista encontrado', {
      userId: req.user.id,
      nome: nutricionista.nome,
    });

    // Armazenar o caminho da foto anterior (para deletar depois)
    const fotoAnteriorCaminho = nutricionista.caminho_foto;

    // Salvar o caminho relativo da foto NOVA (para armazenar no banco)
    const caminhoRelativo = `uploads/${req.file.filename}`;

    logger.debug('Atualizando registro no banco de dados com a nova foto', {
      userId: req.user.id,
      novoCaminho: caminhoRelativo,
      fotoAnterior: fotoAnteriorCaminho,
    });

    // PRIMEIRO: Atualizar nutricionista com o novo caminho da foto no banco
    await nutricionista.update({
      caminho_foto: caminhoRelativo,
    });

    logger.info('Nova foto salva no banco de dados com sucesso', {
      nutricionistaId: req.user.id,
      arquivo: req.file.filename,
      caminhoFinal: caminhoRelativo,
      tamanho: req.file.size,
      requestId: req.headers['x-request-id'],
    });

    // DEPOIS: Deletar a foto anterior (se existia)
    if (fotoAnteriorCaminho) {
      logger.debug('Deletando foto anterior', {
        userId: req.user.id,
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
            userId: req.user?.id,
          });
        } else {
          logger.debug('Foto anterior deletada com sucesso', {
            userId: req.user?.id,
            caminhoAnterior,
          });
        }
      });
    } else {
      logger.debug('Nenhuma foto anterior encontrada', {
        userId: req.user.id,
      });
    }

    logger.info('Foto do nutricionista atualizada com sucesso', {
      nutricionistaId: req.user.id,
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
        id: nutricionista.id,
        caminho_foto: nutricionista.caminho_foto,
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

    logger.error('Erro ao atualizar foto do nutricionista', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.headers['x-request-id'],
    });
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar foto do nutricionista',
    });
  }
};

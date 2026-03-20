import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

// Configurar o caminho base de uploads
const uploadBaseDir = path.join(__dirname, '../uploads');

// Criar a pasta base de uploads se não existir
if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
}

// Crear pasta de perfil nutricionista
const perfilDir = path.join(uploadBaseDir, 'perfil');
if (!fs.existsSync(perfilDir)) {
  fs.mkdirSync(perfilDir, { recursive: true });
}

// Criar pasta de perfil de pacientes
const perfilPacientesDir = path.join(uploadBaseDir, 'pacientes', 'perfil');
if (!fs.existsSync(perfilPacientesDir)) {
  fs.mkdirSync(perfilPacientesDir, { recursive: true });
}

// Configurar armazenamento para fotos de perfil
const storagePerfil = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, perfilDir);
  },
  filename: (_req, file, cb) => {
    // Gerar nome único para o arquivo usando UUID
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${ext}`);
  },
});

// Configurar armazenamento para fotos de perfil de pacientes
const storagePerfilPacientes = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, perfilPacientesDir);
  },
  filename: (_req, file, cb) => {
    // Gerar nome único para o arquivo usando UUID
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${ext}`);
  },
});

// Validar tipos de arquivo permitidos
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  logger.info('Validando tipo de arquivo para upload', {
    mimetype: file.mimetype,
  });

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Apenas arquivos de imagem (JPEG, PNG, GIF, WebP) são permitidos'
      )
    );
  }
};

// Configurar multer com limite de 5MB para fotos de perfil
export const uploadFoto = multer({
  storage: storagePerfil,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Configurar multer com limite de 5MB para fotos de perfil de pacientes
export const uploadFotoPaciente = multer({
  storage: storagePerfilPacientes,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware para tratamento de erros de upload
export const handleUploadError = (err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      logger.warn('Arquivo excedeu o tamanho máximo de 5MB');
      return res.status(400).json({
        success: false,
        message: 'Arquivo excedeu o tamanho máximo de 5MB',
      });
    }
    logger.error('Erro de upload:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Erro ao fazer upload do arquivo',
    });
  } else if (err) {
    logger.error('Erro ao fazer upload:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

import { Response, Request } from 'express';
import logger from '../../../config/logger';
import Nutricionista from '../../Nutricionista/model/nutricionista.model';
import { comparePassword } from '../../../utils/password';
import { generateToken } from '../../../utils/jwt';
import { ApiResponse } from '../../../types/ApiResponse';

interface LoginRequest {
  email: string;
  senha: string;
}

interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  token: string;
}

export const fazerLogin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<ApiResponse<LoginResponse>>
) => {
  try {
    const { email, senha } = req.body;

    logger.info({ email }, 'Tentativa de login');

    // Validar campos obrigatórios
    if (!email || !senha) {
      logger.warn({ email }, 'Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar nutricionista pelo email
    const nutricionista = await Nutricionista.findOne({ where: { email } });

    if (!nutricionista) {
      logger.warn({ email }, 'Nutricionista não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Comparar senhas
    const senhaValida = await comparePassword(senha, nutricionista.senha);

    if (!senhaValida) {
      logger.warn({ email }, 'Senha incorreta');
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Gerar token JWT válido por 48 horas
    const token = generateToken({
      id: nutricionista.id,
      email: nutricionista.email,
      nome: nutricionista.nome,
    });

    logger.info({ email }, 'Login realizado com sucesso');

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        id: nutricionista.id,
        nome: nutricionista.nome,
        email: nutricionista.email,
        token,
      },
    });
  } catch (error: Error | any) {
    logger.error({ error }, 'Erro ao fazer login');
    return res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    });
  }
};

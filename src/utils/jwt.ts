import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  email: string;
  nome: string;
}

/**
 * Gera um JWT token válido por 48 horas
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, {
    expiresIn: '48h',
  });
  return token;
}

/**
 * Verifica e decodifica um JWT token
 */
export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET as string;
  const decoded = jwt.verify(token, secret) as TokenPayload;
  return decoded;
}

/**
 * Decodifica um token sem verificar a assinatura (apenas leitura)
 */
export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token) as TokenPayload | null;
  return decoded;
}

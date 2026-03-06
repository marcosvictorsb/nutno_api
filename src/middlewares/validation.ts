import { Request, Response, NextFunction } from 'express';

export interface CustomRequest extends Request {
  validationErrors?: string[];
}

export const validateLeadInput = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
): void => {
  const { name, email } = req.body;
  const errors: string[] = [];

  // Validar que ao menos um campo está preenchido
  if (!name && !email) {
    errors.push('At least one of name or email must be provided');
  }

  // Validar name se fornecido
  if (name && typeof name !== 'string') {
    errors.push('name must be a string');
  }

  if (name && name.trim().length === 0) {
    errors.push('name cannot be empty');
  }

  // Validar email se fornecido
  if (email && typeof email !== 'string') {
    errors.push('email must be a string');
  }

  if (email && !email.includes('@')) {
    errors.push('email must be a valid email address');
  }

  if (errors.length > 0) {
    req.validationErrors = errors;
  }

  next();
};

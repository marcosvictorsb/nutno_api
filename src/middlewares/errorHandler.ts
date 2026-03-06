import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './validation';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request | CustomRequest,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  } else {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

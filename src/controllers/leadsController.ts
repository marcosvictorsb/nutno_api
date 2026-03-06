import { Response } from 'express';
import Lead from '../models/Lead';
import { CustomRequest } from '../middlewares/validation';

export const createLead = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.validationErrors && req.validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        errors: req.validationErrors,
      });
      return;
    }

    const { name, email } = req.body;

    const lead = await Lead.create({
      name: name || null,
      email: email || null,
    });
    console.log('Lead created:', {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      createdAt: lead.createdAt,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        res.status(409).json({
          success: false,
          error: 'Email already exists',
        });
      } else {
        console.error('Error creating lead:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create lead',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

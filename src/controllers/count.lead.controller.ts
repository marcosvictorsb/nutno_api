import { Response } from 'express';
import Lead from '../models/Lead';
import { CustomRequest } from '../middlewares/validation';

export const countLeads = async (
  _req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const leadCount = await Lead.count();

    res.status(200).json({
      success: true,
      data: {
        count: leadCount,
      },
    });
  } catch (error) {
    console.error('Error counting leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count leads',
    });
  }
};

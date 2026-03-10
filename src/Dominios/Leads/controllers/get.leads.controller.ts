import { Response } from 'express';
import { CustomRequest } from '../../../middlewares/validation';
import Lead from '../models/Lead';
import { Op } from 'sequelize';

export const getLeads = async (
  request: CustomRequest,
  response: Response
): Promise<void> => {
  try {
    console.log(request.body);

    const leads = await Lead.findAll({
      attributes: ['id', 'name', 'email', 'createdAt'],
      where: {
        email: {
          [Op.ne]: 'marcosvictorsb@gmail.com',
        },
      },
      order: [['createdAt', 'DESC']],
      subQuery: false,
    });

    const result = leads
      .map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        created_at: lead.createdAt,
      }))
      .filter((lead) => lead.email !== 'marcosvictorsb@gmail.com');

    const unique = result.reduce(
      (acc: typeof result, item) => {
        if (!acc.some((t) => t.email === item.email)) {
          acc.push(item);
        }
        return acc;
      },
      [] as typeof result
    );

    response.status(200).json({
      success: true,
      data: unique,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to fetch leads',
    });
  }
};

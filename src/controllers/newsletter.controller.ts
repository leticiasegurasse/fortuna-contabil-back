import { Request, Response } from 'express';
import { Newsletter } from '../config/db';
import asyncMiddleware from '../middlewares/asyncMiddleware';

// Inscrição na newsletter
export const subscribe = asyncMiddleware(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }

  // Verificar se o email já existe
  const existingSubscriber = await Newsletter.findOne({
    where: { email: email.toLowerCase() }
  });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está inscrito na newsletter'
      });
    } else {
      // Reativar inscrição cancelada
      await existingSubscriber.update({
        isActive: true,
        unsubscribedAt: undefined
      });

      return res.json({
        success: true,
        message: 'Inscrição reativada com sucesso!',
        data: {
          id: existingSubscriber.id,
          email: existingSubscriber.email,
          subscribedAt: existingSubscriber.subscribedAt
        }
      });
    }
  }

  // Criar nova inscrição
  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'Inscrito na newsletter com sucesso!',
    data: {
      id: subscriber.id,
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt
    }
  });
});

// Cancelar inscrição na newsletter
export const unsubscribe = asyncMiddleware(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }

  const subscriber = await Newsletter.findOne({
    where: { email: email.toLowerCase() }
  });

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Email não encontrado na newsletter'
    });
  }

  if (!subscriber.isActive) {
    return res.status(409).json({
      success: false,
      message: 'Este email já foi cancelado'
    });
  }

  await subscriber.update({
    isActive: false,
    unsubscribedAt: new Date()
  });

  res.json({
    success: true,
    message: 'Inscrição cancelada com sucesso'
  });
});

// Listar todos os inscritos (para admin)
export const getAllSubscribers = asyncMiddleware(async (req: Request, res: Response) => {
  const { page = 1, limit = 50, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};
  if (status === 'active') {
    whereClause.isActive = true;
  } else if (status === 'inactive') {
    whereClause.isActive = false;
  }

  const { count, rows } = await Newsletter.findAndCountAll({
    where: whereClause,
    order: [['subscribedAt', 'DESC']],
    limit: Number(limit),
    offset: offset
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      subscribers: rows,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: count,
        itemsPerPage: Number(limit)
      }
    }
  });
});

// Verificar status de inscrição
export const checkSubscription = asyncMiddleware(async (req: Request, res: Response) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }

  const subscriber = await Newsletter.findOne({
    where: { email: email.toLowerCase() }
  });

  if (!subscriber) {
    return res.json({
      success: true,
      data: {
        isSubscribed: false,
        message: 'Email não inscrito'
      }
    });
  }

  res.json({
    success: true,
    data: {
      isSubscribed: subscriber.isActive,
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt
    }
  });
});

// Estatísticas da newsletter (para admin)
export const getNewsletterStats = asyncMiddleware(async (req: Request, res: Response) => {
  const totalSubscribers = await Newsletter.count();
  const activeSubscribers = await Newsletter.count({ where: { isActive: true } });
  const inactiveSubscribers = await Newsletter.count({ where: { isActive: false } });

  // Inscrições dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
        const { Op } = require('sequelize');
      const recentSubscriptions = await Newsletter.count({
        where: {
          subscribedAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

  res.json({
    success: true,
    data: {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers,
      recentSubscriptions,
      lastUpdated: new Date()
    }
  });
});

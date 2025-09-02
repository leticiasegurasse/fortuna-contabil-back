import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  checkSubscription,
  getNewsletterStats
} from '../controllers/newsletter.controller';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/check/:email', checkSubscription);

// Rotas protegidas (apenas para admin)
router.get('/subscribers', authenticateToken, getAllSubscribers);
router.get('/stats', authenticateToken, getNewsletterStats);

export default router;

import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryPosts
} from '../controllers/category.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = Router();

// Rotas públicas
router.get('/', asyncMiddleware(getAllCategories));
router.get('/:id', asyncMiddleware(getCategoryById));
router.get('/:id/posts', asyncMiddleware(getCategoryPosts));

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateToken, asyncMiddleware(createCategory));
router.put('/:id', authenticateToken, asyncMiddleware(updateCategory));
router.delete('/:id', authenticateToken, asyncMiddleware(deleteCategory));

export default router;

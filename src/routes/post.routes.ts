import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus
} from '../controllers/post.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = Router();

// Rotas públicas
router.get('/', asyncMiddleware(getAllPosts));
router.get('/slug/:slug', asyncMiddleware(getPostBySlug));
router.get('/:id', asyncMiddleware(getPostById));

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateToken, asyncMiddleware(createPost));
router.put('/:id', authenticateToken, asyncMiddleware(updatePost));
router.delete('/:id', authenticateToken, asyncMiddleware(deletePost));
router.put('/:id/status', authenticateToken, asyncMiddleware(updatePostStatus));

export default router;

import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getPostsByTag,
  incrementViews
} from '../controllers/post.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = Router();

// Rotas públicas
router.get('/', asyncMiddleware(getAllPosts));
router.get('/tag/:tagId', asyncMiddleware(getPostsByTag));
router.get('/slug/:slug', asyncMiddleware(getPostBySlug));
router.get('/:id', asyncMiddleware(getPostById));
router.patch('/:id/views', asyncMiddleware(incrementViews));

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateToken, asyncMiddleware(createPost));
router.put('/:id', authenticateToken, asyncMiddleware(updatePost));
router.delete('/:id', authenticateToken, asyncMiddleware(deletePost));
router.put('/:id/status', authenticateToken, asyncMiddleware(updatePostStatus));

export default router;

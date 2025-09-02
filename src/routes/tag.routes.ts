import { Router } from 'express';
import {
  getAllTags,
  getPopularTags,
  getTagById,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  getTagPosts,
  associateTagToPost,
  removeTagFromPost
} from '../controllers/tag.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = Router();

// Rotas públicas
router.get('/', asyncMiddleware(getAllTags));
router.get('/popular', asyncMiddleware(getPopularTags));
router.get('/:id', asyncMiddleware(getTagById));
router.get('/slug/:slug', asyncMiddleware(getTagBySlug));
router.get('/:id/posts', asyncMiddleware(getTagPosts));

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateToken, asyncMiddleware(createTag));
router.put('/:id', authenticateToken, asyncMiddleware(updateTag));
router.delete('/:id', authenticateToken, asyncMiddleware(deleteTag));
router.post('/:id/posts/:postId', authenticateToken, asyncMiddleware(associateTagToPost));
router.delete('/:id/posts/:postId', authenticateToken, asyncMiddleware(removeTagFromPost));

export default router;

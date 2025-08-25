import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rota pública para registro
router.post('/register', register);

// Rota pública para login
router.post('/login', login);

// Rota protegida para obter perfil do usuário
router.get('/profile', authenticateToken, getProfile);

export default router;

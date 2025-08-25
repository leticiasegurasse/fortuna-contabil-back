import { Router, Request, Response } from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshToken,
    verifyToken,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validateRegister, validateLogin } from '../middlewares/validationMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const authRoutes = Router();

// Rotas públicas com validação
authRoutes.post('/register', validateRegister, asyncMiddleware(registerUser));
authRoutes.post('/login', validateLogin, asyncMiddleware(loginUser));
authRoutes.post('/logout', asyncMiddleware(logoutUser));
authRoutes.post('/refresh', asyncMiddleware(refreshToken));
authRoutes.post('/forgot-password', asyncMiddleware(forgotPassword));
authRoutes.post('/reset-password', asyncMiddleware(resetPassword));

// Rotas protegidas (requerem autenticação)
authRoutes.get('/verify-token', authenticateToken, asyncMiddleware(verifyToken));
authRoutes.get('/profile', authenticateToken, asyncMiddleware(getProfile));
authRoutes.put('/profile', authenticateToken, asyncMiddleware(updateProfile));
authRoutes.post('/change-password', authenticateToken, asyncMiddleware(changePassword));

export default authRoutes;

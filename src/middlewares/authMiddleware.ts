import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para estender o Request com dados do usuário
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                username: string;
            };
        }
    }
}

interface JwtPayload {
    userId: number;
    username: string;
    iat: number;
    exp: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ 
            success: false,
            message: 'Token de acesso não fornecido' 
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        // Adicionar dados do usuário à requisição
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };
        
        next();
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(403).json({ 
            success: false,
            message: 'Token inválido ou expirado' 
        });
    }
};

// Middleware opcional - não bloqueia se não houver token
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            req.user = {
                userId: decoded.userId,
                username: decoded.username
            };
        } catch (error) {
            // Token inválido, mas não bloqueia a requisição
            console.warn('Token inválido fornecido:', error);
        }
    }
    
    next();
};

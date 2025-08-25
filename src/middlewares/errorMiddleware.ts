import { Request, Response, NextFunction } from 'express';

// Interface para erros customizados
interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

// Middleware de tratamento de erros
export const errorHandler = (
    error: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Erro capturado:', error);

    // Se já foi enviada uma resposta, não enviar novamente
    if (res.headersSent) {
        return next(error);
    }

    // Status code padrão
    const statusCode = error.statusCode || 500;
    
    // Mensagem de erro
    const message = error.message || 'Erro interno do servidor';

    // Em desenvolvimento, incluir stack trace
    const errorResponse: any = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros de rotas não encontradas
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`
    });
};

// Função para criar erros customizados
export const createError = (message: string, statusCode: number = 500): CustomError => {
    const error = new Error(message) as CustomError;
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};

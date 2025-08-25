import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import UserFactory from '../models/user.model';
import sequelize from '../config/db';

const User = UserFactory(sequelize);

// Interface para dados de registro
interface RegisterData {
    username: string;
    password: string;
    email?: string;
}

// Interface para dados de login
interface LoginData {
    username: string;
    password: string;
}

// Interface para dados de usuário
interface UserData {
    username?: string;
    email?: string;
}

// Registrar novo usuário
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, password, email }: RegisterData = req.body;

        // Verificar se usuário já existe
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    ...(email ? [{ email }] : [])
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Usuário ou email já existe'
            });
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Criar usuário
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email
        });

        // Gerar token JWT
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso!',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                },
                token
            }
        });
    } catch (error: any) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Fazer login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { username, password }: LoginData = req.body;

        // Buscar usuário
        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (error: any) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Fazer logout
export const logoutUser = async (req: Request, res: Response) => {
    try {
        // Em uma implementação mais robusta, você poderia invalidar o token
        // Por enquanto, apenas retornamos sucesso
        res.json({
            success: true,
            message: 'Logout realizado com sucesso!'
        });
    } catch (error: any) {
        console.error('Erro ao fazer logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Renovar token
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token é obrigatório'
            });
        }

        // Verificar refresh token (implementação simplificada)
        // Em produção, você deve ter uma tabela de refresh tokens
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key') as any;

        // Buscar usuário
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Gerar novo token
        const newToken = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Token renovado com sucesso!',
            data: {
                token: newToken,
                refreshToken: refreshToken // Mesmo refresh token
            }
        });
    } catch (error: any) {
        console.error('Erro ao renovar token:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: error.message
        });
    }
};

// Verificar token
export const verifyToken = async (req: Request, res: Response) => {
    try {
        // O middleware de autenticação já verificou o token
        // Se chegou aqui, o token é válido
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                userId: req.user?.userId,
                username: req.user?.username
            }
        });
    } catch (error: any) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Esqueci a senha
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email é obrigatório'
            });
        }

        // Buscar usuário por email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Gerar token de redefinição
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Em produção, você enviaria um email com o token
        // Por enquanto, apenas retornamos o token
        res.json({
            success: true,
            message: 'Email de redefinição enviado com sucesso!',
            data: {
                resetToken // Em produção, não retornar o token
            }
        });
    } catch (error: any) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Redefinir senha
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token e nova senha são obrigatórios'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

        // Buscar usuário
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Hash da nova senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Atualizar senha
        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: 'Senha redefinida com sucesso!'
        });
    } catch (error: any) {
        console.error('Erro ao redefinir senha:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado',
            error: error.message
        });
    }
};

// Obter perfil do usuário
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Perfil obtido com sucesso!',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error: any) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Atualizar perfil
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const userData: UserData = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se email já existe (se estiver sendo alterado)
        if (userData.email && userData.email !== user.email) {
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
        }

        // Atualizar dados
        await user.update(userData);

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso!',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Alterar senha
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Atualizar senha
        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: 'Senha alterada com sucesso!'
        });
    } catch (error: any) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

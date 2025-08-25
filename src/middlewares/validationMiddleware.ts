import { Request, Response, NextFunction } from 'express';

// Validação para registro de usuário
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email } = req.body;

    // Validar username
    if (!username || username.length < 3 || username.length > 50) {
        res.status(400).json({
            success: false,
            message: 'Username deve ter entre 3 e 50 caracteres'
        });
        return;
    }

    // Validar password
    if (!password || password.length < 6) {
        res.status(400).json({
            success: false,
            message: 'Senha deve ter pelo menos 6 caracteres'
        });
        return;
    }

    // Validar email (opcional, mas se fornecido deve ser válido)
    if (email && !isValidEmail(email)) {
        res.status(400).json({
            success: false,
            message: 'Email inválido'
        });
        return;
    }

    next();
};

// Validação para login
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({
            success: false,
            message: 'Username e password são obrigatórios'
        });
        return;
    }

    next();
};

// Validação para criação de pesquisa
export const validatePesquisa = (req: Request, res: Response, next: NextFunction) => {
    const { 
        nome, 
        whatsapp, 
        cpf, 
        provedor_atual, 
        satisfacao, 
        bairro, 
        valor_mensal, 
        uso_internet, 
        interesse_proposta, 
        responsavel 
    } = req.body;

    // Validar nome
    if (!nome || nome.length < 2 || nome.length > 100) {
        res.status(400).json({
            success: false,
            message: 'Nome deve ter entre 2 e 100 caracteres'
        });
        return;
    }

    // Validar WhatsApp
    if (!whatsapp || !isValidWhatsApp(whatsapp)) {
        res.status(400).json({
            success: false,
            message: 'WhatsApp inválido'
        });
        return;
    }

    // Validar CPF (opcional, mas se fornecido deve ser válido)
    if (cpf && !isValidCPF(cpf)) {
        res.status(400).json({
            success: false,
            message: 'CPF inválido'
        });
        return;
    }

    // Validar provedor atual
    if (!provedor_atual || provedor_atual.length > 50) {
        res.status(400).json({
            success: false,
            message: 'Provedor atual é obrigatório e deve ter no máximo 50 caracteres'
        });
        return;
    }

    // Validar satisfação
    const satisfacoesValidas = ['muito_satisfeito', 'satisfeito', 'neutro', 'insatisfeito', 'muito_insatisfeito'];
    if (!satisfacao || !satisfacoesValidas.includes(satisfacao)) {
        res.status(400).json({
            success: false,
            message: 'Satisfação deve ser uma das opções válidas'
        });
        return;
    }

    // Validar bairro
    if (!bairro || bairro.length > 100) {
        res.status(400).json({
            success: false,
            message: 'Bairro é obrigatório e deve ter no máximo 100 caracteres'
        });
        return;
    }

    // Validar valor mensal
    if (!valor_mensal || valor_mensal.length > 20) {
        res.status(400).json({
            success: false,
            message: 'Valor mensal é obrigatório e deve ter no máximo 20 caracteres'
        });
        return;
    }

    // Validar uso da internet
    if (!uso_internet || uso_internet.length === 0) {
        res.status(400).json({
            success: false,
            message: 'Uso da internet é obrigatório'
        });
        return;
    }

    // Validar interesse na proposta
    const interessesValidos = ['sim', 'nao'];
    if (!interesse_proposta || !interessesValidos.includes(interesse_proposta)) {
        res.status(400).json({
            success: false,
            message: 'Interesse na proposta deve ser "sim" ou "nao"'
        });
        return;
    }

    // Validar responsável
    if (!responsavel || responsavel.length > 100) {
        res.status(400).json({
            success: false,
            message: 'Responsável é obrigatório e deve ter no máximo 100 caracteres'
        });
        return;
    }

    next();
};

// Funções auxiliares de validação
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidWhatsApp(whatsapp: string): boolean {
    // Remove todos os caracteres não numéricos
    const cleanWhatsApp = whatsapp.replace(/\D/g, '');
    // Deve ter entre 10 e 13 dígitos (com código do país)
    return cleanWhatsApp.length >= 10 && cleanWhatsApp.length <= 13;
}

function isValidCPF(cpf: string): boolean {
    // Remove todos os caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Deve ter 11 dígitos
    if (cleanCPF.length !== 11) {
        return false;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }

    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCPF.charAt(9)) !== digit1) {
        return false;
    }

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCPF.charAt(10)) === digit2;
}

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middlewares/authMiddleware';
import asyncMiddleware from '../middlewares/asyncMiddleware';

const router = Router();

// Configurar pasta de uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único com UUID e timestamp
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}_${uniqueId}${fileExtension}`;
    cb(null, fileName);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens são permitidas.'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

// POST /api/upload/image - Upload de imagem
router.post('/image', 
  authenticateToken, 
  upload.single('image'),
  asyncMiddleware(async (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Gerar URL da imagem
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: imageUrl
      }
    });
  })
);

// Esta rota foi movida para o servidor principal para melhor organização
// GET /uploads/:filename - Servir arquivos de imagem

// DELETE /api/upload/image/:filename - Excluir imagem
router.delete('/image/:filename', 
  authenticateToken,
  asyncMiddleware(async (req: any, res: any) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Imagem excluída com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }
  })
);

export default router
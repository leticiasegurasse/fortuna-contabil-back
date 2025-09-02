# 📸 API de Upload de Imagens - Backend

## 📋 **Visão Geral**

A API de upload de imagens permite o envio seguro de arquivos de imagem para o servidor, com renomeação automática usando UUID e timestamp para evitar conflitos de nomes.

## 🚀 **Funcionalidades Implementadas**

### **1. Upload Seguro de Imagens**
- ✅ **Validação de tipo**: Aceita apenas imagens (JPG, PNG, GIF, WebP)
- ✅ **Validação de tamanho**: Máximo de 5MB por arquivo
- ✅ **Renomeação automática**: UUID + timestamp para evitar conflitos
- ✅ **Autenticação obrigatória**: Apenas usuários logados podem fazer upload
- ✅ **Armazenamento local**: Pasta `uploads/` no servidor

### **2. Renomeação Inteligente**
- **Formato**: `{timestamp}_{uuid}.{extensão}`
- **Exemplo**: `1703123456789_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`
- **Benefícios**:
  - Nomes únicos garantidos
  - Ordenação cronológica
  - Sem conflitos entre usuários
  - Fácil identificação temporal

### **3. Endpoints Disponíveis**

#### **POST /api/upload/image**
- **Descrição**: Upload de uma imagem
- **Autenticação**: Obrigatória (Bearer Token)
- **Método**: POST
- **Content-Type**: `multipart/form-data`
- **Parâmetros**:
  - `image`: Arquivo de imagem (obrigatório)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "filename": "1703123456789_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "originalName": "minha_imagem.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "url": "/uploads/1703123456789_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
  }
}
```

#### **GET /uploads/:filename**
- **Descrição**: Servir arquivo de imagem
- **Autenticação**: Não requerida
- **Método**: GET
- **Parâmetros**:
  - `filename`: Nome do arquivo (obrigatório)

**Resposta**: Arquivo de imagem ou erro 404

#### **DELETE /api/upload/image/:filename**
- **Descrição**: Excluir imagem
- **Autenticação**: Obrigatória (Bearer Token)
- **Método**: DELETE
- **Parâmetros**:
  - `filename`: Nome do arquivo (obrigatório)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Imagem excluída com sucesso"
}
```

## 🔧 **Configuração e Instalação**

### **1. Dependências Necessárias**
```json
{
  "dependencies": {
    "multer": "^2.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/multer": "^1.4.12",
    "@types/uuid": "^9.0.8"
  }
}
```

### **2. Estrutura de Pastas**
```
back/
├── src/
│   ├── routes/
│   │   └── upload.routes.ts    # Rotas de upload
│   └── server.ts               # Servidor principal
├── uploads/                    # Pasta de armazenamento (criada automaticamente)
└── package.json
```

### **3. Configuração do Servidor**
```typescript
// server.ts
import uploadRoutes from './routes/upload.routes';

// Adicionar rota de upload
app.use('/api/upload', uploadRoutes);
```

## 🛡️ **Segurança e Validação**

### **1. Validação de Arquivos**
- **Tipos permitidos**: JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB
- **Validação MIME**: Verificação de tipo real do arquivo
- **Sanitização**: Nomes de arquivo seguros

### **2. Autenticação**
- **Middleware**: `authMiddleware` obrigatório
- **Token**: Bearer Token válido
- **Usuário**: Deve estar logado no sistema

### **3. Armazenamento Seguro**
- **Pasta isolada**: `uploads/` separada do código
- **Permissões**: Apenas leitura para usuários não autenticados
- **Exclusão**: Apenas usuários autenticados podem excluir

## 📁 **Gerenciamento de Arquivos**

### **1. Criação Automática de Pastas**
```typescript
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

### **2. Nomenclatura de Arquivos**
```typescript
const timestamp = Date.now();
const uniqueId = uuidv4();
const fileExtension = path.extname(file.originalname);
const fileName = `${timestamp}_${uniqueId}${fileExtension}`;
```

### **3. Organização de Arquivos**
- **Localização**: `back/uploads/`
- **Estrutura**: Arquivos planos (sem subpastas)
- **Backup**: Recomendado para produção

## 🔄 **Integração com Frontend**

### **1. Serviço de Upload**
```typescript
// front/src/services/uploadService.ts
class UploadService {
  async uploadImage(file: File, token: string): Promise<UploadResponse>
  async deleteImage(filename: string, token: string): Promise<Response>
  getImageUrl(filename: string): string
  validateImageFile(file: File): ValidationResult
  async compressImage(file: File, quality: number, maxWidth: number): Promise<Blob>
}
```

### **2. Uso nos Componentes**
```typescript
// Exemplo de uso
const handleImageUpload = async (file: File) => {
  try {
    const token = await authService.getValidToken();
    const response = await uploadService.uploadImage(file, token);
    const imageUrl = uploadService.getImageUrl(response.data.filename);
    
    // Usar imageUrl no post
    setFormData(prev => ({ ...prev, image: imageUrl }));
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

## 🚀 **Como Usar**

### **1. Upload de Imagem**
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@minha_imagem.jpg"
```

### **2. Acessar Imagem**
```
http://localhost:3001/uploads/1703123456789_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

### **3. Excluir Imagem**
```bash
curl -X DELETE http://localhost:3001/api/upload/image/1703123456789_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 **Tratamento de Erros**

### **1. Erros Comuns**
- **400**: Arquivo não enviado ou inválido
- **401**: Não autenticado
- **403**: Acesso negado
- **413**: Arquivo muito grande
- **500**: Erro interno do servidor

### **2. Mensagens de Erro**
```json
{
  "success": false,
  "message": "Tipo de arquivo não suportado. Apenas imagens são permitidas."
}
```

## 📊 **Monitoramento e Logs**

### **1. Logs de Upload**
- **Sucesso**: Arquivo enviado, nome gerado
- **Erro**: Tipo de erro, arquivo rejeitado
- **Segurança**: Tentativas de acesso não autorizado

### **2. Métricas Recomendadas**
- **Volume de uploads**: Arquivos por dia/mês
- **Tamanho médio**: Tamanho dos arquivos
- **Taxa de erro**: Falhas vs. sucessos
- **Uso de disco**: Espaço ocupado

## 🚀 **Próximas Melhorias**

### **1. Funcionalidades Futuras**
- **CDN**: Distribuição global de imagens
- **Compressão automática**: Otimização no servidor
- **Múltiplas imagens**: Upload em lote
- **Categorização**: Organização por tipo/usuário

### **2. Integrações**
- **Cloud Storage**: AWS S3, Google Cloud Storage
- **Processamento**: Redimensionamento automático
- **Backup**: Sincronização com serviços externos
- **Cache**: Sistema de cache inteligente

## 📝 **Exemplo de Implementação Completa**

### **1. Backend (Node.js + Express)**
```typescript
// upload.routes.ts
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}_${uniqueId}${extension}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

### **2. Frontend (React + TypeScript)**
```typescript
// uploadService.ts
class UploadService {
  async uploadImage(file: File, token: string) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/api/upload/image', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  }
}
```

## 🎯 **Resumo da Solução**

A implementação resolve o problema de nomes duplicados de imagens através de:

1. **Renomeação automática** com UUID + timestamp
2. **Validação robusta** de tipos e tamanhos
3. **Autenticação obrigatória** para uploads
4. **Serviço dedicado** para gerenciamento de arquivos
5. **Integração completa** com frontend e backend

**Resultado**: Sistema de upload robusto, seguro e sem conflitos de nomes! 🚀📸

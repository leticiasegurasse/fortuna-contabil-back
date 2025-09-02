# 📧 API da Newsletter - Fortuna Contábil

## Visão Geral

A API da Newsletter permite que usuários se inscrevam para receber atualizações do blog da Fortuna Contábil. O sistema garante que não haja emails duplicados e oferece funcionalidades para gerenciar inscrições.

## 🚀 Endpoints

### 1. Inscrever na Newsletter

**POST** `/api/newsletter/subscribe`

Inscreve um novo email na newsletter ou reativa uma inscrição cancelada.

#### Request Body
```json
{
  "email": "usuario@exemplo.com"
}
```

#### Response (201 - Criado)
```json
{
  "success": true,
  "message": "Inscrito na newsletter com sucesso!",
  "data": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "subscribedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Response (409 - Conflito)
```json
{
  "success": false,
  "message": "Este email já está inscrito na newsletter"
}
```

### 2. Cancelar Inscrição

**POST** `/api/newsletter/unsubscribe`

Cancela a inscrição de um email na newsletter.

#### Request Body
```json
{
  "email": "usuario@exemplo.com"
}
```

#### Response (200 - OK)
```json
{
  "success": true,
  "message": "Inscrição cancelada com sucesso"
}
```

#### Response (404 - Não Encontrado)
```json
{
  "success": false,
  "message": "Email não encontrado na newsletter"
}
```

### 3. Verificar Status de Inscrição

**GET** `/api/newsletter/check/:email`

Verifica se um email está inscrito na newsletter.

#### Response (200 - OK)
```json
{
  "success": true,
  "data": {
    "isSubscribed": true,
    "email": "usuario@exemplo.com",
    "subscribedAt": "2024-01-15T10:30:00.000Z",
    "unsubscribedAt": null
  }
}
```

### 4. Listar Inscritos (Protegido)

**GET** `/api/newsletter/subscribers`

Lista todos os inscritos na newsletter (requer autenticação de admin).

#### Query Parameters
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 50)
- `status` (opcional): Filtrar por status (`active`, `inactive`)

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 - OK)
```json
{
  "success": true,
  "data": {
    "subscribers": [
      {
        "id": 1,
        "email": "usuario@exemplo.com",
        "isActive": true,
        "subscribedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 50
    }
  }
}
```

### 5. Estatísticas da Newsletter (Protegido)

**GET** `/api/newsletter/stats`

Retorna estatísticas da newsletter (requer autenticação de admin).

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 - OK)
```json
{
  "success": true,
  "data": {
    "totalSubscribers": 150,
    "activeSubscribers": 142,
    "inactiveSubscribers": 8,
    "recentSubscriptions": 12,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: `newsletters`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | Chave primária |
| `email` | VARCHAR(255) | Email do usuário (único) |
| `isActive` | BOOLEAN | Status da inscrição |
| `subscribedAt` | TIMESTAMP | Data de inscrição |
| `unsubscribedAt` | TIMESTAMP | Data de cancelamento (opcional) |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Índices
- `idx_newsletters_email` - Índice único no campo email
- `idx_newsletters_isActive` - Índice no campo de status
- `idx_newsletters_subscribedAt` - Índice na data de inscrição

## 🔒 Segurança

- **Endpoints públicos**: `subscribe`, `unsubscribe`, `check`
- **Endpoints protegidos**: `subscribers`, `stats` (requerem token JWT válido)
- **Validação**: Todos os emails são validados e convertidos para minúsculas
- **Rate limiting**: Recomenda-se implementar rate limiting para endpoints públicos

## 📝 Casos de Uso

### 1. Inscrição de Novo Usuário
1. Usuário preenche formulário com email
2. Sistema valida formato do email
3. Sistema verifica se email já existe
4. Se não existir, cria nova inscrição
5. Se existir e estiver inativo, reativa inscrição

### 2. Cancelamento de Inscrição
1. Usuário solicita cancelamento
2. Sistema marca inscrição como inativa
3. Sistema registra data de cancelamento
4. Email pode ser reativado posteriormente

### 3. Gestão Administrativa
1. Admin visualiza lista de inscritos
2. Admin pode filtrar por status
3. Admin visualiza estatísticas
4. Sistema oferece paginação para grandes volumes

## 🚨 Tratamento de Erros

### Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `401` - Não autorizado (token inválido)
- `404` - Recurso não encontrado
- `409` - Conflito (email já inscrito)
- `500` - Erro interno do servidor

### Mensagens de Erro
Todas as respostas de erro seguem o padrão:
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

## 🔧 Implementação

### Dependências
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT para autenticação

### Middlewares Utilizados
- `asyncMiddleware` - Tratamento de erros assíncronos
- `authMiddleware` - Proteção de rotas administrativas

## 📊 Monitoramento

### Logs Recomendados
- Inscrições bem-sucedidas
- Tentativas de inscrição duplicada
- Cancelamentos
- Acessos não autorizados a endpoints protegidos

### Métricas Importantes
- Taxa de conversão de inscrições
- Taxa de cancelamento
- Crescimento da base de inscritos
- Performance dos endpoints

## 🚀 Deploy

### Variáveis de Ambiente
```env
NODE_ENV=production
DB_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
```

### Comandos de Deploy
```bash
# Instalar dependências
npm install

# Executar migrações
npm run migrate

# Iniciar servidor
npm start
```

## 📞 Suporte

Para dúvidas ou problemas com a API da Newsletter, entre em contato com a equipe de desenvolvimento da Fortuna Contábil.

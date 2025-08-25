# Backend - Pesquisa de Mercado

Backend Node.js com TypeScript, Express, PostgreSQL e JWT para autenticação.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Sequelize** - ORM
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- PostgreSQL instalado e rodando
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
   
   Copie o arquivo `config.env` e renomeie para `.env`, então configure suas variáveis:

```bash
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database_name

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura
JWT_EXPIRES_IN=24h

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000
```

## 🗄️ Configuração do Banco de Dados

1. **Crie um banco de dados PostgreSQL**
```sql
CREATE DATABASE pesquisa_mercado;
```

2. **Configure a URL do banco de dados no arquivo .env**
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Exemplo:**
```bash
DATABASE_URL=postgresql://postgres:minhasenha@localhost:5432/pesquisa_mercado
```

3. **O Sequelize criará as tabelas automaticamente na primeira execução**

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Autenticação

#### POST `/api/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
Faz login do usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET `/api/auth/profile`
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Health Check

#### GET `/api/health`
Verifica se o servidor está funcionando.

**Response:**
```json
{
  "success": true,
  "message": "Servidor funcionando corretamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 🛡️ Segurança

- Senhas são hasheadas com bcrypt
- Headers de segurança com Helmet
- CORS configurado
- Validação de entrada
- Tratamento de erros centralizado

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── database.ts          # Configuração do banco de dados
├── controllers/
│   └── authController.ts    # Controllers de autenticação
├── middleware/
│   └── auth.ts             # Middleware de autenticação
├── models/
│   └── User.ts             # Modelo de usuário
├── routes/
│   └── auth.ts             # Rotas de autenticação
├── utils/
│   └── jwt.ts              # Utilitários JWT
└── server.ts               # Arquivo principal do servidor
```

## 🧪 Testando a API

Você pode usar ferramentas como:
- **Postman**
- **Insomnia**
- **Thunder Client** (VS Code)
- **curl**

### Exemplo com curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"123456"}'

# Obter perfil (com token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <seu_token>"
```

## 🚀 Próximos Passos

- [ ] Adicionar validação com Joi ou Zod
- [ ] Implementar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Implementar logs estruturados
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Adicionar documentação com Swagger

## 📝 Licença

Este projeto está sob a licença ISC.

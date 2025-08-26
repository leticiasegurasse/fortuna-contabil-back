# 📝 API da Fortuna Contábil - Documentação

## 🚀 Visão Geral

Esta API fornece endpoints para gerenciar o sistema de blog da Fortuna Contábil, incluindo categorias e posts.

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 📋 Endpoints

### 🔐 Autenticação

#### POST /api/auth/login
Fazer login no sistema.

**Body:**
```json
{
  "email": "admin@fortunacontabil.com",
  "password": "admin123"
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
      "username": "admin",
      "email": "admin@fortunacontabil.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📝 Categorias

#### GET /api/categories
Listar todas as categorias.

**Query Parameters:**
- `search` (opcional): Buscar por nome ou descrição
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Abertura de Empresas",
      "slug": "abertura-empresas",
      "description": "Artigos sobre abertura e formalização de empresas",
      "color": "#3B82F6",
      "postsCount": 5,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /api/categories/:id
Buscar categoria por ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Abertura de Empresas",
    "slug": "abertura-empresas",
    "description": "Artigos sobre abertura e formalização de empresas",
    "color": "#3B82F6",
    "postsCount": 5,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### POST /api/categories (Protegido)
Criar nova categoria.

**Body:**
```json
{
  "name": "Nova Categoria",
  "description": "Descrição da categoria",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categoria criada com sucesso",
  "data": {
    "id": 6,
    "name": "Nova Categoria",
    "slug": "nova-categoria",
    "description": "Descrição da categoria",
    "color": "#3B82F6",
    "postsCount": 0,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### PUT /api/categories/:id (Protegido)
Atualizar categoria.

**Body:**
```json
{
  "name": "Categoria Atualizada",
  "description": "Nova descrição",
  "color": "#10B981"
}
```

#### DELETE /api/categories/:id (Protegido)
Excluir categoria.

**Response:**
```json
{
  "success": true,
  "message": "Categoria excluída com sucesso"
}
```

#### GET /api/categories/:id/posts
Listar posts de uma categoria.

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `status` (opcional): Filtrar por status (padrão: 'published')

### 📄 Posts

#### GET /api/posts
Listar todos os posts.

**Query Parameters:**
- `search` (opcional): Buscar por título, resumo ou conteúdo
- `status` (opcional): Filtrar por status (draft, published, archived)
- `categoryId` (opcional): Filtrar por categoria
- `featured` (opcional): Filtrar por destaque (true/false)
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `sortBy` (opcional): Ordenar por (createdAt, publishedAt, views, title)
- `sortOrder` (opcional): Ordem (ASC, DESC)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Como abrir uma empresa MEI",
      "slug": "como-abrir-empresa-mei",
      "excerpt": "Guia completo para abrir sua empresa...",
      "content": "Conteúdo completo do post...",
      "status": "published",
      "featured": true,
      "views": 1247,
      "authorId": 1,
      "categoryId": 1,
      "metaTitle": "Como abrir MEI - Guia Completo",
      "metaDescription": "Aprenda como abrir sua empresa MEI...",
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "author": {
        "id": 1,
        "username": "admin",
        "email": "admin@fortunacontabil.com"
      },
      "category": {
        "id": 1,
        "name": "Abertura de Empresas",
        "slug": "abertura-empresas",
        "color": "#3B82F6"
      }
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /api/posts/:id
Buscar post por ID.

#### GET /api/posts/slug/:slug
Buscar post por slug.

#### POST /api/posts (Protegido)
Criar novo post.

**Body:**
```json
{
  "title": "Título do Post",
  "excerpt": "Resumo do post",
  "content": "Conteúdo completo do post...",
  "status": "draft",
  "featured": false,
  "categoryId": 1,
  "metaTitle": "Meta título para SEO",
  "metaDescription": "Meta descrição para SEO"
}
```

#### PUT /api/posts/:id (Protegido)
Atualizar post.

#### DELETE /api/posts/:id (Protegido)
Excluir post.

#### PUT /api/posts/:id/status (Protegido)
Atualizar status do post.

**Body:**
```json
{
  "status": "published"
}
```

#### PUT /api/posts/:id/featured (Protegido)
Atualizar destaque do post.

**Body:**
```json
{
  "featured": true
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: categories
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL, UNIQUE)
- `slug` (VARCHAR(100), NOT NULL, UNIQUE)
- `description` (TEXT)
- `color` (VARCHAR(7), NOT NULL, DEFAULT: '#3B82F6')
- `postsCount` (INTEGER, NOT NULL, DEFAULT: 0)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Tabela: posts
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `title` (VARCHAR(200), NOT NULL)
- `slug` (VARCHAR(200), NOT NULL, UNIQUE)
- `excerpt` (TEXT)
- `content` (TEXT, NOT NULL)
- `status` (ENUM: 'draft', 'published', 'archived', NOT NULL, DEFAULT: 'draft')
- `featured` (BOOLEAN, NOT NULL, DEFAULT: false)
- `views` (INTEGER, NOT NULL, DEFAULT: 0)
- `authorId` (INTEGER, NOT NULL, FOREIGN KEY -> users.id)
- `categoryId` (INTEGER, NOT NULL, FOREIGN KEY -> categories.id)
- `metaTitle` (VARCHAR(60))
- `metaDescription` (VARCHAR(160))
- `publishedAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## 🔧 Funcionalidades

### ✨ Recursos Implementados

1. **CRUD Completo** para categorias e posts
2. **Autenticação JWT** com refresh tokens
3. **Validação de dados** em todos os endpoints
4. **Geração automática de slugs** únicos
5. **Contadores automáticos** de posts por categoria
6. **Sistema de visualizações** para posts
7. **Filtros e busca** avançados
8. **Paginação** em todas as listagens
9. **Ordenação** por múltiplos campos
10. **SEO metadata** para posts
11. **Status de posts** (rascunho, publicado, arquivado)
12. **Sistema de destaque** para posts
13. **Proteção de rotas** com middleware de autenticação
14. **Seed automático** de dados iniciais

### 🚀 Recursos Avançados

- **Slugs únicos**: Geração automática de URLs amigáveis
- **Contadores em tempo real**: Atualização automática do número de posts por categoria
- **Busca inteligente**: Busca por título, resumo e conteúdo
- **Filtros múltiplos**: Por status, categoria, destaque, etc.
- **Ordenação flexível**: Por data, visualizações, título, etc.
- **Paginação eficiente**: Controle de página e limite
- **Relacionamentos**: Posts incluem dados do autor e categoria
- **Validação robusta**: Verificação de dados obrigatórios e formatos

## 🛠️ Como Usar

### 1. Instalação
```bash
cd back
npm install
```

### 2. Configuração do Banco
Configure as variáveis de ambiente no arquivo `.env`:
```env
DB_URL=postgres://user:password@localhost:5432/fortuna_contabil
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
```

### 3. Execução
```bash
npm run dev
```

### 4. Seed Inicial
O sistema criará automaticamente:
- Usuário admin: `admin@fortunacontabil.com` / `admin123`
- 5 categorias iniciais

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🔒 Segurança

- Todas as rotas de criação, edição e exclusão são protegidas
- Validação de dados em todos os endpoints
- Sanitização de inputs
- Controle de acesso baseado em roles
- Tokens JWT com expiração
- Refresh tokens para renovação automática

## 📈 Performance

- Índices otimizados no banco de dados
- Paginação para grandes volumes de dados
- Queries otimizadas com relacionamentos
- Cache de contadores atualizado automaticamente
- Busca eficiente com índices de texto

## 🐛 Tratamento de Erros

Todos os endpoints retornam respostas padronizadas:

**Sucesso:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

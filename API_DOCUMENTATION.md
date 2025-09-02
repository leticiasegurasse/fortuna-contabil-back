# 📝 API da Fortuna Contábil - Documentação

## 🚀 Visão Geral

Esta API fornece endpoints para gerenciar o sistema de blog da Fortuna Contábil, incluindo categorias, posts e tags.

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

### 🏷️ Tags

#### GET /api/tags
Listar todas as tags.

**Query Parameters:**
- `search` (opcional): Buscar por nome ou descrição
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `sort` (opcional): Ordenação ('postsCount', 'name', 'createdAt') - padrão: 'postsCount'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MEI",
      "slug": "mei",
      "description": "Microempreendedor Individual",
      "color": "#3A6B52",
      "postsCount": 8,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### GET /api/tags/popular
Listar tags populares (ordenadas por número de posts).

**Query Parameters:**
- `limit` (opcional): Número máximo de tags (padrão: 10)
- `minPosts` (opcional): Número mínimo de posts para considerar popular (padrão: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "MEI",
      "slug": "mei",
      "description": "Microempreendedor Individual",
      "color": "#3A6B52",
      "postsCount": 8,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Abertura de Empresa",
      "slug": "abertura-empresa",
      "description": "Processo de abertura de empresas",
      "color": "#C5A46D",
      "postsCount": 6,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/tags/:id
Buscar tag por ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MEI",
    "slug": "mei",
    "description": "Microempreendedor Individual",
    "color": "#3A6B52",
    "postsCount": 8,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### GET /api/tags/slug/:slug
Buscar tag por slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "MEI",
    "slug": "mei",
    "description": "Microempreendedor Individual",
    "color": "#3A6B52",
    "postsCount": 8,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### GET /api/tags/:id/posts
Listar posts de uma tag específica.

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `status` (opcional): Status dos posts ('published', 'draft', 'archived', 'all') - padrão: 'published'

**Response:**
```json
{
  "success": true,
  "data": {
    "tag": {
      "id": 1,
      "name": "MEI",
      "slug": "mei",
      "description": "Microempreendedor Individual",
      "color": "#3A6B52",
      "postsCount": 8
    },
    "posts": [
      {
        "id": 1,
        "title": "Como abrir um MEI em 2024",
        "slug": "como-abrir-mei-2024",
        "excerpt": "Guia completo para abertura de MEI...",
        "status": "published",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "author": {
          "id": 1,
          "username": "admin",
          "email": "admin@fortunacontabil.com"
        }
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### POST /api/tags
Criar nova tag (protegido).

**Body:**
```json
{
  "name": "Nova Tag",
  "description": "Descrição da nova tag",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag criada com sucesso",
  "data": {
    "id": 9,
    "name": "Nova Tag",
    "slug": "nova-tag",
    "description": "Descrição da nova tag",
    "color": "#3B82F6",
    "postsCount": 0,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### PUT /api/tags/:id
Atualizar tag (protegido).

**Body:**
```json
{
  "name": "Tag Atualizada",
  "description": "Nova descrição",
  "color": "#EF4444"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tag atualizada com sucesso",
  "data": {
    "id": 1,
    "name": "Tag Atualizada",
    "slug": "tag-atualizada",
    "description": "Nova descrição",
    "color": "#EF4444",
    "postsCount": 8,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### DELETE /api/tags/:id
Excluir tag (protegido).

**Response:**
```json
{
  "success": true,
  "message": "Tag excluída com sucesso"
}
```

#### POST /api/tags/:id/posts/:postId
Associar tag a um post (protegido).

**Response:**
```json
{
  "success": true,
  "message": "Tag associada ao post com sucesso"
}
```

#### DELETE /api/tags/:id/posts/:postId
Remover associação de tag a um post (protegido).

**Response:**
```json
{
  "success": true,
  "message": "Associação removida com sucesso"
}
```

### 📄 Posts

#### GET /api/posts
Listar todos os posts.

**Query Parameters:**
- `search` (opcional): Buscar por título, resumo ou conteúdo
- `status` (opcional): Filtrar por status (draft, published, archived)
- `categoryId` (opcional): Filtrar por categoria
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
      "image": "https://exemplo.com/imagem-post.jpg",
      "views": 1247,
      "authorId": 1,
      "categoryId": 1,
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
  "image": "URL da imagem do post",
  "categoryId": 1
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
- `image` (VARCHAR(500))
- `views` (INTEGER, NOT NULL, DEFAULT: 0)
- `authorId` (INTEGER, NOT NULL, FOREIGN KEY -> users.id)
- `categoryId` (INTEGER, NOT NULL, FOREIGN KEY -> categories.id)
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
10. **Status de posts** (rascunho, publicado, arquivado)
11. **Proteção de rotas** com middleware de autenticação
12. **Seed automático** de dados iniciais

### 🚀 Recursos Avançados

- **Slugs únicos**: Geração automática de URLs amigáveis
- **Contadores em tempo real**: Atualização automática do número de posts por categoria
- **Busca inteligente**: Busca por título, resumo e conteúdo
- **Filtros múltiplos**: Por status, categoria, etc.
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

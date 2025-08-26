# 📚 Coleção Postman - API Fortuna Contábil

Esta coleção contém **TODOS** os endpoints da API do blog da Fortuna Contábil para facilitar os testes e desenvolvimento.

## 📁 Arquivos

- **`Fortuna_Contabil_Blog_API.postman_collection.json`** - Coleção principal com todos os endpoints
- **`Fortuna_Contabil_Environment.postman_environment.json`** - Ambiente de desenvolvimento
- **`README_Postman.md`** - Este arquivo com instruções

## 🚀 Como Importar

### 1. Importar Coleção
1. Abra o **Postman**
2. Clique em **"Import"** (botão no canto superior esquerdo)
3. Arraste o arquivo `Fortuna_Contabil_Blog_API.postman_collection.json` ou clique em **"Upload Files"**
4. Clique em **"Import"**

### 2. Importar Ambiente
1. Clique em **"Import"** novamente
2. Arraste o arquivo `Fortuna_Contabil_Environment.postman_environment.json`
3. Clique em **"Import"**
4. No seletor de ambiente (canto superior direito), selecione **"Fortuna Contábil - Development"**

## 🔧 Configuração

### Variáveis de Ambiente
A coleção usa as seguintes variáveis:

- **`baseUrl`** - URL base da API (padrão: `http://localhost:3001`)
- **`authToken`** - Token de autenticação (preenchido automaticamente após login)
- **`adminEmail`** - Email do admin (padrão: `admin@fortunacontabil.com`)
- **`adminPassword`** - Senha do admin (padrão: `admin123`)

### Autenticação Automática
O endpoint de **Login** está configurado para salvar automaticamente o token de autenticação na variável `authToken` após um login bem-sucedido.

## 📋 Estrutura Completa da Coleção

### 🏥 Sistema (2 endpoints)
- **Health Check** - Verificar se a API está funcionando
- **Root** - Endpoint raiz da API

### 🔐 Autenticação (10 endpoints)
- **Registrar Usuário** - Criar nova conta
- **Login** - Fazer login no sistema (salva token automaticamente)
- **Logout** - Fazer logout do sistema
- **Renovar Token** - Renovar token de autenticação
- **Esqueci a Senha** - Solicitar redefinição de senha
- **Redefinir Senha** - Redefinir senha com token
- **Verificar Token** - Verificar se o token é válido
- **Perfil do Usuário** - Obter perfil do usuário autenticado
- **Atualizar Perfil** - Atualizar dados do perfil
- **Alterar Senha** - Alterar senha do usuário

### 📝 Categorias (6 endpoints)
- **Listar Categorias** - Listar todas as categorias com paginação
- **Buscar Categoria por ID** - Buscar categoria específica
- **Posts da Categoria** - Listar posts de uma categoria específica
- **Criar Categoria** - Criar nova categoria (requer autenticação)
- **Atualizar Categoria** - Atualizar categoria existente (requer autenticação)
- **Excluir Categoria** - Excluir categoria (requer autenticação)

### 📄 Posts (8 endpoints)
- **Listar Posts** - Listar todos os posts com filtros e paginação
- **Buscar Post por ID** - Buscar post específico
- **Buscar Post por Slug** - Buscar post por slug (URL amigável)
- **Criar Post** - Criar novo post (requer autenticação)
- **Atualizar Post** - Atualizar post existente (requer autenticação)
- **Excluir Post** - Excluir post (requer autenticação)
- **Atualizar Status do Post** - Mudar status (draft/published/archived)
- **Atualizar Destaque do Post** - Marcar/desmarcar como destaque

**Total: 26 endpoints organizados**

## 🧪 Como Testar

### 1. Verificar Sistema
1. Execute **"Health Check"** para verificar se a API está rodando
2. Execute **"Root"** para ver a mensagem de boas-vindas

### 2. Autenticação
1. Execute **"Login"** com as credenciais padrão (`admin` / `admin123`)
2. Verifique se o token foi salvo automaticamente
3. Execute **"Verificar Token"** para confirmar que está funcionando
4. Execute **"Perfil do Usuário"** para ver os dados do admin

### 3. Testar Categorias
1. Execute **"Listar Categorias"** para ver as categorias iniciais
2. Execute **"Criar Categoria"** para criar uma nova categoria
3. Execute **"Atualizar Categoria"** para modificar uma categoria
4. Execute **"Excluir Categoria"** para remover uma categoria

### 4. Testar Posts
1. Execute **"Listar Posts"** para ver os posts existentes
2. Execute **"Criar Post"** para criar um novo post
3. Execute **"Atualizar Post"** para modificar um post
4. Execute **"Atualizar Status do Post"** para publicar um post
5. Execute **"Atualizar Destaque do Post"** para destacar um post

## 📊 Parâmetros de Consulta

### Listar Posts
- **`page`** - Número da página (padrão: 1)
- **`limit`** - Itens por página (padrão: 10)
- **`status`** - Filtrar por status (`published`, `draft`, `archived`, `all`)
- **`categoryId`** - Filtrar por categoria
- **`featured`** - Filtrar por destaque (`true`/`false`)
- **`search`** - Buscar por título, resumo ou conteúdo
- **`sortBy`** - Ordenar por (`createdAt`, `publishedAt`, `views`, `title`)
- **`sortOrder`** - Ordem (`ASC`, `DESC`)

### Listar Categorias
- **`page`** - Número da página (padrão: 1)
- **`limit`** - Itens por página (padrão: 10)
- **`search`** - Buscar por nome ou descrição

### Posts da Categoria
- **`page`** - Número da página (padrão: 1)
- **`limit`** - Itens por página (padrão: 10)
- **`status`** - Filtrar por status (`published`, `draft`, `archived`, `all`)

## 🔒 Autenticação

### Endpoints Protegidos
Os seguintes endpoints requerem autenticação (token JWT):

**Autenticação:**
- POST `/api/auth/refresh` - Renovar token
- GET `/api/auth/verify-token` - Verificar token
- GET `/api/auth/profile` - Obter perfil
- PUT `/api/auth/profile` - Atualizar perfil
- POST `/api/auth/change-password` - Alterar senha

**Categorias:**
- POST `/api/categories` - Criar categoria
- PUT `/api/categories/:id` - Atualizar categoria
- DELETE `/api/categories/:id` - Excluir categoria

**Posts:**
- POST `/api/posts` - Criar post
- PUT `/api/posts/:id` - Atualizar post
- DELETE `/api/posts/:id` - Excluir post
- PUT `/api/posts/:id/status` - Atualizar status
- PUT `/api/posts/:id/featured` - Atualizar destaque

### Como Funciona
1. Execute o endpoint **"Login"** primeiro
2. O token será salvo automaticamente na variável `authToken`
3. Todos os endpoints protegidos usarão automaticamente este token
4. Para fazer logout, execute **"Logout"**

## 🎯 Exemplos de Uso

### Registrar Usuário
```json
{
  "username": "novo_usuario",
  "password": "senha123",
  "email": "usuario@exemplo.com"
}
```

### Login
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Criar uma Categoria
```json
{
  "name": "Impostos",
  "description": "Artigos sobre impostos e tributação",
  "color": "#EF4444"
}
```

### Criar um Post
```json
{
  "title": "Como declarar o Imposto de Renda",
  "excerpt": "Guia completo para declarar o IR 2024",
  "content": "Conteúdo completo do artigo...",
  "status": "draft",
  "featured": false,
  "categoryId": 1,
  "metaTitle": "Como declarar IR 2024 - Guia Completo",
  "metaDescription": "Aprenda como declarar seu Imposto de Renda de forma correta e sem erros"
}
```

### Publicar um Post
```json
{
  "status": "published"
}
```

### Atualizar Perfil
```json
{
  "username": "novo_username",
  "email": "novo_email@exemplo.com"
}
```

### Alterar Senha
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha123"
}
```

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro 401 (Unauthorized)**
- Verifique se fez login primeiro
- Execute **"Login"** novamente para obter um novo token

**2. Erro 404 (Not Found)**
- Verifique se o servidor está rodando na porta 3001
- Execute **"Health Check"** para confirmar

**3. Erro 500 (Internal Server Error)**
- Verifique os logs do servidor
- Confirme se o banco de dados está conectado

**4. Token não está sendo salvo**
- Verifique se o endpoint **"Login"** retornou status 200
- Confirme se a resposta contém `success: true` e `data.token`

**5. Erro de validação**
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se os tipos de dados estão corretos

### Logs do Servidor
Para ver os logs do servidor, execute no terminal:
```bash
cd back
npm run dev
```

## 📝 Notas Importantes

- A coleção está configurada para o ambiente de desenvolvimento
- Para produção, altere a variável `baseUrl` para a URL de produção
- O token de autenticação expira após 24 horas
- Todos os endpoints retornam respostas em formato JSON
- A paginação é baseada em `page` e `limit`
- Os slugs são gerados automaticamente a partir dos títulos
- O login usa `username` (não `email`) como credencial
- Todos os endpoints de autenticação estão incluídos

## 🔗 Links Úteis

- **Documentação da API:** `API_DOCUMENTATION.md`
- **Servidor:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/api/health`
- **Credenciais padrão:** `admin` / `admin123`

## 📈 Estatísticas da API

- **Total de endpoints:** 26
- **Endpoints públicos:** 11
- **Endpoints protegidos:** 15
- **Métodos HTTP:** GET, POST, PUT, DELETE
- **Autenticação:** JWT Bearer Token
- **Formato de resposta:** JSON
- **Paginação:** Suportada em listagens
- **Filtros:** Status, categoria, destaque, busca
- **Ordenação:** Por data, visualizações, título

# Sistema de Tags para Posts

Este documento explica como usar o sistema de tags implementado para os posts do blog.

## Funcionalidades Implementadas

### 1. Relacionamento N:N entre Posts e Tags
- Cada post pode ter múltiplas tags
- Cada tag pode estar associada a múltiplos posts
- Relacionamento gerenciado através da tabela intermediária `post_tags`

### 2. Operações com Tags

#### Criar Post com Tags
```json
POST /api/posts
{
  "title": "Título do Post",
  "excerpt": "Resumo do post",
  "contentBlocks": [...],
  "categoryId": 1,
  "tagIds": [1, 3, 5]  // Array com IDs das tags
}
```

#### Atualizar Post com Tags
```json
PUT /api/posts/:id
{
  "title": "Título Atualizado",
  "excerpt": "Resumo atualizado",
  "contentBlocks": [...],
  "categoryId": 1,
  "tagIds": [2, 4, 6]  // Array com IDs das tags
}
```

#### Buscar Posts por Tag
```
GET /api/posts/tag/:tagId?page=1&limit=10&sortBy=createdAt&sortOrder=DESC
```

### 3. Comportamento Automático

#### Ao Criar/Atualizar Post
- As tags existentes são removidas
- Novas tags são associadas
- Contadores de posts das tags são atualizados automaticamente

#### Ao Excluir Post
- Relacionamentos com tags são removidos automaticamente (CASCADE)
- Contadores de posts das tags são atualizados

#### Ao Buscar Posts
- Tags são incluídas automaticamente em todas as consultas
- Dados da tabela intermediária não são retornados

## Estrutura da Resposta

### Post com Tags
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Título do Post",
    "tags": [
      {
        "id": 1,
        "name": "Contabilidade",
        "slug": "contabilidade",
        "color": "#3B82F6"
      },
      {
        "id": 3,
        "name": "MEI",
        "slug": "mei",
        "color": "#10B981"
      }
    ]
  }
}
```

### Posts por Tag
```json
{
  "success": true,
  "data": {
    "tag": {
      "id": 1,
      "name": "Contabilidade",
      "slug": "contabilidade",
      "color": "#3B82F6",
      "description": "Posts sobre contabilidade"
    },
    "posts": [...]
  },
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

## Validações

- `tagIds` deve ser um array de números
- Tags inexistentes são ignoradas silenciosamente
- Array vazio remove todas as tags do post
- `null` ou `undefined` não altera as tags existentes

## Exemplos de Uso

### Frontend - Criar Post
```typescript
const createPost = async (postData: CreatePostData) => {
  const response = await api.post('/posts', {
    ...postData,
    tagIds: selectedTags.map(tag => tag.id)
  });
  return response.data;
};
```

### Frontend - Atualizar Post
```typescript
const updatePost = async (id: number, postData: UpdatePostData) => {
  const response = await api.put(`/posts/${id}`, {
    ...postData,
    tagIds: selectedTags.map(tag => tag.id)
  });
  return response.data;
};
```

### Frontend - Buscar Posts por Tag
```typescript
const getPostsByTag = async (tagId: number, page = 1) => {
  const response = await api.get(`/posts/tag/${tagId}`, {
    params: { page, limit: 10 }
  });
  return response.data;
};
```

## Notas Importantes

1. **Contadores Automáticos**: O sistema mantém automaticamente o campo `postsCount` das tags
2. **Performance**: Relacionamentos são carregados de forma otimizada
3. **Integridade**: Relacionamentos são mantidos consistentes com operações CASCADE
4. **Flexibilidade**: Posts podem ter 0, 1 ou múltiplas tags

## Próximos Passos

- Implementar busca de posts por múltiplas tags
- Adicionar filtros por tags na listagem geral de posts
- Implementar sugestões de tags baseadas em conteúdo
- Adicionar estatísticas de uso das tags

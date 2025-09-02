# API de Blocos de Conteúdo - Fortuna Contábil

## Visão Geral

O sistema de posts agora suporta **conteúdo estruturado em blocos**, permitindo que os usuários criem posts mais ricos e organizados com diferentes tipos de conteúdo (títulos, parágrafos, imagens, listas, etc.) e controlem a ordem de exibição.

## Tipos de Blocos Suportados

### 1. **Title** - Título Principal
```json
{
  "id": "block_1",
  "type": "title",
  "content": "Como Abrir uma Empresa MEI",
  "order": 1,
  "metadata": {
    "level": 1,
    "alignment": "center"
  }
}
```

### 2. **Subtitle** - Subtítulo
```json
{
  "id": "block_2",
  "type": "subtitle",
  "content": "Passo a Passo Completo",
  "order": 2,
  "metadata": {
    "level": 2,
    "alignment": "left"
  }
}
```

### 3. **Paragraph** - Parágrafo
```json
{
  "id": "block_3",
  "type": "paragraph",
  "content": "Abrir uma empresa MEI é um processo simples que pode ser feito online. Vamos te guiar através de todos os passos necessários para formalizar seu negócio.",
  "order": 3
}
```

### 4. **Image** - Imagem
```json
{
  "id": "block_4",
  "type": "image",
  "content": "https://exemplo.com/imagem-mei.jpg",
  "order": 4,
  "metadata": {
    "imageAlt": "Ilustração do processo de abertura MEI",
    "imageCaption": "Processo simplificado de abertura de empresa"
  }
}
```

### 5. **List** - Lista
```json
{
  "id": "block_5",
  "type": "list",
  "content": "CPF válido\nRG ou CNH\nComprovante de endereço\nFoto 3x4",
  "order": 5,
  "metadata": {
    "listType": "unordered"
  }
}
```

### 6. **Quote** - Citação
```json
{
  "id": "block_6",
  "type": "quote",
  "content": "O empreendedorismo é a arte de transformar sonhos em realidade através de ações concretas.",
  "order": 6,
  "metadata": {
    "quoteAuthor": "João Silva, Consultor Empresarial"
  }
}
```

## Estrutura Completa de um Post

### Exemplo de Criação de Post com Blocos

```json
POST /api/posts
{
  "title": "Guia Completo para Abrir uma Empresa MEI",
  "excerpt": "Aprenda tudo sobre como abrir sua empresa MEI de forma simples e rápida",
  "categoryId": 1,
  "status": "draft",
  "image": "https://exemplo.com/imagem-principal.jpg",
  "contentBlocks": [
    {
      "id": "block_1",
      "type": "title",
      "content": "Como Abrir uma Empresa MEI",
      "order": 1,
      "metadata": {
        "level": 1,
        "alignment": "center"
      }
    },
    {
      "id": "block_2",
      "type": "paragraph",
      "content": "O MEI (Microempreendedor Individual) é uma das formas mais simples de formalizar um negócio no Brasil. Com apenas alguns cliques, você pode ter sua empresa funcionando legalmente.",
      "order": 2
    },
    {
      "id": "block_3",
      "type": "subtitle",
      "content": "Vantagens do MEI",
      "order": 3,
      "metadata": {
        "level": 2
      }
    },
    {
      "id": "block_4",
      "type": "list",
      "content": "Processo de abertura gratuito\nImpostos reduzidos\nSimplicidade na gestão\nAcesso a crédito facilitado",
      "order": 4,
      "metadata": {
        "listType": "unordered"
      }
    },
    {
      "id": "block_5",
      "type": "image",
      "content": "https://exemplo.com/grafico-vantagens.jpg",
      "order": 5,
      "metadata": {
        "imageAlt": "Gráfico mostrando as vantagens do MEI",
        "imageCaption": "Principais benefícios da formalização"
      }
    },
    {
      "id": "block_6",
      "type": "subtitle",
      "content": "Documentos Necessários",
      "order": 6,
      "metadata": {
        "level": 2
      }
    },
    {
      "id": "block_7",
      "type": "list",
      "content": "CPF válido\nRG ou CNH\nComprovante de endereço\nFoto 3x4 recente",
      "order": 7,
      "metadata": {
        "listType": "ordered"
      }
    },
    {
      "id": "block_8",
      "type": "quote",
      "content": "A formalização é o primeiro passo para o crescimento sustentável do seu negócio.",
      "order": 8,
      "metadata": {
        "quoteAuthor": "Maria Santos, Consultora Contábil"
      }
    }
  ]
}
```

## Metadados por Tipo de Bloco

### Title & Subtitle
- `level`: Nível do título (1-6, onde 1 = H1, 2 = H2, etc.)
- `alignment`: Alinhamento do texto ("left", "center", "right")

### Image
- `imageAlt`: Texto alternativo para acessibilidade
- `imageCaption`: Legenda da imagem
- `alignment`: Alinhamento da imagem

### List
- `listType`: Tipo de lista ("ordered" ou "unordered")
- `alignment`: Alinhamento da lista

### Quote
- `quoteAuthor`: Autor da citação
- `alignment`: Alinhamento da citação

## Endpoints da API

### Criar Post com Blocos
```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Título do Post",
  "excerpt": "Resumo do post",
  "categoryId": 1,
  "contentBlocks": [...]
}
```

### Atualizar Post com Blocos
```http
PUT /api/posts/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Título Atualizado",
  "contentBlocks": [...]
}
```

### Buscar Post (inclui blocos)
```http
GET /api/posts/{id}
GET /api/posts/slug/{slug}
```

## Validações

### Regras dos Blocos
1. **Ordem**: Cada bloco deve ter um `order` único
2. **Tipo**: Apenas tipos válidos são aceitos
3. **Conteúdo**: Conteúdo não pode estar vazio
4. **ID**: ID único é gerado automaticamente se não fornecido

### Validações Específicas
- **Títulos**: Nível deve estar entre 1 e 6
- **Imagens**: Alt text é obrigatório
- **Listas**: Tipo deve ser "ordered" ou "unordered"

## Compatibilidade

### Campo `content` Removido
O campo `content` tradicional foi removido para simplificar o sistema. Todos os posts agora usam exclusivamente o sistema de blocos de conteúdo.

### Campo `contentBlocks` Obrigatório
O campo `contentBlocks` é agora obrigatório para todos os posts. Não é possível criar um post sem blocos de conteúdo.

### Validação Rigorosa
- **Mínimo**: Pelo menos 1 bloco de conteúdo é obrigatório
- **Estrutura**: Cada bloco deve ter tipo, conteúdo e ordem válidos
- **Tipos**: Apenas tipos de bloco suportados são aceitos

## Exemplos de Uso

### 1. Post com Blocos (Obrigatório)
```json
{
  "title": "Post Estruturado",
  "excerpt": "Resumo do post",
  "contentBlocks": [
    {
      "type": "title",
      "content": "Título Principal",
      "order": 1
    },
    {
      "type": "paragraph",
      "content": "Conteúdo do parágrafo",
      "order": 2
    }
  ],
  "categoryId": 1
}
```

### 2. Post Completo com Múltiplos Blocos
```json
{
  "title": "Guia Completo MEI",
  "excerpt": "Aprenda tudo sobre MEI",
  "contentBlocks": [
    {
      "type": "title",
      "content": "Como Abrir uma Empresa MEI",
      "order": 1,
      "metadata": {
        "level": 1,
        "alignment": "center"
      }
    },
    {
      "type": "paragraph",
      "content": "O MEI é uma das formas mais simples de formalizar um negócio no Brasil.",
      "order": 2
    },
    {
      "type": "image",
      "content": "https://exemplo.com/imagem-mei.jpg",
      "order": 3,
      "metadata": {
        "imageAlt": "Processo de abertura MEI",
        "imageCaption": "Passo a passo simplificado"
      }
    }
  ],
  "categoryId": 1
}
```

## Benefícios

1. **Flexibilidade**: Controle total sobre a estrutura do conteúdo
2. **Organização**: Conteúdo organizado em blocos lógicos
3. **Reutilização**: Blocos podem ser reordenados facilmente
4. **Rich Content**: Suporte a diferentes tipos de mídia
5. **Compatibilidade**: Funciona com posts existentes
6. **Performance**: Índices otimizados para consultas JSONB

## Próximos Passos

- [ ] Editor visual no frontend
- [ ] Templates de blocos pré-definidos
- [ ] Drag & drop para reordenação
- [ ] Preview em tempo real
- [ ] Exportação para diferentes formatos

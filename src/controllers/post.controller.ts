import { Request, Response } from 'express';
import { Post, Category, User, Tag, PostTag } from '../config/db';
import { Op } from 'sequelize';

// Função para gerar slug a partir do título
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Função para gerar slug único
const generateUniqueSlug = async (title: string, excludeId?: number): Promise<string> => {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;

  while (true) {
    const whereClause: any = { slug: uniqueSlug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingPost = await Post.findOne({ where: whereClause });
    if (!existingPost) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Função para atualizar contador de posts da categoria
const updateCategoryPostsCount = async (categoryId: number) => {
  try {
    // Contar posts da categoria
    const count = await Post.count({ 
      where: { categoryId } 
    });
    
    console.log(`Atualizando contador da categoria ${categoryId}: ${count} posts`);
    
    // Atualizar o contador na categoria
    const [affectedRows] = await Category.update(
      { postsCount: count }, 
      { where: { id: categoryId } }
    );
    
    if (affectedRows > 0) {
      console.log(`Contador da categoria ${categoryId} atualizado para ${count}`);
    } else {
      console.warn(`Categoria ${categoryId} não encontrada para atualizar contador`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar contador da categoria ${categoryId}:`, error);
    throw error;
  }
};

// Função para atualizar contador de posts das tags
const updateTagPostsCount = async (tagIds: number[]) => {
  for (const tagId of tagIds) {
    const count = await PostTag.count({ where: { tagId } });
    await Tag.update({ postsCount: count }, { where: { id: tagId } });
  }
};

// Função para processar tags de um post
const processPostTags = async (postId: number, tagIds: number[]) => {
  // Remover relacionamentos existentes
  await PostTag.destroy({ where: { postId } });
  
  // Adicionar novos relacionamentos
  if (tagIds && tagIds.length > 0) {
    const postTags = tagIds.map(tagId => ({ postId, tagId }));
    await PostTag.bulkCreate(postTags);
  }
  
  // Atualizar contadores das tags
  if (tagIds && tagIds.length > 0) {
    await updateTagPostsCount(tagIds);
  }
};

// Função para validar e processar blocos de conteúdo
const validateAndProcessContentBlocks = (contentBlocks: any[]): any[] => {
  if (!Array.isArray(contentBlocks)) {
    throw new Error('Content blocks deve ser um array');
  }

  // Ordenar blocos por ordem
  const sortedBlocks = contentBlocks.sort((a, b) => a.order - b.order);

  // Validar cada bloco
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    
    if (!block.type || !block.content || typeof block.order !== 'number') {
      throw new Error(`Bloco ${i + 1}: deve ter type, content e order`);
    }

    if (!['title', 'paragraph', 'image', 'subtitle', 'list', 'quote'].includes(block.type)) {
      throw new Error(`Bloco ${i + 1}: tipo inválido '${block.type}'`);
    }

    // Gerar ID único se não existir
    if (!block.id) {
      block.id = `block_${Date.now()}_${i}`;
    }

    // Validar metadados específicos por tipo
    switch (block.type) {
      case 'title':
      case 'subtitle':
        if (block.metadata?.level && (block.metadata.level < 1 || block.metadata.level > 6)) {
          throw new Error(`Bloco ${i + 1}: nível de título deve ser entre 1 e 6`);
        }
        break;
      case 'image':
        if (!block.metadata?.imageAlt) {
          block.metadata = { ...block.metadata, imageAlt: 'Imagem do post' };
        }
        break;
      case 'list':
        if (block.metadata?.listType && !['ordered', 'unordered'].includes(block.metadata.listType)) {
          throw new Error(`Bloco ${i + 1}: tipo de lista deve ser 'ordered' ou 'unordered'`);
        }
        break;
    }
  }

  return sortedBlocks;
};



// GET /api/posts - Listar todos os posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      status, 
      categoryId, 
      featured, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    
    // Filtros
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }

    // Ordenação
    const orderClause: any = [];
    if (sortBy === 'publishedAt') {
      orderClause.push(['publishedAt', sortOrder]);
    } else if (sortBy === 'views') {
      orderClause.push(['views', sortOrder]);
    } else if (sortBy === 'title') {
      orderClause.push(['title', sortOrder]);
    } else {
      orderClause.push(['createdAt', sortOrder]);
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ],
      order: orderClause,
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/posts/:id - Buscar post por ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Incrementar visualizações se o post estiver publicado
    if (post.status === 'published') {
      await post.increment('views');
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/posts/slug/:slug - Buscar post por slug
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Incrementar visualizações se o post estiver publicado
    if (post.status === 'published') {
      await post.increment('views');
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Erro ao buscar post por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// POST /api/posts - Criar novo post
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      excerpt,
      contentBlocks,
      status = 'draft',
      image,
      categoryId,
      tagIds
    } = req.body;

    // Validações
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Título do post é obrigatório'
      });
    }

    if (!contentBlocks || !Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Blocos de conteúdo são obrigatórios'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Categoria é obrigatória'
      });
    }

    // Verificar se a categoria existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(title);

    // Definir data de publicação se o status for 'published'
    const publishedAt = status === 'published' ? new Date() : undefined;

    // Processar blocos de conteúdo
    let processedContentBlocks: any[] = [];
    try {
      processedContentBlocks = validateAndProcessContentBlocks(contentBlocks);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: `Erro nos blocos de conteúdo: ${error.message}`
      });
    }

    // Criar post
    const post = await Post.create({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || '',
      contentBlocks: processedContentBlocks,
      status,
      image: image?.trim() || null,
      authorId: (req as any).user.userId, // ID do usuário autenticado
      categoryId,
      publishedAt
    });

    // Atualizar contador de posts da categoria
    await updateCategoryPostsCount(categoryId);

    // Processar tags do post
    if (tagIds && tagIds.length > 0) {
      await processPostTags(post.id, tagIds);
    }

    // Buscar post com relacionamentos
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Post criado com sucesso',
      data: createdPost
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// PUT /api/posts/:id - Atualizar post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      contentBlocks,
      status,
      image,
      categoryId,
      tagIds
    } = req.body;

    // Buscar post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Validações
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Título do post é obrigatório'
      });
    }

    if (!contentBlocks || !Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Blocos de conteúdo são obrigatórios'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Categoria é obrigatória'
      });
    }

    // Verificar se a categoria existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Processar blocos de conteúdo
    let processedContentBlocks: any[] = [];
    try {
      processedContentBlocks = validateAndProcessContentBlocks(contentBlocks);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: `Erro nos blocos de conteúdo: ${error.message}`
      });
    }

    // Gerar slug único se o título mudou
    let slug = post.slug;
    if (title.trim() !== post.title) {
      slug = await generateUniqueSlug(title, Number(id));
    }

    // Definir data de publicação
    let publishedAt = post.publishedAt;
    if (status === 'published' && post.status !== 'published') {
      publishedAt = new Date();
    } else if (status !== 'published') {
      publishedAt = undefined;
    }

    // Salvar categoria anterior para atualizar contador
    const previousCategoryId = post.categoryId;

    // Atualizar post
    await post.update({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || '',
      contentBlocks: processedContentBlocks,
      status,
      image: image?.trim() || null,
      categoryId,
      publishedAt
    });

    // Atualizar contadores de posts das categorias
    if (previousCategoryId !== categoryId) {
      await updateCategoryPostsCount(previousCategoryId);
      await updateCategoryPostsCount(categoryId);
    }

    // Processar tags do post
    if (tagIds && tagIds.length > 0) {
      await processPostTags(post.id, tagIds);
    }

    // Buscar post atualizado com relacionamentos
    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      message: 'Post atualizado com sucesso',
      data: updatedPost
    });
  } catch (error: any) {
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// DELETE /api/posts/:id - Excluir post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Iniciando exclusão do post ${id}`);

    // Buscar post com tags para atualizar contadores
    const post = await Post.findByPk(id, {
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id']
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Salvar categoria para atualizar contador
    const categoryId = post.categoryId;
    console.log(`Post ${id} pertence à categoria ${categoryId}`);
    
    // Salvar IDs das tags para atualizar contadores
    const tagIds = (post as any).tags?.map((tag: any) => tag.id) || [];
    console.log(`Post ${id} tem ${tagIds.length} tags:`, tagIds);

    // Excluir post (isso automaticamente excluirá os relacionamentos devido ao CASCADE)
    console.log(`Excluindo post ${id}...`);
    await post.destroy();
    console.log(`Post ${id} excluído com sucesso`);

    // Atualizar contador de posts da categoria
    console.log(`Atualizando contador da categoria ${categoryId} após exclusão...`);
    await updateCategoryPostsCount(categoryId);
    
    // Atualizar contadores das tags
    if (tagIds.length > 0) {
      console.log(`Atualizando contadores das tags após exclusão...`);
      await updateTagPostsCount(tagIds);
    }

    console.log(`Exclusão do post ${id} concluída com sucesso`);

    res.json({
      success: true,
      message: 'Post excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// PUT /api/posts/:id/status - Atualizar status do post
export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validações
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Buscar post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Definir data de publicação
    let publishedAt = post.publishedAt;
    if (status === 'published' && post.status !== 'published') {
      publishedAt = new Date();
    } else if (status !== 'published') {
      publishedAt = undefined;
    }

    // Atualizar status
    await post.update({ status, publishedAt });

    // Atualizar contador de posts da categoria (caso o status tenha mudado)
    await updateCategoryPostsCount(post.categoryId);

    res.json({
      success: true,
      message: 'Status do post atualizado com sucesso',
      data: { status, publishedAt }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/posts/tag/:tagId - Buscar posts por tag
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se a tag existe
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    // Ordenação
    const orderClause: any = [];
    if (sortBy === 'publishedAt') {
      orderClause.push(['publishedAt', sortOrder]);
    } else if (sortBy === 'views') {
      orderClause.push(['views', sortOrder]);
    } else if (sortBy === 'title') {
      orderClause.push(['title', sortOrder]);
    } else {
      orderClause.push(['createdAt', sortOrder]);
    }

    // Buscar posts que têm a tag especificada
    const { count, rows: posts } = await Post.findAndCountAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] },
          where: { id: tagId }
        }
      ],
      where: { status: 'published' }, // Apenas posts publicados
      order: orderClause,
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        tag: {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
          description: tag.description
        },
        posts
      },
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts por tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// PATCH /api/posts/:id/views - Incrementar visualizações
export const incrementViews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Incrementar visualizações
    await post.increment('views');
    
    // Buscar o post atualizado para retornar o novo valor
    const updatedPost = await Post.findByPk(id);
    
    res.json({
      success: true,
      message: 'Visualizações incrementadas com sucesso',
      data: {
        id: updatedPost?.id,
        views: updatedPost?.views
      }
    });
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};



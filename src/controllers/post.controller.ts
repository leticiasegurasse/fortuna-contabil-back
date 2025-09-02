import { Request, Response } from 'express';
import { Post, Category, User } from '../config/db';
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
  const count = await Post.count({ where: { categoryId } });
  await Category.update({ postsCount: count }, { where: { id: categoryId } });
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
      content,
      status = 'draft',
      image,
      categoryId
    } = req.body;

    // Validações
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Título do post é obrigatório'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conteúdo do post é obrigatório'
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

    // Criar post
    const post = await Post.create({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || '',
      content: content.trim(),
      status,
      image: image?.trim() || null,
      authorId: (req as any).user.userId, // ID do usuário autenticado
      categoryId,
      publishedAt
    });

    // Atualizar contador de posts da categoria
    await updateCategoryPostsCount(categoryId);

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
      content,
      status,
      image,
      categoryId
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

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conteúdo do post é obrigatório'
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
      content: content.trim(),
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
        }
      ]
    });

    res.json({
      success: true,
      message: 'Post atualizado com sucesso',
      data: updatedPost
    });
  } catch (error) {
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

    // Buscar post
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Salvar categoria para atualizar contador
    const categoryId = post.categoryId;

    // Excluir post
    await post.destroy();

    // Atualizar contador de posts da categoria
    await updateCategoryPostsCount(categoryId);

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



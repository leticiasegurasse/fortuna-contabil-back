import { Request, Response } from 'express';
import { Tag, Post, PostTag, User } from '../config/db';
import { Op } from 'sequelize';

// Função para gerar slug a partir do nome
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Função para gerar slug único
const generateUniqueSlug = async (name: string, excludeId?: number): Promise<string> => {
  let slug = generateSlug(name);
  let counter = 1;
  let uniqueSlug = slug;

  while (true) {
    const whereClause: any = { slug: uniqueSlug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingTag = await Tag.findOne({ where: whereClause });
    if (!existingTag) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Função para atualizar contador de posts de uma tag
const updateTagPostsCount = async (tagId: number) => {
  const count = await PostTag.count({ where: { tagId } });
  await Tag.update({ postsCount: count }, { where: { id: tagId } });
};

// Função para atualizar contador de posts de todas as tags
const updateAllTagsPostsCount = async () => {
  const tags = await Tag.findAll();
  for (const tag of tags) {
    await updateTagPostsCount(tag.id);
  }
};

// GET /api/tags - Listar todas as tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10, sort = 'postsCount' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    let orderClause: any = [['postsCount', 'DESC']];
    if (sort === 'name') {
      orderClause = [['name', 'ASC']];
    } else if (sort === 'createdAt') {
      orderClause = [['createdAt', 'DESC']];
    }

    const { count, rows: tags } = await Tag.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: tags,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/tags/popular - Listar tags populares
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const { limit = 10, minPosts = 1 } = req.query;

    const tags = await Tag.findAll({
      where: {
        postsCount: {
          [Op.gte]: Number(minPosts)
        }
      },
      order: [['postsCount', 'DESC']],
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Erro ao buscar tags populares:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/tags/:id - Buscar tag por ID
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Erro ao buscar tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/tags/slug/:slug - Buscar tag por slug
export const getTagBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOne({ where: { slug } });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Erro ao buscar tag por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// POST /api/tags - Criar nova tag
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da tag é obrigatório'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome da tag deve ter no máximo 100 caracteres'
      });
    }

    // Verificar se já existe uma tag com este nome
    const existingTag = await Tag.findOne({ where: { name: name.trim() } });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma tag com este nome'
      });
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(name);

    // Criar tag
    const tag = await Tag.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      color: color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      message: 'Tag criada com sucesso',
      data: tag
    });
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// PUT /api/tags/:id - Atualizar tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Buscar tag
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da tag é obrigatório'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome da tag deve ter no máximo 100 caracteres'
      });
    }

    // Verificar se já existe outra tag com este nome
    const existingTag = await Tag.findOne({
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma tag com este nome'
      });
    }

    // Gerar slug único se o nome mudou
    let slug = tag.slug;
    if (name.trim() !== tag.name) {
      slug = await generateUniqueSlug(name, Number(id));
    }

    // Atualizar tag
    await tag.update({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      color: color || tag.color
    });

    res.json({
      success: true,
      message: 'Tag atualizada com sucesso',
      data: tag
    });
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// DELETE /api/tags/:id - Excluir tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar tag
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    // Verificar se há posts associados
    const postsCount = await PostTag.count({ where: { tagId: id } });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir a tag. Existem ${postsCount} post(s) associado(s).`
      });
    }

    // Excluir tag
    await tag.destroy();

    res.json({
      success: true,
      message: 'Tag excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/tags/:id/posts - Listar posts de uma tag
export const getTagPosts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se a tag existe
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    // Buscar posts da tag
    const whereClause: any = { status };
    if (status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
          where: { id }
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        tag,
        posts,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts da tag:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// POST /api/tags/:id/posts/:postId - Associar tag a um post
export const associateTagToPost = async (req: Request, res: Response) => {
  try {
    const { id: tagId, postId } = req.params;

    // Verificar se a tag existe
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag não encontrada'
      });
    }

    // Verificar se o post existe
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Verificar se a associação já existe
    const existingAssociation = await PostTag.findOne({
      where: { postId: Number(postId), tagId: Number(tagId) }
    });

    if (existingAssociation) {
      return res.status(400).json({
        success: false,
        message: 'Tag já está associada a este post'
      });
    }

    // Criar associação
    await PostTag.create({
      postId: Number(postId),
      tagId: Number(tagId)
    });

    // Atualizar contador de posts da tag
    await updateTagPostsCount(Number(tagId));

    res.status(201).json({
      success: true,
      message: 'Tag associada ao post com sucesso'
    });
  } catch (error) {
    console.error('Erro ao associar tag ao post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// DELETE /api/tags/:id/posts/:postId - Remover associação de tag a um post
export const removeTagFromPost = async (req: Request, res: Response) => {
  try {
    const { id: tagId, postId } = req.params;

    // Verificar se a associação existe
    const association = await PostTag.findOne({
      where: { postId: Number(postId), tagId: Number(tagId) }
    });

    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Associação entre tag e post não encontrada'
      });
    }

    // Remover associação
    await association.destroy();

    // Atualizar contador de posts da tag
    await updateTagPostsCount(Number(tagId));

    res.json({
      success: true,
      message: 'Associação removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover associação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

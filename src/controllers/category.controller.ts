import { Request, Response } from 'express';
import { Category, Post, User } from '../config/db';
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

    const existingCategory = await Category.findOne({ where: whereClause });
    if (!existingCategory) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Função para atualizar contador de posts
const updatePostsCount = async (categoryId: number) => {
  const count = await Post.count({ where: { categoryId } });
  await Category.update({ postsCount: count }, { where: { id: categoryId } });
};

// GET /api/categories - Listar todas as categorias
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: categories,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/categories/:id - Buscar categoria por ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// POST /api/categories - Criar nova categoria
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria deve ter no máximo 100 caracteres'
      });
    }

    // Verificar se já existe uma categoria com este nome
    const existingCategory = await Category.findOne({ where: { name: name.trim() } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com este nome'
      });
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(name);

    // Criar categoria
    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      color: color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: category
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// PUT /api/categories/:id - Atualizar categoria
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Buscar categoria
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Validações
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria deve ter no máximo 100 caracteres'
      });
    }

    // Verificar se já existe outra categoria com este nome
    const existingCategory = await Category.findOne({
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id }
      }
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com este nome'
      });
    }

    // Gerar slug único se o nome mudou
    let slug = category.slug;
    if (name.trim() !== category.name) {
      slug = await generateUniqueSlug(name, Number(id));
    }

    // Atualizar categoria
    await category.update({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      color: color || category.color
    });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: category
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// DELETE /api/categories/:id - Excluir categoria
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar categoria
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se há posts associados
    const postsCount = await Post.count({ where: { categoryId: id } });
    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível excluir a categoria. Existem ${postsCount} post(s) associado(s).`
      });
    }

    // Excluir categoria
    await category.destroy();

    res.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/categories/:id/posts - Listar posts de uma categoria
export const getCategoryPosts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se a categoria existe
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Buscar posts da categoria
    const whereClause: any = { categoryId: id };
    if (status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
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
        category,
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
    console.error('Erro ao buscar posts da categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

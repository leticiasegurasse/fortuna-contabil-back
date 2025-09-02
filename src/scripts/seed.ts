import { Category, Post, User, Tag, PostTag } from '../config/db';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário admin se não existir
    const adminExists = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: 'admin@fortunacontabil.com' },
          { username: 'admin' }
        ]
      } 
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
             await User.create({
         username: 'admin',
         email: 'admin@fortunacontabil.com',
         password: hashedPassword
       });
      console.log('✅ Usuário admin criado');
    } else {
      console.log('ℹ️ Usuário admin já existe');
    }

    // Criar categorias iniciais
    const categories = [
      {
        name: 'Abertura de Empresas',
        slug: 'abertura-empresas',
        description: 'Artigos sobre abertura e formalização de empresas',
        color: '#3B82F6',
        postsCount: 0
      },
      {
        name: 'Imposto de Renda',
        slug: 'imposto-renda',
        description: 'Dicas e orientações sobre declaração de IR',
        color: '#10B981',
        postsCount: 0
      },
      {
        name: 'Consultoria',
        slug: 'consultoria',
        description: 'Serviços de consultoria contábil e empresarial',
        color: '#F59E0B',
        postsCount: 0
      },
      {
        name: 'Legislação',
        slug: 'legislacao',
        description: 'Atualizações e mudanças na legislação',
        color: '#EF4444',
        postsCount: 0
      },
      {
        name: 'Dicas',
        slug: 'dicas',
        description: 'Dicas e orientações para empreendedores',
        color: '#8B5CF6',
        postsCount: 0
      }
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ where: { slug: categoryData.slug } });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Categoria "${categoryData.name}" criada`);
      }
    }

    // Criar tags iniciais
    const tags = [
      {
        name: 'MEI',
        slug: 'mei',
        description: 'Microempreendedor Individual',
        color: '#3A6B52',
        postsCount: 0
      },
      {
        name: 'Abertura de Empresa',
        slug: 'abertura-empresa',
        description: 'Processo de abertura de empresas',
        color: '#C5A46D',
        postsCount: 0
      },
      {
        name: 'Declaração Anual',
        slug: 'declaracao-anual',
        description: 'Declarações anuais obrigatórias',
        color: '#10B981',
        postsCount: 0
      },
      {
        name: 'Imposto de Renda',
        slug: 'imposto-renda',
        description: 'Declaração de IR',
        color: '#EF4444',
        postsCount: 0
      },
      {
        name: 'Finanças',
        slug: 'financas',
        description: 'Gestão financeira empresarial',
        color: '#8B5CF6',
        postsCount: 0
      },
      {
        name: 'Regularização',
        slug: 'regularizacao',
        description: 'Regularização de empresas',
        color: '#F59E0B',
        postsCount: 0
      },
      {
        name: 'Consultoria',
        slug: 'consultoria',
        description: 'Serviços de consultoria',
        color: '#06B6D4',
        postsCount: 0
      },
      {
        name: 'Dicas',
        slug: 'dicas',
        description: 'Dicas para empreendedores',
        color: '#84CC16',
        postsCount: 0
      }
    ];

    for (const tagData of tags) {
      const existingTag = await Tag.findOne({ where: { slug: tagData.slug } });
      if (!existingTag) {
        await Tag.create(tagData);
        console.log(`✅ Tag "${tagData.name}" criada`);
      }
    }

    console.log('✅ Seed do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
};

export default seedDatabase;

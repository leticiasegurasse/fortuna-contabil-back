import { Category, Post, User } from '../config/db';
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

    console.log('✅ Seed do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
};

export default seedDatabase;

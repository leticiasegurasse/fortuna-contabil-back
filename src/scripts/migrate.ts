import { sequelize } from '../config/db';

const migrateDatabase = async () => {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');

    // Criar tabela newsletter se não existir
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS newsletters (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "subscribedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "unsubscribedAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      // Criar índices se não existirem
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
        CREATE INDEX IF NOT EXISTS idx_newsletters_isActive ON newsletters("isActive");
        CREATE INDEX IF NOT EXISTS idx_newsletters_subscribedAt ON newsletters("subscribedAt");
      `);

      console.log('✅ Tabela newsletter criada/verificada com sucesso');
    } catch (error) {
      console.log('⚠️ Aviso: Erro ao criar tabela newsletter (pode já existir):', error);
    }

    // Verificar se o campo contentBlocks existe
    const [contentBlocksResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND column_name = 'contentblocks'
    `);

    if ((contentBlocksResults as any[]).length === 0) {
      console.log('📝 Adicionando campo contentBlocks...');
      
      await sequelize.query(`
        ALTER TABLE posts 
        ADD COLUMN contentblocks JSONB DEFAULT '[]'::jsonb
      `);

      // Criar índice GIN para o campo JSONB
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_posts_contentblocks 
        ON posts USING gin (contentblocks)
      `);

      console.log('✅ Campo contentBlocks adicionado com sucesso');
    } else {
      console.log('ℹ️ Campo contentBlocks já existe');
    }

    // Verificar se o campo content ainda existe
    const [contentResults] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND column_name = 'content'
    `);

    if ((contentResults as any[]).length > 0) {
      console.log('🗑️ Removendo campo content...');
      
      // Remover o campo content
      await sequelize.query(`
        ALTER TABLE posts 
        DROP COLUMN content
      `);

      console.log('✅ Campo content removido com sucesso');
    } else {
      console.log('ℹ️ Campo content já foi removido');
    }

    // Tornar contentBlocks obrigatório
    console.log('🔒 Tornando contentBlocks obrigatório...');
    await sequelize.query(`
      ALTER TABLE posts 
      ALTER COLUMN contentblocks SET NOT NULL
    `);

    console.log('✅ Campo contentBlocks agora é obrigatório');

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
};

export default migrateDatabase;

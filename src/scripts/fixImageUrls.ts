import { sequelize } from '../config/db';

/**
 * Script para corrigir URLs de imagens que contêm localhost
 * Converte URLs com localhost para URLs de produção
 */
const fixImageUrls = async () => {
  try {
    console.log('🔄 Iniciando correção de URLs de imagens...');

    // Buscar todos os posts que contêm URLs com localhost
    const [postsWithLocalhost] = await sequelize.query(`
      SELECT id, title, contentblocks, image
      FROM posts 
      WHERE (
        contentblocks::text LIKE '%localhost%' 
        OR image LIKE '%localhost%'
      )
    `);

    console.log(`📊 Encontrados ${(postsWithLocalhost as any[]).length} posts com URLs localhost`);

    if ((postsWithLocalhost as any[]).length === 0) {
      console.log('✅ Nenhuma URL localhost encontrada. Nada para corrigir.');
      return;
    }

    let fixedCount = 0;

    for (const post of postsWithLocalhost as any[]) {
      let needsUpdate = false;
      let updatedContentBlocks = post.contentblocks;
      let updatedImage = post.image;

      // Corrigir URL da imagem principal
      if (post.image && post.image.includes('localhost')) {
        const path = post.image.split('/uploads/')[1];
        if (path) {
          updatedImage = `https://api.fortunacontabil.com.br/uploads/${path}`;
          needsUpdate = true;
          console.log(`🖼️ Corrigindo imagem principal do post "${post.title}"`);
        }
      }

      // Corrigir URLs nos contentBlocks
      if (post.contentblocks && Array.isArray(post.contentblocks)) {
        updatedContentBlocks = post.contentblocks.map((block: any) => {
          if (block.type === 'image' && block.content && block.content.includes('localhost')) {
            const path = block.content.split('/uploads/')[1];
            if (path) {
              console.log(`🖼️ Corrigindo imagem no contentBlock do post "${post.title}"`);
              return {
                ...block,
                content: `https://api.fortunacontabil.com.br/uploads/${path}`
              };
            }
          }
          return block;
        });
        needsUpdate = true;
      }

      // Atualizar o post se necessário
      if (needsUpdate) {
        await sequelize.query(`
          UPDATE posts 
          SET 
            contentblocks = :contentblocks,
            image = :image,
            "updatedAt" = NOW()
          WHERE id = :id
        `, {
          replacements: {
            id: post.id,
            contentblocks: JSON.stringify(updatedContentBlocks),
            image: updatedImage
          }
        });

        fixedCount++;
        console.log(`✅ Post "${post.title}" corrigido`);
      }
    }

    console.log(`🎉 Correção concluída! ${fixedCount} posts foram atualizados.`);

  } catch (error) {
    console.error('❌ Erro durante a correção das URLs:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  fixImageUrls()
    .then(() => {
      console.log('✅ Script de correção de URLs executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

export default fixImageUrls;

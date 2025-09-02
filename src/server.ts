import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/db';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import postRoutes from './routes/post.routes';
import tagRoutes from './routes/tag.routes';
import newsletterRoutes from './routes/newsletter.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import seedDatabase from './scripts/seed';

dotenv.config();

const app = express();

// Middlewares de segurança e parsing
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API da Fortuna Contábil funcionando! 🚀' });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas (deve vir antes do errorHandler)
app.use(notFoundHandler);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Conexão com banco de dados e seed
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    // Executar seed se não estiver em produção
    if (process.env.NODE_ENV !== 'production') {
      seedDatabase();
    }
  })
  .catch(err => console.error('❌ Não foi possível conectar ao banco de dados:', err));

const PORT = process.env.PORT || '3001';

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Endpoints disponíveis:`);
  console.log(`   🔐 Autenticação:`);
  console.log(`      POST /api/auth/register - Registrar usuário`);
  console.log(`      POST /api/auth/login - Fazer login`);
  console.log(`      POST /api/auth/logout - Fazer logout`);
  console.log(`      POST /api/auth/refresh - Renovar token`);
  console.log(`      POST /api/auth/forgot-password - Esqueci a senha`);
  console.log(`      POST /api/auth/reset-password - Redefinir senha`);
  console.log(`      GET  /api/auth/verify-token - Verificar token (protegido)`);
  console.log(`      GET  /api/auth/profile - Perfil do usuário (protegido)`);
  console.log(`      PUT  /api/auth/profile - Atualizar perfil (protegido)`);
  console.log(`      POST /api/auth/change-password - Alterar senha (protegido)`);
  console.log(`   📝 Blog - Categorias:`);
  console.log(`      GET  /api/categories - Listar categorias`);
  console.log(`      GET  /api/categories/:id - Buscar categoria`);
  console.log(`      GET  /api/categories/:id/posts - Posts da categoria`);
  console.log(`      POST /api/categories - Criar categoria (protegido)`);
  console.log(`      PUT  /api/categories/:id - Atualizar categoria (protegido)`);
  console.log(`      DELETE /api/categories/:id - Excluir categoria (protegido)`);
  console.log(`   📝 Blog - Posts:`);
  console.log(`      GET  /api/posts - Listar posts`);
  console.log(`      GET  /api/posts/:id - Buscar post por ID`);
  console.log(`      GET  /api/posts/slug/:slug - Buscar post por slug`);
  console.log(`      POST /api/posts - Criar post (protegido)`);
  console.log(`      PUT  /api/posts/:id - Atualizar post (protegido)`);
  console.log(`      DELETE /api/posts/:id - Excluir post (protegido)`);
  console.log(`      PUT  /api/posts/:id/status - Atualizar status (protegido)`);
  console.log(`   🏷️ Blog - Tags:`);
  console.log(`      GET  /api/tags - Listar todas as tags`);
  console.log(`      GET  /api/tags/popular - Listar tags populares`);
  console.log(`      GET  /api/tags/:id - Buscar tag por ID`);
  console.log(`      GET  /api/tags/slug/:slug - Buscar tag por slug`);
  console.log(`      GET  /api/tags/:id/posts - Posts de uma tag`);
  console.log(`      POST /api/tags - Criar tag (protegido)`);
  console.log(`      PUT  /api/tags/:id - Atualizar tag (protegido)`);
  console.log(`      DELETE /api/tags/:id - Excluir tag (protegido)`);
  console.log(`      POST /api/tags/:id/posts/:postId - Associar tag a post (protegido)`);
  console.log(`      DELETE /api/tags/:id/posts/:postId - Remover tag de post (protegido)`);
  console.log(`   📧 Newsletter:`);
  console.log(`      POST /api/newsletter/subscribe - Inscrever na newsletter`);
  console.log(`      POST /api/newsletter/unsubscribe - Cancelar inscrição`);
  console.log(`      GET  /api/newsletter/check/:email - Verificar status de inscrição`);
  console.log(`      GET  /api/newsletter/subscribers - Listar inscritos (protegido)`);
  console.log(`      GET  /api/newsletter/stats - Estatísticas da newsletter (protegido)`);
  console.log(`   🏥 Sistema:`);
  console.log(`      GET  /api/health - Health check`);
});

export default app;

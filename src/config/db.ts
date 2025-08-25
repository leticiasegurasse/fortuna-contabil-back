import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco de dados usando DB_URL ou parâmetros individuais
const sequelize = new Sequelize(
    process.env.DB_URL || 
    `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'pesquisa_mercado'}`,
    {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

// Importar e registrar modelos
import UserFactory from '../models/user.model';

const User = UserFactory(sequelize);

// Sincronizar modelos com o banco de dados
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados com o banco de dados');
    } catch (error) {
        console.error('❌ Erro ao sincronizar modelos:', error);
    }
};

// Executar sincronização se não estiver em produção
if (process.env.NODE_ENV !== 'production') {
    syncDatabase();
}

export { sequelize, User };
export default sequelize;

import { DataTypes, Model, Sequelize } from 'sequelize';

// Interface para o modelo de Usuário
interface UserAttributes {
    id?: number;
    username: string;
    password: string;
    email?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Modelo de Usuário (para autenticação)
export default (sequelize: Sequelize) => {
    class User extends Model<UserAttributes> implements UserAttributes {
        public id!: number;
        public username!: string;
        public password!: string;
        public email?: string;
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                validate: {
                    len: [3, 50],
                    notEmpty: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [6, 255],
                    notEmpty: true,
                },
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['username'],
                },
                {
                    unique: true,
                    fields: ['email'],
                },
            ],
        }
    );

    return User;
};

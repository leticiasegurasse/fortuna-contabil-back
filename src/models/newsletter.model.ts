import { DataTypes, Model, Sequelize } from 'sequelize';

interface NewsletterAttributes {
  id: number;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

interface NewsletterCreationAttributes {
  email: string;
  isActive?: boolean;
}

const NewsletterFactory = (sequelize: Sequelize) => {
  class Newsletter extends Model<NewsletterAttributes, NewsletterCreationAttributes> {
    declare id: number;
    declare email: string;
    declare isActive: boolean;
    declare subscribedAt: Date;
    declare unsubscribedAt?: Date;
  }

  Newsletter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Email deve ser um endereço válido'
          },
          notEmpty: {
            msg: 'Email é obrigatório'
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      subscribedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      unsubscribedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'Newsletter',
      tableName: 'newsletters',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          fields: ['isActive']
        }
      ]
    }
  );

  return Newsletter;
};

export default NewsletterFactory;

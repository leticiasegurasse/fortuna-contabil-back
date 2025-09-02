import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface PostAttributes {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  image?: string;
  views: number;
  authorId: number;
  categoryId: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'views' | 'publishedAt' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize) => {
  class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public excerpt!: string;
    public content!: string;
    public status!: 'draft' | 'published' | 'archived';
    public image?: string;
    public views!: number;
    public authorId!: number;
    public categoryId!: number;
    public publishedAt?: Date;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200],
        },
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 200],
        },
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'posts',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['slug'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['authorId'],
        },
        {
          fields: ['categoryId'],
        },
        {
          fields: ['publishedAt'],
        },
      ],
    }
  );

  return Post;
};

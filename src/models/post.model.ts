import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Interface para blocos de conteúdo
interface ContentBlock {
  id: string;
  type: 'title' | 'paragraph' | 'image' | 'subtitle' | 'list' | 'quote';
  content: string;
  order: number;
  metadata?: {
    level?: number; // Para títulos (h1, h2, h3, etc.)
    alignment?: 'left' | 'center' | 'right';
    imageAlt?: string; // Para imagens
    imageCaption?: string; // Para imagens
    listType?: 'ordered' | 'unordered'; // Para listas
    quoteAuthor?: string; // Para citações
    [key: string]: any; // Para outros metadados
  };
}

interface PostAttributes {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  contentBlocks: ContentBlock[]; // Novo campo para conteúdo estruturado
  status: 'draft' | 'published' | 'archived';
  image?: string; // Imagem principal do post
  views: number;
  authorId: number;
  categoryId: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'views' | 'publishedAt' | 'createdAt' | 'updatedAt' | 'contentBlocks'> {}

export default (sequelize: Sequelize) => {
  class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public excerpt!: string;
    public contentBlocks!: ContentBlock[];
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
      contentBlocks: {
        type: DataTypes.JSONB, // Usar JSONB para melhor performance
        allowNull: false, // Agora é obrigatório
        defaultValue: [],
        validate: {
          isValidContentBlocks(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Content blocks deve ser um array');
            }
            if (value.length === 0) {
              throw new Error('Content blocks não pode estar vazio');
            }
            for (const block of value) {
              if (!block.type || !block.content || typeof block.order !== 'number') {
                throw new Error('Cada bloco deve ter type, content e order');
              }
              if (!['title', 'paragraph', 'image', 'subtitle', 'list', 'quote'].includes(block.type)) {
                throw new Error('Tipo de bloco inválido');
              }
            }
          }
        }
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
        {
          fields: ['contentBlocks'],
          using: 'gin', // Índice GIN para JSONB
        },
      ],
    }
  );

  return Post;
};

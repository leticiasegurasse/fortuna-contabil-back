import { DataTypes, Model, Sequelize } from 'sequelize';

interface PostTagAttributes {
  postId: number;
  tagId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default (sequelize: Sequelize) => {
  class PostTag extends Model<PostTagAttributes> implements PostTagAttributes {
    public postId!: number;
    public tagId!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  PostTag.init(
    {
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      tableName: 'post_tags',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['postId', 'tagId'],
        },
        {
          fields: ['postId'],
        },
        {
          fields: ['tagId'],
        },
      ],
    }
  );

  return PostTag;
};

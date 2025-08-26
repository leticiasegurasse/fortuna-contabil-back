import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  postsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'postsCount' | 'createdAt' | 'updatedAt'> {}

export default (sequelize: Sequelize) => {
  class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public description!: string;
    public color!: string;
    public postsCount!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(7), // #RRGGBB format
        allowNull: false,
        defaultValue: '#3B82F6',
        validate: {
          is: /^#[0-9A-F]{6}$/i, // Validates hex color format
        },
      },
      postsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      tableName: 'categories',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['slug'],
        },
        {
          fields: ['name'],
        },
      ],
    }
  );

  return Category;
};

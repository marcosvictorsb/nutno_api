import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Lead extends Model {
  public id!: number;
  public name!: string | null;
  public email!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Lead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'leads',
    timestamps: true,
  }
);

export default Lead;

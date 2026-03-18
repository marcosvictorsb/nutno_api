import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

class Nutricionista extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public crn?: string; // Conselho Regional de Nutricionista
  public telefone?: string;
  public especialidade?: string;
  public bio?: string;
  public ativo!: boolean;
  public caminho_foto?: string;
  public senha!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date;
  public reset_password_token?: string;
  public reset_password_expires?: Date;
}

Nutricionista.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    crn: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    especialidade: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    caminho_foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'nutricionistas',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
  }
);

export default Nutricionista;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

class Plano extends Model {
  public id!: number;
  public nome_plano!: string;
  public valor!: number;
  public gratuito!: boolean;
  public data_criacao!: Date;
  public data_atualizacao!: Date;
  public deletado_em?: Date;
}

Plano.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_plano: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    gratuito: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    data_criacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    data_atualizacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'planos',
    timestamps: false,
    underscored: true,
    paranoid: true,
    deletedAt: 'deletado_em',
  }
);

export default Plano;

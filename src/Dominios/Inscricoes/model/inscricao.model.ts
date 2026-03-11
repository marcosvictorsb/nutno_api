import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

class Inscricao extends Model {
  public id!: number;
  public id_nutricionista!: number;
  public id_plano!: number;
  public data_inicio!: Date;
  public data_vencimento?: Date;
  public ativo!: boolean;
  public metodo_pagamento?: string;
  public criado_em!: Date;
  public atualizado_em!: Date;
  public deletado_em?: Date;
}

Inscricao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
    },
    id_plano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'planos',
        key: 'id',
      },
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metodo_pagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    atualizado_em: {
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
    tableName: 'inscricoes',
    timestamps: false,
    underscored: true,
    paranoid: true,
    deletedAt: 'deletado_em',
  }
);

export default Inscricao;

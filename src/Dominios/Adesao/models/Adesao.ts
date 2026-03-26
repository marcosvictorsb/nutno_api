import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';
import type PlanoAlimentar from '../../PlanoAlimentar/models/PlanoAlimentar';
import type Refeicao from '../../PlanoAlimentar/models/Refeicao';

type StatusAdesao = 'seguiu' | 'parcial' | 'pulou';

class Adesao extends Model {
  public id!: number;
  public plano_alimentar_id!: number;
  public refeicao_id!: number;
  public paciente_id!: number;
  public data!: string;
  public status!: StatusAdesao;
  public observacao?: string;
  public criado_em!: Date;
  public atualizado_em!: Date;

  // Associações
  public plano_alimentar?: PlanoAlimentar;
  public refeicao?: Refeicao;
}

Adesao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plano_alimentar_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'planos_alimentares',
        key: 'id',
      },
    },
    refeicao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'refeicoes',
        key: 'id',
      },
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id',
      },
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('seguiu', 'parcial', 'pulou'),
      allowNull: false,
    },
    observacao: {
      type: DataTypes.TEXT,
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
  },
  {
    sequelize,
    tableName: 'adesoes',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    paranoid: false,
  }
);

export default Adesao;

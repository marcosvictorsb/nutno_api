import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';
import type Adesao from '../../Adesao/models/Adesao';
import type ItemRefeicao from './ItemRefeicao';
import type PlanoAlimentar from './PlanoAlimentar';

class Refeicao extends Model {
  public id!: number;
  public plano_alimentar_id!: number;
  public nome!: string;
  public horario_sugerido?: string;
  public ordem!: number;
  public observacoes?: string;
  public criado_em!: Date;
  public atualizado_em!: Date;
  public deletado_em?: Date;

  // Associações
  public plano_alimentar?: PlanoAlimentar;
  public itens?: ItemRefeicao[];
  public adesoes?: Adesao[];
}

Refeicao.init(
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    horario_sugerido: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observacoes: {
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
    deletado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'refeicoes',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

export default Refeicao;

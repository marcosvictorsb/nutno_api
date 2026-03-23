import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';
import type Refeicao from './Refeicao';

type StatusPlano = 'rascunho' | 'enviado' | 'ativo' | 'arquivado';

class PlanoAlimentar extends Model {
  public id!: number;
  public id_paciente!: number;
  public id_nutricionista!: number;
  public nome!: string;
  public objetivo!: string;
  public observacoes?: string;
  public calorias_objetivo!: number;
  public proteinas_objetivo_pct!: number;
  public carboidratos_objetivo_pct!: number;
  public gorduras_objetivo_pct!: number;
  public status!: StatusPlano;
  public token_visualizacao!: string;
  public enviado_em?: Date;
  public criado_em!: Date;
  public atualizado_em!: Date;
  public deletado_em?: Date;

  // Associações
  public refeicoes?: Refeicao[];
}

PlanoAlimentar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    objetivo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    calorias_objetivo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    proteinas_objetivo_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    carboidratos_objetivo_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    gorduras_objetivo_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'enviado', 'ativo', 'arquivado'),
      allowNull: false,
      defaultValue: 'rascunho',
    },
    token_visualizacao: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    enviado_em: {
      type: DataTypes.DATE,
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
    tableName: 'planos_alimentares',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    deletedAt: 'deletado_em',
  }
);

export default PlanoAlimentar;

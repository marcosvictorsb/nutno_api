import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type UnidadeMedida = 'g' | 'ml' | 'unidade' | 'colher' | 'xicara';

class ItemRefeicao extends Model {
  public id!: number;
  public id_refeicao!: number;
  public id_alimento!: number;
  public quantidade!: number;
  public unidade!: UnidadeMedida;
  public calorias_calculadas?: number;
  public proteinas_calculadas?: number;
  public carboidratos_calculados?: number;
  public gorduras_calculadas?: number;
  public observacoes?: string;
  public criado_em!: Date;
  public atualizado_em!: Date;
  public deletado_em?: Date;
}

ItemRefeicao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_refeicao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'refeicoes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    id_alimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'alimentos',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unidade: {
      type: DataTypes.ENUM('g', 'ml', 'unidade', 'colher', 'xicara'),
      allowNull: false,
    },
    calorias_calculadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    proteinas_calculadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    carboidratos_calculados: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gorduras_calculadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
    tableName: 'itens_refeicao',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

export default ItemRefeicao;

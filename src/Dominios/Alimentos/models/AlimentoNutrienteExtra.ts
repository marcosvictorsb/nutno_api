import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type OrigemCampo = 'taco' | 'tbca';

class AlimentoNutrienteExtra extends Model {
  public id!: number;
  public id_alimento!: number;
  public chave!: string;
  public valor?: string;
  public unidade?: string;
  public origem_campo!: OrigemCampo;
}

AlimentoNutrienteExtra.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_alimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'alimentos',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    chave: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    valor: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    unidade: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    origem_campo: {
      type: DataTypes.ENUM('taco', 'tbca'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'alimento_nutriente_extras',
    timestamps: false,
    underscored: true,
  }
);

export default AlimentoNutrienteExtra;

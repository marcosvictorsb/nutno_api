import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type FonteAlimento = 'taco' | 'tbca' | 'personalizado';

class Alimento extends Model {
  public id!: number;
  public id_nutricionista?: number;
  public codigo_origem?: string;
  public nome!: string;
  public nome_cientifico?: string;
  public grupo!: string;
  public fonte!: FonteAlimento;
  public ativo!: boolean;

  // Macronutrientes por 100g
  public energia_kcal?: number;
  public energia_kj?: number;
  public umidade?: number;
  public proteina?: number;
  public lipidios?: number;
  public carboidrato?: number;
  public fibra?: number;
  public cinzas?: number;

  // Micronutrientes por 100g
  public colesterol?: number;
  public calcio?: number;
  public magnesio?: number;
  public manganes?: number;
  public fosforo?: number;
  public ferro?: number;
  public sodio?: number;
  public potassio?: number;
  public cobre?: number;
  public zinco?: number;
  public selenio?: number;
  public vitamina_c?: number;
  public tiamina?: number;
  public riboflavina?: number;
  public piridoxina?: number;
  public niacina?: number;
  public vitamina_a_re?: number;
  public vitamina_a_rae?: number;
  public vitamina_d?: number;
  public vitamina_e?: number;
  public vitamina_b12?: number;
  public folato?: number;

  // Gorduras por 100g
  public gordura_saturada?: number;
  public gordura_monoinsaturada?: number;
  public gordura_poliinsaturada?: number;
  public gorduras_trans?: number;

  // Metadados
  public criado_em!: Date;
  public atualizado_em!: Date;
  public deletado_em?: Date;
}

Alimento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
    },
    codigo_origem: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nome_cientifico: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    grupo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fonte: {
      type: DataTypes.ENUM('taco', 'tbca', 'personalizado'),
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // Macronutrientes por 100g
    energia_kcal: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    energia_kj: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    umidade: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    proteina: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    lipidios: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    carboidrato: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    fibra: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    cinzas: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },

    // Micronutrientes por 100g
    colesterol: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    calcio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    magnesio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    manganes: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    fosforo: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    ferro: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    sodio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    potassio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    cobre: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    zinco: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    selenio: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_c: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    tiamina: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    riboflavina: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    piridoxina: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    niacina: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_a_re: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_a_rae: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_d: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_e: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    vitamina_b12: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    folato: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },

    // Gorduras por 100g
    gordura_saturada: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    gordura_monoinsaturada: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    gordura_poliinsaturada: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    gorduras_trans: {
      type: DataTypes.DECIMAL(10, 4),
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
    tableName: 'alimentos',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    deletedAt: 'deletado_em',
    paranoid: true,
  }
);

export default Alimento;

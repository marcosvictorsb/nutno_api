import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type NivelAtividade =
  | 'sedentario'
  | 'leve'
  | 'moderado'
  | 'intenso'
  | 'muito_intenso';

class Medidas extends Model {
  public id!: number;
  public id_paciente!: number;
  public id_nutricionista!: number;
  public data_avaliacao!: Date;
  public peso?: number;
  public altura?: number;
  public imc?: number;
  public perc_gordura_corporal?: number;
  public perc_massa_magra?: number;
  public idade_metabolica?: number;
  public circunferencia_cintura?: number;
  public circunferencia_quadril?: number;
  public relacao_cintura_quadril?: number;
  public circunferencia_abdominal?: number;
  public circunferencia_braco?: number;
  public circunferencia_coxa_direita?: number;
  public circunferencia_coxa_esquerda?: number;
  public circunferencia_panturrilha?: number;
  public circunferencia_torax?: number;
  public dobra_subescapular?: number;
  public dobra_tricipital?: number;
  public dobra_bicipital?: number;
  public dobra_suprailíaca?: number;
  public dobra_abdominal?: number;
  public dobra_coxal?: number;
  public dobra_peitoral?: number;
  public pressao_arterial_sistolica?: number;
  public pressao_arterial_diastolica?: number;
  public frequencia_cardiaca?: number;
  public tmb?: number;
  public gasto_energetico_total?: number;
  public nivel_atividade?: NivelAtividade;
  public observacoes?: string;
  public fotos?: string[];
  public criado_em!: Date;
  public atualizado_em!: Date;
}

Medidas.init(
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
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
    },
    data_avaliacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    peso: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    altura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    imc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    perc_gordura_corporal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    perc_massa_magra: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    idade_metabolica: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    circunferencia_cintura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_quadril: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    relacao_cintura_quadril: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_abdominal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_braco: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_coxa_direita: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_coxa_esquerda: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_panturrilha: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    circunferencia_torax: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_subescapular: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_tricipital: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_bicipital: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_suprailíaca: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_abdominal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_coxal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    dobra_peitoral: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    pressao_arterial_sistolica: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pressao_arterial_diastolica: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frequencia_cardiaca: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tmb: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gasto_energetico_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    nivel_atividade: {
      type: DataTypes.ENUM(
        'sedentario',
        'leve',
        'moderado',
        'intenso',
        'muito_intenso'
      ),
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fotos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
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
    tableName: 'medidas',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

export default Medidas;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type SexoAnamnese = 'M' | 'F' | 'Outro';
type ObjetivoAnamnese =
  | 'emagrecer'
  | 'ganhar_massa'
  | 'melhorar_saude'
  | 'controlar_doenca'
  | 'melhorar_performance'
  | 'outro';
type TrabalhoRotina = 'casa' | 'fora' | 'hibrido';
type TempoCozinhar = 'sempre' | 'as_vezes' | 'raramente';
type RestricaoAlimentar =
  | 'lactose'
  | 'gluten'
  | 'vegetariano'
  | 'vegano'
  | 'religiao'
  | 'nenhuma'
  | 'outra';
type ConsumoAlcool = 'nao' | 'socialmente' | 'frequentemente';
type QualidadeSono = 'otimo' | 'bom' | 'ruim' | 'pessimo';

class Anamnese extends Model {
  public id!: number;
  public id_paciente!: number;
  public nome_completo?: string;
  public como_prefere_ser_chamado?: string;
  public data_nascimento?: Date;
  public sexo?: SexoAnamnese;
  public telefone?: string;
  public whatsapp?: string;
  public peso_atual?: number;
  public altura?: number;
  public tempo_nesse_peso?: string;
  public fez_acompanhamento_antes?: boolean;
  public qual_acompanhamento?: string;
  public objetivo?: ObjetivoAnamnese;
  public objetivo_descricao?: string;
  public maior_dificuldade_alimentacao?: string;
  public horario_acorda?: string;
  public horario_dorme?: string;
  public horario_cafe_manha?: string;
  public horario_almoco?: string;
  public horario_jantar?: string;
  public trabalha_casa_ou_fora?: TrabalhoRotina;
  public tempo_parar_cozinhar?: TempoCozinhar;
  public faz_exercicios?: boolean;
  public qual_exercicio?: string;
  public frequencia_exercicio_semana?: number;
  public alimentos_que_ama?: string;
  public alimentos_que_odeia?: string;
  public restricao_alimentar?: RestricaoAlimentar;
  public restricao_descricao?: string;
  public alergias_alimentares?: string;
  public copos_agua_por_dia?: number;
  public consumo_alcool?: ConsumoAlcool;
  public doencas_diagnosticadas?: string;
  public medicamentos?: string;
  public historico_familiar?: string;
  public qualidade_sono?: QualidadeSono;
  public nivel_estresse?: number;
  public observacoes_livres?: string;
  public criado_em!: Date;
  public atualizado_em!: Date;
}

Anamnese.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'pacientes',
        key: 'id',
      },
    },
    nome_completo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    como_prefere_ser_chamado: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'Outro'),
      allowNull: true,
    },
    telefone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    peso_atual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    altura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    tempo_nesse_peso: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fez_acompanhamento_antes: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    qual_acompanhamento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    objetivo: {
      type: DataTypes.ENUM(
        'emagrecer',
        'ganhar_massa',
        'melhorar_saude',
        'controlar_doenca',
        'melhorar_performance',
        'outro'
      ),
      allowNull: true,
    },
    objetivo_descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maior_dificuldade_alimentacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    horario_acorda: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horario_dorme: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horario_cafe_manha: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horario_almoco: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    horario_jantar: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    trabalha_casa_ou_fora: {
      type: DataTypes.ENUM('casa', 'fora', 'hibrido'),
      allowNull: true,
    },
    tempo_parar_cozinhar: {
      type: DataTypes.ENUM('sempre', 'as_vezes', 'raramente'),
      allowNull: true,
    },
    faz_exercicios: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    qual_exercicio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequencia_exercicio_semana: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alimentos_que_ama: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alimentos_que_odeia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    restricao_alimentar: {
      type: DataTypes.ENUM(
        'lactose',
        'gluten',
        'vegetariano',
        'vegano',
        'religiao',
        'nenhuma',
        'outra'
      ),
      allowNull: true,
    },
    restricao_descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alergias_alimentares: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    copos_agua_por_dia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    consumo_alcool: {
      type: DataTypes.ENUM('nao', 'socialmente', 'frequentemente'),
      allowNull: true,
    },
    doencas_diagnosticadas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicamentos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    historico_familiar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qualidade_sono: {
      type: DataTypes.ENUM('otimo', 'bom', 'ruim', 'pessimo'),
      allowNull: true,
    },
    nivel_estresse: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    observacoes_livres: {
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
    tableName: 'anamneses',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

export default Anamnese;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type SexoPaciente = 'M' | 'F' | 'Outro';
type StatusPaciente = 'ativo' | 'inativo' | 'arquivado';

class Paciente extends Model {
  public id!: number;
  public id_nutricionista!: number;
  public nome!: string;
  public email?: string;
  public telefone?: string;
  public whatsapp?: string;
  public data_nascimento?: Date;
  public sexo?: SexoPaciente;
  public como_prefere_ser_chamado?: string;
  public foto_perfil?: string;
  public status!: StatusPaciente;
  public token_formulario!: string;
  public formulario_preenchido!: boolean;
  public formulario_preenchido_em?: Date;
  public criado_em!: Date;
  public atualizado_em!: Date;
}

Paciente.init(
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
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
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
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'Outro'),
      allowNull: true,
    },
    como_prefere_ser_chamado: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    foto_perfil: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'arquivado'),
      allowNull: false,
      defaultValue: 'ativo',
    },
    token_formulario: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    formulario_preenchido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    formulario_preenchido_em: {
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
  },
  {
    sequelize,
    tableName: 'pacientes',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
  }
);

export default Paciente;

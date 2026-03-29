import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';

type AssuntoTicket =
  | 'registro'
  | 'inscricao'
  | 'bug'
  | 'duvida'
  | 'sugestao'
  | 'outro';
type StatusTicket = 'aberto' | 'resolvido' | 'fechado';

class Ticket extends Model {
  public id!: number;
  public id_nutricionista!: number;
  public assunto!: AssuntoTicket;
  public mensagem!: string;
  public status!: StatusTicket;
  public emailUsuario!: string;
  public readonly criadoEm!: Date;
  public readonly atualizadoEm!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_nutricionista',
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    assunto: {
      type: DataTypes.ENUM(
        'registro',
        'inscricao',
        'bug',
        'duvida',
        'sugestao',
        'outro'
      ),
      allowNull: false,
      validate: {
        isIn: [['registro', 'inscricao', 'bug', 'duvida', 'sugestao', 'outro']],
      },
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('aberto', 'resolvido', 'fechado'),
      defaultValue: 'aberto',
      allowNull: false,
    },
    email_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'email_usuario',
    },
    criadoEm: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'criado_em',
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'atualizado_em',
    },
  },
  {
    sequelize,
    tableName: 'tickets',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['nutricionista_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['criado_em'],
      },
    ],
  }
);

export default Ticket;

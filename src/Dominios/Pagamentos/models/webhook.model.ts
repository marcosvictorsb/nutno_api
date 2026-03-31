import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infra/database/model/sequelize.config';
import {
  KirvanoEvent,
  KirvanoPaymentMethod,
  KirvanoSaleType,
  KirvanoStatus,
} from '../../../types/Kirvano';

class Webhook extends Model {
  public id!: number;
  public evento!: KirvanoEvent;
  public descricao_evento?: string;
  public id_checkout?: string;
  public id_venda!: string;
  public url_checkout?: string;
  public meio_pagamento?: KirvanoPaymentMethod;
  public preco_total?: number;
  public tipo?: KirvanoSaleType; // ONE_TIME, RECURRING
  public status?: KirvanoStatus; // PENDING, APPROVED, CANCELED, REFUSED, CHARGEBACK
  public nome_cliente?: string;
  public documento_cliente?: string;
  public email_cliente?: string;
  public telefone_cliente?: string;
  public payload?: Record<string, any>;
  public processado!: boolean;
  public mensagem_erro?: string;
  public id_nutricionista?: number;
  public id_inscricao?: number;
  public criado_em!: Date;
  public atualizado_em!: Date;
}

Webhook.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    evento: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descricao_evento: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_checkout: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    id_venda: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    url_checkout: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meio_pagamento: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    preco_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'ONE_TIME ou RECURRING',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'PENDING, APPROVED, CANCELED, REFUSED, CHARGEBACK',
    },
    nome_cliente: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    documento_cliente: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email_cliente: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefone_cliente: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Payload completo do webhook para auditoria',
    },
    processado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mensagem_erro: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_nutricionista: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'nutricionistas',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    id_inscricao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'inscricoes',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    atualizado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'webhooks',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em',
    paranoid: false,
  }
);

export default Webhook;

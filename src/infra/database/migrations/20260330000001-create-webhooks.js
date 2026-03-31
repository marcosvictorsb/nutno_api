'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('webhooks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      evento: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      descricao_evento: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_checkout: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      id_venda: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      url_checkout: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      meio_pagamento: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      preco_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'ONE_TIME ou RECURRING',
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'PENDING, APPROVED, CANCELED, REFUSED, CHARGEBACK',
      },
      nome_cliente: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      documento_cliente: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email_cliente: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telefone_cliente: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Payload completo do webhook para auditoria',
      },
      processado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      mensagem_erro: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_nutricionista: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'nutricionistas',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      id_inscricao: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'inscricoes',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Criar índices para melhor performance
    await queryInterface.addIndex('webhooks', ['id_venda'], {
      name: 'idx_webhooks_id_venda',
    });

    await queryInterface.addIndex('webhooks', ['id_checkout'], {
      name: 'idx_webhooks_id_checkout',
    });

    await queryInterface.addIndex('webhooks', ['email_cliente'], {
      name: 'idx_webhooks_email_cliente',
    });

    await queryInterface.addIndex('webhooks', ['status'], {
      name: 'idx_webhooks_status',
    });

    await queryInterface.addIndex('webhooks', ['processado'], {
      name: 'idx_webhooks_processado',
    });

    await queryInterface.addIndex('webhooks', ['evento'], {
      name: 'idx_webhooks_evento',
    });

    await queryInterface.addIndex('webhooks', ['id_nutricionista'], {
      name: 'idx_webhooks_id_nutricionista',
    });

    await queryInterface.addIndex('webhooks', ['id_inscricao'], {
      name: 'idx_webhooks_id_inscricao',
    });

    await queryInterface.addIndex('webhooks', ['criado_em'], {
      name: 'idx_webhooks_criado_em',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('webhooks');
  },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inscricoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_nutricionista: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nutricionistas',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'planos',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      data_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      data_vencimento: {
        type: Sequelize.DATE,
        allowNull: true,
        comment:
          'Data em que a inscrição expira. NULL para inscrições permanentes',
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metodo_pagamento: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Método de pagamento utilizado (cartão, boleto, etc)',
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
      deletado_em: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Criar índices para queries frequentes
    await queryInterface.addIndex('inscricoes', ['id_nutricionista']);
    await queryInterface.addIndex('inscricoes', ['id_plano']);
    await queryInterface.addIndex('inscricoes', ['data_vencimento']);
    await queryInterface.addIndex('inscricoes', ['ativo']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('inscricoes');
  },
};

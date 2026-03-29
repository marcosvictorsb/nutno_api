'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickets', {
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
      assunto: {
        type: Sequelize.ENUM(
          'registro',
          'inscricao',
          'bug',
          'duvida',
          'sugestao',
          'outro'
        ),
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('aberto', 'resolvido', 'fechado'),
        defaultValue: 'aberto',
        allowNull: false,
      },
      email_usuario: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });

    // Criar índices
    await queryInterface.addIndex('tickets', ['id_nutricionista']);
    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['criado_em']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tickets');
  },
};

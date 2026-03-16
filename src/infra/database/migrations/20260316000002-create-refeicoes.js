'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refeicoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      plano_alimentar_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'planos_alimentares',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      nome: {
        type: Sequelize.ENUM(
          'Café da manhã',
          'Lanche manhã',
          'Almoço',
          'Lanche tarde',
          'Jantar',
          'Ceia',
          'Personalizado'
        ),
        allowNull: false,
      },
      horario_sugerido: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      ordem: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Criar índices
    await queryInterface.addIndex('refeicoes', ['plano_alimentar_id'], {
      name: 'idx_refeicoes_plano_alimentar',
    });

    await queryInterface.addIndex('refeicoes', ['deletado_em'], {
      name: 'idx_refeicoes_deletado_em',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('refeicoes');
  },
};

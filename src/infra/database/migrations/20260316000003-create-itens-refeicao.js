'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('itens_refeicao', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      refeicao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'refeicoes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      alimento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'alimentos',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      quantidade: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      unidade: {
        type: Sequelize.ENUM('g', 'ml', 'unidade', 'colher', 'xicara'),
        allowNull: false,
      },
      calorias_calculadas: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      proteinas_calculadas: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      carboidratos_calculados: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      gorduras_calculadas: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
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
    await queryInterface.addIndex('itens_refeicao', ['refeicao_id'], {
      name: 'idx_itens_refeicao_refeicao',
    });

    await queryInterface.addIndex('itens_refeicao', ['alimento_id'], {
      name: 'idx_itens_refeicao_alimento',
    });

    await queryInterface.addIndex('itens_refeicao', ['deletado_em'], {
      name: 'idx_itens_refeicao_deletado_em',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('itens_refeicao');
  },
};

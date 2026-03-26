'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('adesoes', {
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
      refeicao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'refeicoes',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('seguiu', 'parcial', 'pulou'),
        allowNull: false,
      },
      observacao: {
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
    });

    // Criar índices
    await queryInterface.addIndex('adesoes', ['refeicao_id', 'data'], {
      unique: true,
      name: 'unique_adesao_refeicao_dia',
    });

    await queryInterface.addIndex('adesoes', ['paciente_id'], {
      name: 'idx_adesoes_paciente',
    });

    await queryInterface.addIndex('adesoes', ['plano_alimentar_id'], {
      name: 'idx_adesoes_plano_alimentar',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('adesoes');
  },
};

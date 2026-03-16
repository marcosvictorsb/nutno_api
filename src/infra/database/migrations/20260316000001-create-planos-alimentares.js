'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('planos_alimentares', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_paciente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      objetivo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      calorias_objetivo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      proteinas_objetivo_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      carboidratos_objetivo_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      gorduras_objetivo_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('rascunho', 'ativo', 'arquivado'),
        allowNull: false,
        defaultValue: 'rascunho',
      },
      token_visualizacao: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
      },
      enviado_em: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('planos_alimentares', ['id_paciente'], {
      name: 'idx_planos_alimentares_paciente',
    });

    await queryInterface.addIndex('planos_alimentares', ['id_nutricionista'], {
      name: 'idx_planos_alimentares_nutricionista',
    });

    await queryInterface.addIndex('planos_alimentares', ['status'], {
      name: 'idx_planos_alimentares_status',
    });

    await queryInterface.addIndex('planos_alimentares', ['deletado_em'], {
      name: 'idx_planos_alimentares_deletado_em',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('planos_alimentares');
  },
};

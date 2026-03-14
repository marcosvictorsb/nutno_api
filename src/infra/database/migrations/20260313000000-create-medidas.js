'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medidas', {
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
      },
      id_nutricionista: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nutricionistas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      data_avaliacao: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      peso: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      altura: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      imc: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      perc_gordura_corporal: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      perc_massa_magra: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      idade_metabolica: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      circunferencia_cintura: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_quadril: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      relacao_cintura_quadril: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_abdominal: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_braco: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_coxa_direita: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_coxa_esquerda: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_panturrilha: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      circunferencia_torax: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_subescapular: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_tricipital: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_bicipital: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_suprailíaca: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_abdominal: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_coxal: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      dobra_peitoral: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      pressao_arterial_sistolica: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pressao_arterial_diastolica: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      frequencia_cardiaca: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tmb: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      gasto_energetico_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      nivel_atividade: {
        type: Sequelize.ENUM(
          'sedentario',
          'leve',
          'moderado',
          'intenso',
          'muito_intenso'
        ),
        allowNull: true,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fotos: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
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
    await queryInterface.addIndex('medidas', ['id_paciente']);
    await queryInterface.addIndex('medidas', ['id_nutricionista']);
    await queryInterface.addIndex('medidas', ['data_avaliacao']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('medidas');
  },
};

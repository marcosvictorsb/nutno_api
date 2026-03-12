'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pacientes', {
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
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      telefone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      whatsapp: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      data_nascimento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F', 'Outro'),
        allowNull: true,
      },
      como_prefere_ser_chamado: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      foto_perfil: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'arquivado'),
        allowNull: false,
        defaultValue: 'ativo',
      },
      token_formulario: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      formulario_preenchido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      formulario_preenchido_em: {
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
    });

    await queryInterface.addIndex('pacientes', ['id_nutricionista']);
    await queryInterface.addIndex('pacientes', ['status']);
    await queryInterface.addIndex('pacientes', ['token_formulario']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pacientes');
  },
};

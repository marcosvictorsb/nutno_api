'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nutricionistas', 'crn', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'email',
    });

    await queryInterface.addColumn('nutricionistas', 'telefone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'crn',
    });

    await queryInterface.addColumn('nutricionistas', 'especialidade', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'telefone',
    });

    await queryInterface.addColumn('nutricionistas', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'especialidade',
    });

    await queryInterface.addColumn('nutricionistas', 'ativo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'bio',
    });

    await queryInterface.addColumn('nutricionistas', 'caminho_foto', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'ativo',
    });

    // Adicionar índices para melhor performance
    await queryInterface.addIndex('nutricionistas', ['crn'], {
      name: 'idx_nutricionistas_crn',
    });

    await queryInterface.addIndex('nutricionistas', ['email'], {
      name: 'idx_nutricionistas_email',
    });

    await queryInterface.addIndex('nutricionistas', ['ativo'], {
      name: 'idx_nutricionistas_ativo',
    });
  },

  down: async (queryInterface) => {
    // Remover índices
    await queryInterface.removeIndex(
      'nutricionistas',
      'idx_nutricionistas_crn'
    );
    await queryInterface.removeIndex(
      'nutricionistas',
      'idx_nutricionistas_email'
    );
    await queryInterface.removeIndex(
      'nutricionistas',
      'idx_nutricionistas_ativo'
    );

    // Remover colunas
    await queryInterface.removeColumn('nutricionistas', 'caminho_foto');
    await queryInterface.removeColumn('nutricionistas', 'ativo');
    await queryInterface.removeColumn('nutricionistas', 'bio');
    await queryInterface.removeColumn('nutricionistas', 'especialidade');
    await queryInterface.removeColumn('nutricionistas', 'telefone');
    await queryInterface.removeColumn('nutricionistas', 'crn');
  },
};

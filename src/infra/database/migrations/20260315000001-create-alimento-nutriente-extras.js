'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('alimento_nutriente_extras', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_alimento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'alimentos',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      chave: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      valor: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      unidade: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      origem_campo: {
        type: Sequelize.ENUM('taco', 'tbca'),
        allowNull: false,
      },
    });

    // Criar índices
    await queryInterface.addIndex(
      'alimento_nutriente_extras',
      ['id_alimento'],
      {
        name: 'idx_alimento_nutriente_alimento',
      }
    );

    await queryInterface.addIndex('alimento_nutriente_extras', ['chave'], {
      name: 'idx_alimento_nutriente_chave',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('alimento_nutriente_extras');
  },
};

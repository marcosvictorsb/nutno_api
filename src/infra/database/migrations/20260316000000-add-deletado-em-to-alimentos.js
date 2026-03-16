'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('alimentos', 'deletado_em', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    // Criar índice para melhorar performance de soft deletes
    await queryInterface.addIndex('alimentos', ['deletado_em'], {
      name: 'idx_alimentos_deletado_em',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('alimentos', 'idx_alimentos_deletado_em');
    await queryInterface.removeColumn('alimentos', 'deletado_em');
  },
};

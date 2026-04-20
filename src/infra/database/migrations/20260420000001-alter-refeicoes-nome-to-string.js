'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('refeicoes', 'nome', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('refeicoes', 'nome', {
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
    });
  },
};

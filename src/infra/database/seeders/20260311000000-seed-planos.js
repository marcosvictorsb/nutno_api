'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('planos', [
      {
        nome_plano: 'Grátis',
        valor: 0.0,
        gratuito: true,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('planos', {
      nome_plano: 'Grátis',
    });
  },
};

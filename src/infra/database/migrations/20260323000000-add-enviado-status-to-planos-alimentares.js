'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('planos_alimentares', 'status', {
      type: Sequelize.ENUM('rascunho', 'ativo', 'arquivado', 'enviado'),
      allowNull: false,
      defaultValue: 'rascunho',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Antes de reverter, garantir que nenhum
    // registro usa o valor 'enviado'
    await queryInterface.sequelize.query(
      `UPDATE planos_alimentares
       SET status = 'ativo'
       WHERE status = 'enviado'`
    );

    await queryInterface.changeColumn('planos_alimentares', 'status', {
      type: Sequelize.ENUM('rascunho', 'ativo', 'arquivado'),
      allowNull: false,
      defaultValue: 'rascunho',
    });
  },
};

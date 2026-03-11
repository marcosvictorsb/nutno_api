'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('nutricionistas', 'reset_password_token', {
      type: DataTypes.STRING(255),
      allowNull: true,
      after: 'senha',
    });
    await queryInterface.addColumn('nutricionistas', 'reset_password_expires', {
      type: DataTypes.DATE,
      allowNull: true,
      after: 'reset_password_token',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('nutricionistas', 'reset_password_token');
    await queryInterface.removeColumn(
      'nutricionistas',
      'reset_password_expires'
    );
  },
};

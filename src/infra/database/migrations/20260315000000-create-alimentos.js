'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('alimentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_nutricionista: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'nutricionistas',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      codigo_origem: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nome_cientifico: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      grupo: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      fonte: {
        type: Sequelize.ENUM('taco', 'tbca', 'personalizado'),
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // Macronutrientes por 100g
      energia_kcal: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      energia_kj: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      umidade: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      proteina: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      lipidios: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      carboidrato: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      fibra: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      cinzas: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },

      // Micronutrientes por 100g
      colesterol: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      calcio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      magnesio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      manganes: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      fosforo: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      ferro: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      sodio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      potassio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      cobre: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      zinco: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      selenio: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_c: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      tiamina: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      riboflavina: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      piridoxina: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      niacina: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_a_re: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_a_rae: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_d: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_e: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      vitamina_b12: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      folato: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },

      // Gorduras por 100g
      gordura_saturada: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      gordura_monoinsaturada: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      gordura_poliinsaturada: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      gorduras_trans: {
        type: Sequelize.DECIMAL(10, 4),
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

    // Criar índices
    await queryInterface.addIndex('alimentos', ['fonte'], {
      name: 'idx_alimentos_fonte',
    });

    await queryInterface.addIndex('alimentos', ['grupo'], {
      name: 'idx_alimentos_grupo',
    });

    await queryInterface.addIndex('alimentos', ['id_nutricionista'], {
      name: 'idx_alimentos_nutricionista',
    });

    // FULLTEXT index no nome (MySQL)
    await queryInterface.sequelize.query(
      'ALTER TABLE alimentos ADD FULLTEXT INDEX idx_alimentos_nome (nome)'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('alimentos');
  },
};

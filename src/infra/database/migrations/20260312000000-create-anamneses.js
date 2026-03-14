'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('anamneses', {
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
        onUpdate: 'CASCADE',
      },
      nome_completo: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      como_prefere_ser_chamado: {
        type: Sequelize.STRING(255),
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
      telefone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      whatsapp: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      peso_atual: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      altura: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      tempo_nesse_peso: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fez_acompanhamento_antes: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      qual_acompanhamento: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      objetivo: {
        type: Sequelize.ENUM(
          'emagrecer',
          'ganhar_massa',
          'melhorar_saude',
          'controlar_doenca',
          'melhorar_performance',
          'outro'
        ),
        allowNull: true,
      },
      objetivo_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      maior_dificuldade_alimentacao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      horario_acorda: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      horario_dorme: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      horario_cafe_manha: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      horario_almoco: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      horario_jantar: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      trabalha_casa_ou_fora: {
        type: Sequelize.ENUM('casa', 'fora', 'hibrido'),
        allowNull: true,
      },
      tempo_parar_cozinhar: {
        type: Sequelize.ENUM('sempre', 'as_vezes', 'raramente'),
        allowNull: true,
      },
      faz_exercicios: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      qual_exercicio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      frequencia_exercicio_semana: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      alimentos_que_ama: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      alimentos_que_odeia: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      restricao_alimentar: {
        type: Sequelize.ENUM(
          'lactose',
          'gluten',
          'vegetariano',
          'vegano',
          'religiao',
          'nenhuma',
          'outra'
        ),
        allowNull: true,
      },
      restricao_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      alergias_alimentares: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      copos_agua_por_dia: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      consumo_alcool: {
        type: Sequelize.ENUM('nao', 'socialmente', 'frequentemente'),
        allowNull: true,
      },
      doencas_diagnosticadas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      medicamentos: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      historico_familiar: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      qualidade_sono: {
        type: Sequelize.ENUM('otimo', 'bom', 'ruim', 'pessimo'),
        allowNull: true,
      },
      nivel_estresse: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      observacoes_livres: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('anamneses', ['id_paciente'], {
      unique: true,
      name: 'idx_anamneses_id_paciente_unique',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('anamneses');
  },
};

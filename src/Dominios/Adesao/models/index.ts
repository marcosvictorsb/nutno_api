import PlanoAlimentar from '../../PlanoAlimentar/models/PlanoAlimentar';
import Refeicao from '../../PlanoAlimentar/models/Refeicao';
import Adesao from './Adesao';

// Adesao belongsTo PlanoAlimentar
Adesao.belongsTo(PlanoAlimentar, {
  foreignKey: 'plano_alimentar_id',
  as: 'plano_alimentar',
});

// PlanoAlimentar hasMany Adesao
PlanoAlimentar.hasMany(Adesao, {
  foreignKey: 'plano_alimentar_id',
  as: 'adesoes',
});

// Adesao belongsTo Refeicao
Adesao.belongsTo(Refeicao, {
  foreignKey: 'refeicao_id',
  as: 'refeicao',
});

// Refeicao hasMany Adesao
Refeicao.hasMany(Adesao, {
  foreignKey: 'refeicao_id',
  as: 'adesoes',
});

export { Adesao };

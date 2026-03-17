import PlanoAlimentar from './PlanoAlimentar';
import Refeicao from './Refeicao';
import ItemRefeicao from './ItemRefeicao';
import Alimento from '../../Alimentos/models/Alimento';

// Associações PlanoAlimentar
PlanoAlimentar.hasMany(Refeicao, {
  foreignKey: 'plano_alimentar_id',
  as: 'refeicoes',
});

Refeicao.belongsTo(PlanoAlimentar, {
  foreignKey: 'plano_alimentar_id',
  as: 'plano_alimentar',
});

// Associações Refeicao
Refeicao.hasMany(ItemRefeicao, {
  foreignKey: 'refeicao_id',
  as: 'itens',
});

ItemRefeicao.belongsTo(Refeicao, {
  foreignKey: 'refeicao_id',
  as: 'refeicao',
});

// Associações ItemRefeicao
ItemRefeicao.belongsTo(Alimento, {
  foreignKey: 'alimento_id',
  as: 'alimento',
});

Alimento.hasMany(ItemRefeicao, {
  foreignKey: 'alimento_id',
  as: 'itens_refeicao',
});

export { PlanoAlimentar, Refeicao, ItemRefeicao };

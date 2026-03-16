import Alimento from './Alimento';
import AlimentoNutrienteExtra from './AlimentoNutrienteExtra';

// Associações
Alimento.hasMany(AlimentoNutrienteExtra, {
  foreignKey: 'id_alimento',
  as: 'nutrientes_extras',
});

AlimentoNutrienteExtra.belongsTo(Alimento, {
  foreignKey: 'id_alimento',
  as: 'alimento',
});

export { Alimento, AlimentoNutrienteExtra };

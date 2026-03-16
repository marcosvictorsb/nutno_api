import * as fs from 'fs';
import * as path from 'path';
import {
  Alimento,
  AlimentoNutrienteExtra,
} from '../src/Dominios/Alimentos/models';
import sequelize from '../src/infra/database/model/sequelize.config';

// Função para normalizar valores conforme especificação
function normalizarValor(valor: any): number | null {
  if (valor === 'Tr' || valor === 'tr') {
    return 0.001; // Traço — detectável mas menor que o limite
  }

  if (valor === 'NA' || valor === '' || valor === null || valor === undefined) {
    return null;
  }

  const numero = parseFloat(valor);
  if (isNaN(numero)) {
    return null;
  }

  return numero;
}

// Campos extras (aminoácidos e ácidos graxos) que devem ir para AlimentoNutrienteExtra
const CAMPOS_AMINOACIDOS = [
  'tryptophan_g',
  'threonine_g',
  'isoleucine_g',
  'leucine_g',
  'lysine_g',
  'methionine_g',
  'cystine_g',
  'phenylalanine_g',
  'tyrosine_g',
  'valine_g',
  'arginine_g',
  'histidine_g',
  'alanine_g',
  'aspartic_g',
  'glutamic_g',
  'glycine_g',
  'proline_g',
  'serine_g',
];

const CAMPOS_ACIDOS_GRAXOS = [
  '12:0_g',
  '14:0_g',
  '16:0_g',
  '18:0_g',
  '20:0_g',
  '22:0_g',
  '24:0_g',
  '14:1_g',
  '16:1_g',
  '18:1_g',
  '20:1_g',
  '18:2 n-6_g',
  '18:3 n-3_g',
  '20:4_g',
  '20:5_g',
  '22:5_g',
  '22:6_g',
  '18:1t_g',
  '18:2t_g',
];

const CAMPOS_EXTRAS = [...CAMPOS_AMINOACIDOS, ...CAMPOS_ACIDOS_GRAXOS];

// Mapeamento de campos TACO → Alimento (snake_case)
const MAPEAMENTO_CAMPOS = {
  description: 'nome',
  category: 'grupo',
  humidity_percents: 'umidade',
  energy_kcal: 'energia_kcal',
  energy_kj: 'energia_kj',
  protein_g: 'proteina',
  lipid_g: 'lipidios',
  cholesterol_mg: 'colesterol',
  carbohydrate_g: 'carboidrato',
  fiber_g: 'fibra',
  ashes_g: 'cinzas',
  calcium_mg: 'calcio',
  magnesium_mg: 'magnesio',
  manganese_mg: 'manganes',
  phosphorus_mg: 'fosforo',
  iron_mg: 'ferro',
  sodium_mg: 'sodio',
  potassium_mg: 'potassio',
  copper_mg: 'cobre',
  zinc_mg: 'zinco',
  retinol_mcg: 'vitamina_a_re',
  re_mcg: 'vitamina_a_re',
  rae_mcg: 'vitamina_a_rae',
  thiamine_mg: 'tiamina',
  riboflavin_mg: 'riboflavina',
  pyridoxine_mg: 'piridoxina',
  niacin_mg: 'niacina',
  vitaminC_mg: 'vitamina_c',
  saturated_g: 'gordura_saturada',
  monounsaturated_g: 'gordura_monoinsaturada',
  polyunsaturated_g: 'gordura_poliinsaturada',
};

async function seedTaco() {
  try {
    console.log('🔄 Iniciando seed TACO...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Ler arquivo TACO JSON
    const tacoJsonPath = path.join(__dirname, 'data', 'taco.json');
    console.log(`📖 Lendo arquivo: ${tacoJsonPath}`);
    const tacoData = JSON.parse(fs.readFileSync(tacoJsonPath, 'utf-8'));
    console.log(`✅ Arquivo carregado com ${tacoData.length} alimentos\n`);

    let alimentosImportados = 0;
    let alimentosSkipped = 0;

    // Processar cada item do TACO
    for (let i = 0; i < tacoData.length; i++) {
      const item = tacoData[i];
      const codigoOrigem = item.id.toString();

      // Verificar se já existe (idempotência)
      const alimentoExistente = await Alimento.findOne({
        where: {
          codigo_origem: codigoOrigem,
          fonte: 'taco',
        },
      });

      if (alimentoExistente) {
        alimentosSkipped++;
        continue;
      }

      // Montar objeto do Alimento
      const alimentoData: any = {
        codigo_origem: codigoOrigem,
        nome: item.description || `Alimento ${codigoOrigem}`,
        grupo: item.category || 'Sem categoria',
        fonte: 'taco',
        id_nutricionista: null,
        ativo: true,
      };

      // Mapear campos numéricos
      for (const [campoTaco, campoAlimento] of Object.entries(
        MAPEAMENTO_CAMPOS
      )) {
        const valor = normalizarValor((item as any)[campoTaco]);
        if (valor !== null) {
          (alimentoData as any)[campoAlimento] = valor;
        }
      }

      // Criar alimento
      const alimento = await Alimento.create(alimentoData);
      alimentosImportados++;

      // Processar campos extras (aminoácidos e ácidos graxos)
      const nutrientesExtras: any[] = [];

      for (const campo of CAMPOS_EXTRAS) {
        const valor = normalizarValor((item as any)[campo]);

        if (valor !== null) {
          nutrientesExtras.push({
            id_alimento: alimento.id,
            chave: campo,
            valor: valor.toString(),
            unidade: 'g',
            origem_campo: 'taco',
          });
        }
      }

      // Salvar nutrientes extras em batch
      if (nutrientesExtras.length > 0) {
        await AlimentoNutrienteExtra.bulkCreate(nutrientesExtras);
      }

      // Logging de progresso a cada 50 itens
      if ((i + 1) % 50 === 0) {
        console.log(
          `🔄 TACO: ${alimentosImportados}/${tacoData.length} alimentos importados`
        );
      }
    }

    console.log(
      `\n✅ TACO concluído: ${alimentosImportados} alimentos importados`
    );
    if (alimentosSkipped > 0) {
      console.log(`⏭️  ${alimentosSkipped} alimentos pulados (já existiam)\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed TACO:', error);
    process.exit(1);
  }
}

// Executar seed
seedTaco();

import * as fs from 'fs';
import * as path from 'path';
import {
  Alimento,
  AlimentoNutrienteExtra,
} from '../src/Dominios/Alimentos/models';
import sequelize from '../src/infra/database/model/sequelize.config';

// Função para normalizar valores TBCA
function normalizarValorTbca(valor: any): number | null {
  if (!valor || valor === null || valor === undefined) {
    return null;
  }

  // Converter para string se não for
  const valorStr = String(valor).trim().toLowerCase();

  if (valorStr === 'tr') {
    return 0.001; // Traço — detectável mas menor que o limite
  }

  if (valorStr === 'na' || valorStr === '*' || valorStr === '') {
    return null;
  }

  // Trocar vírgula por ponto (padrão brasileiro)
  const numeroStr = valorStr.replace(',', '.');
  const numero = parseFloat(numeroStr);

  if (isNaN(numero)) {
    return null;
  }

  return numero;
}

// Mapeamento de componentes TBCA → campos do Alimento
// INCLUINDO as unidades exatas como vêm do JSON
const MAPEAMENTO_COMPONENTES: { [key: string]: string } = {
  Energia_kcal: 'energia_kcal',
  Energia_kJ: 'energia_kj',
  Umidade_g: 'umidade',
  Proteína_g: 'proteina',
  Lipídios_g: 'lipidios',
  'Carboidrato total_g': 'carboidrato',
  'Fibra alimentar_g': 'fibra',
  Cinzas_g: 'cinzas',
  Colesterol_mg: 'colesterol',
  Cálcio_mg: 'calcio',
  Magnésio_mg: 'magnesio',
  Manganês_mg: 'manganes',
  Fósforo_mg: 'fosforo',
  Ferro_mg: 'ferro',
  Sódio_mg: 'sodio',
  Potássio_mg: 'potassio',
  Cobre_mg: 'cobre',
  Zinco_mg: 'zinco',
  Selênio_mcg: 'selenio',
  'Vitamina C_mg': 'vitamina_c',
  Tiamina_mg: 'tiamina',
  Riboflavina_mg: 'riboflavina',
  'Vitamina B6_mg': 'piridoxina',
  Niacina_mg: 'niacina',
  'Vitamina A (RE)_mcg': 'vitamina_a_re',
  'Vitamina A (RAE)_mcg': 'vitamina_a_rae',
  'Vitamina D_mcg': 'vitamina_d',
  'Alfa-tocoferol (Vitamina E)_mg': 'vitamina_e',
  'Vitamina B12_mcg': 'vitamina_b12',
  'Equivalente de folato_mcg': 'folato',
  'Ácidos graxos saturados_g': 'gordura_saturada',
  'Ácidos graxos monoinsaturados_g': 'gordura_monoinsaturada',
  'Ácidos graxos poliinsaturados_g': 'gordura_poliinsaturada',
  'Ácidos graxos trans_g': 'gorduras_trans',
};

// Campos que devem ser ignorados ao buscar porções
const CAMPOS_IGNORADOS = [
  'componente',
  'unidade',
  'unidades',
  'valor_por_100g',
  'unidade',
];

async function seedTbca() {
  try {
    console.log('🔄 Iniciando seed TBCA...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Ler arquivo TBCA JSON
    const tbcaJsonPath = path.join(__dirname, 'data', 'tbca.json');
    console.log(`📖 Lendo arquivo: ${tbcaJsonPath}`);
    const tbcaJson = JSON.parse(fs.readFileSync(tbcaJsonPath, 'utf-8'));
    const tbcaData = tbcaJson.alimentos || [];
    console.log(`✅ Arquivo carregado com ${tbcaData.length} alimentos\n`);

    let alimentosImportados = 0;
    let alimentosSkipped = 0;

    // Processar cada item do TBCA
    for (let i = 0; i < tbcaData.length; i++) {
      const item = tbcaData[i];
      const codigoOrigem = item.codigo;

      // Verificar se já existe (idempotência)
      const alimentoExistente = await Alimento.findOne({
        where: {
          codigo_origem: codigoOrigem,
          fonte: 'tbca',
        },
      });

      if (alimentoExistente) {
        alimentosSkipped++;
        continue;
      }

      // Montar objeto do Alimento
      const alimentoData: any = {
        codigo_origem: codigoOrigem,
        nome: item.nome || `Alimento ${codigoOrigem}`,
        nome_cientifico: item.nomeCientifico || null,
        grupo: item.grupo || 'Sem categoria',
        fonte: 'tbca',
        id_nutricionista: null,
        ativo: true,
      };

      // Array para armazenar porções medidas
      const nutrientesExtras: any[] = [];

      // Processar componentes nutricionais
      if (
        item.nutrientes &&
        item.nutrientes.componentes &&
        Array.isArray(item.nutrientes.componentes)
      ) {
        for (const componente of item.nutrientes.componentes) {
          const nomeComponente = componente.componente || '';
          const unidades = componente.unidades || '';
          const valor = normalizarValorTbca(componente.valor_por_100g);

          // Criar chave para busca no mapeamento
          const chaveComponente = unidades
            ? `${nomeComponente}_${unidades}`
            : nomeComponente;

          // Buscar no mapeamento
          const campoAlimento = MAPEAMENTO_COMPONENTES[chaveComponente];

          if (campoAlimento && valor !== null) {
            (alimentoData as any)[campoAlimento] = valor;
          }

          // Processar porções medidas (chaves que não são campos ignorados)
          for (const [chavePorcao, valorPorcao] of Object.entries(componente)) {
            if (!CAMPOS_IGNORADOS.includes(chavePorcao as any)) {
              const valorPorcaoNormalizado = normalizarValorTbca(valorPorcao);

              if (valorPorcaoNormalizado !== null) {
                // Chave formatada: porcao__NomeComponente_Unidades__chavePorcao
                const chaveFormatada = `porcao__${nomeComponente}_${unidades}__${chavePorcao}`;

                nutrientesExtras.push({
                  id_alimento: 0, // Será preenchido após criar o alimento
                  chave: chaveFormatada,
                  valor: valorPorcaoNormalizado.toString(),
                  unidade: unidades,
                  origem_campo: 'tbca',
                });
              }
            }
          }
        }
      }

      // Criar alimento
      const alimento = await Alimento.create(alimentoData);
      alimentosImportados++;

      // Salvar nutrientes extras em batch
      if (nutrientesExtras.length > 0) {
        // Atualizar id_alimento
        nutrientesExtras.forEach((ne) => {
          ne.id_alimento = alimento.id;
        });
        await AlimentoNutrienteExtra.bulkCreate(nutrientesExtras);
      }

      // Logging de progresso a cada 100 itens
      if ((i + 1) % 100 === 0) {
        console.log(
          `🔄 TBCA: ${alimentosImportados}/${tbcaData.length} alimentos importados`
        );
      }
    }

    console.log(
      `\n✅ TBCA concluído: ${alimentosImportados} alimentos importados`
    );
    if (alimentosSkipped > 0) {
      console.log(`⏭️  ${alimentosSkipped} alimentos pulados (já existiam)\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed TBCA:', error);
    process.exit(1);
  }
}

// Executar seed
seedTbca();

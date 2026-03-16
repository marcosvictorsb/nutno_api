import { Op } from 'sequelize';
import { Alimento } from '../src/Dominios/Alimentos/models';
import sequelize from '../src/infra/database/model/sequelize.config';

// Função para normalizar nome para comparação
function normalizarNome(nome: string): string {
  return (
    nome
      .toLowerCase()
      // Remover acentos
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Remover vírgulas e pontuação
      .replace(/[,.\-()\/]/g, '')
      // Remover espaços extras
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Função para calcular similaridade entre duas strings (Levenshtein Distance)
function calcularSimilaridade(str1: string, str2: string): number {
  const s1 = normalizarNome(str1);
  const s2 = normalizarNome(str2);

  const matriz: number[][] = [];

  // Inicializar matriz
  for (let i = 0; i <= s1.length; i++) {
    matriz[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matriz[0][j] = j;
  }

  // Preencher matriz
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const custo = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1, // Deleção
        matriz[i][j - 1] + 1, // Inserção
        matriz[i - 1][j - 1] + custo // Substituição
      );
    }
  }

  const distancia = matriz[s1.length][s2.length];
  const comprimentoMaximo = Math.max(s1.length, s2.length);

  // Retornar similaridade em percentual (0-100)
  if (comprimentoMaximo === 0) return 100;
  return ((comprimentoMaximo - distancia) / comprimentoMaximo) * 100;
}

async function deduplicarAlimentos() {
  try {
    console.log('🔄 Iniciando deduplicação de alimentos...\n');

    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados\n');

    // Buscar todos os alimentos da TACO
    const alimentosTaco = await Alimento.findAll({
      where: { fonte: 'taco' },
      attributes: ['id', 'nome', 'codigo_origem'],
    });

    console.log(`📊 Encontrados ${alimentosTaco.length} alimentos TACO\n`);

    // Buscar todos os alimentos da TBCA
    const alimentosTbca = await Alimento.findAll({
      where: { fonte: 'tbca' },
      attributes: ['id', 'nome', 'codigo_origem'],
    });

    console.log(`📊 Encontrados ${alimentosTbca.length} alimentos TBCA\n`);

    let duplicatasEncontradas = 0;
    const LIMITE_SIMILARIDADE = 85; // 85% de similaridade

    // Para cada alimento TACO, buscar duplicatas em TBCA
    console.log('🔍 Buscando duplicatas...\n');

    for (let i = 0; i < alimentosTaco.length; i++) {
      const alimentoTaco = alimentosTaco[i];
      let melhorMatch: { alimentoId: number; similaridade: number } | null =
        null;

      // Comparar com cada alimento TBCA
      for (const alimentoTbca of alimentosTbca) {
        const similaridade = calcularSimilaridade(
          alimentoTaco.nome,
          alimentoTbca.nome
        );

        // Se encontrou match melhor que o limite
        if (similaridade > LIMITE_SIMILARIDADE) {
          if (!melhorMatch || similaridade > melhorMatch.similaridade) {
            melhorMatch = {
              alimentoId: alimentoTbca.id,
              similaridade,
            };
          }
        }
      }

      // Se encontrou duplicata
      if (melhorMatch) {
        // Buscar os dados completos para exibição
        const alimentoTbcaDuplicado = alimentosTbca.find(
          (a) => a.id === melhorMatch!.alimentoId
        );

        if (alimentoTbcaDuplicado) {
          // Desativar o alimento TBCA
          await Alimento.update(
            { ativo: false },
            { where: { id: melhorMatch.alimentoId } }
          );

          duplicatasEncontradas++;

          console.log(
            `✓ Duplicata encontrada (${melhorMatch.similaridade.toFixed(1)}%)`
          );
          console.log(`  TACO: ${alimentoTaco.nome}`);
          console.log(`  TBCA: ${alimentoTbcaDuplicado.nome}`);
          console.log();
        }
      }

      // Logging de progresso
      if ((i + 1) % 50 === 0) {
        console.log(
          `🔄 Processados ${i + 1}/${alimentosTaco.length} alimentos TACO`
        );
      }
    }

    // Contar totais finais
    const totalAtivoTaco = await Alimento.count({
      where: { fonte: 'taco', ativo: true },
    });

    const totalAtivoTbca = await Alimento.count({
      where: { fonte: 'tbca', ativo: true },
    });

    const totalAtivoPersonalizado = await Alimento.count({
      where: { fonte: 'personalizado', ativo: true },
    });

    const totalAtivo =
      totalAtivoTaco + totalAtivoTbca + totalAtivoPersonalizado;

    console.log(`\n✅ Deduplicação concluída!\n`);
    console.log(`📊 Resultados:`);
    console.log(
      `  • Duplicatas encontradas e desativadas: ${duplicatasEncontradas}`
    );
    console.log(
      `  • Total ativo TACO: ${totalAtivoTaco} | TBCA: ${totalAtivoTbca} | Personalizado: ${totalAtivoPersonalizado}`
    );
    console.log(`  • TOTAL ATIVO: ${totalAtivo}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao desduplicar alimentos:', error);
    process.exit(1);
  }
}

// Executar deduplicação
deduplicarAlimentos();

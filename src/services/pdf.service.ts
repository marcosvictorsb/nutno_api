import puppeteer from 'puppeteer';
import logger from '../config/logger';

export interface GeradorPDFOptions {
  plano: any;
  nutricionista: any;
  paciente: any;
}

export async function gerarPdfPlanoAlimentar(html: string): Promise<Buffer> {
  let browser;
  try {
    logger.info('Iniciando geração de PDF');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });

    logger.info('PDF gerado com sucesso', {
      tamanho: pdfBuffer.length,
    });

    return Buffer.from(pdfBuffer);
  } catch (erro) {
    logger.error('Erro ao gerar PDF', { erro });
    throw new Error('Erro ao gerar PDF do plano alimentar');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function gerarHtmlPlanoAlimentar(dados: any): string {
  const { plano, nutricionista, paciente } = dados;

  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  // Calcular totais diários
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalCarboidratos = 0;
  let totalGorduras = 0;

  plano.refeicoes?.forEach((refeicao: any) => {
    refeicao.itens?.forEach((item: any) => {
      const energia = parseFloat(item.alimento?.energia_kcal || 0);
      const proteina = parseFloat(item.alimento?.proteina || 0);
      const carbo = parseFloat(item.alimento?.carboidrato || 0);
      const gordu = parseFloat(item.alimento?.lipidios || 0);

      const quantidade = parseFloat(item.quantidade || 1);

      totalCalorias += (energia * quantidade) / 100;
      totalProteinas += (proteina * quantidade) / 100;
      totalCarboidratos += (carbo * quantidade) / 100;
      totalGorduras += (gordu * quantidade) / 100;
    });
  });

  let htmlRefeicoes = '';

  plano.refeicoes?.forEach((refeicao: any) => {
    let caloriasCalorias = 0;
    let proteinasRefeicao = 0;
    let carboidratosRefeicao = 0;
    let gordurasRefeicao = 0;
    let quantidadeItens = 0;

    let linhasAlimentos = '';

    refeicao.itens?.forEach((item: any) => {
      const energia = parseFloat(item.alimento?.energia_kcal || 0);
      const proteina = parseFloat(item.alimento?.proteina || 0);
      const carbo = parseFloat(item.alimento?.carboidrato || 0);
      const gordu = parseFloat(item.alimento?.lipidios || 0);

      const quantidade = parseFloat(item.quantidade || 1);

      const caloriaItem = (energia * quantidade) / 100;
      const proteinItem = (proteina * quantidade) / 100;
      const carboItem = (carbo * quantidade) / 100;
      const gorduItem = (gordu * quantidade) / 100;

      caloriasCalorias += caloriaItem;
      proteinasRefeicao += proteinItem;
      carboidratosRefeicao += carboItem;
      gordurasRefeicao += gorduItem;
      quantidadeItens++;

      linhasAlimentos += `
        <tr>
          <td>${item.alimento?.nome || 'N/A'}</td>
          <td>${quantidade}${item.unidade}</td>
          <td>${caloriaItem.toFixed(0)}</td>
          <td>${proteinItem.toFixed(1)}</td>
          <td>${carboItem.toFixed(1)}</td>
          <td>${gorduItem.toFixed(1)}</td>
        </tr>
      `;
    });

    const emojisRefeicao: { [key: string]: string } = {
      'Café da manhã': '☀️',
      'Lanche manhã': '🥤',
      Almoço: '🍽️',
      'Lanche tarde': '🥗',
      Jantar: '🌙',
      Ceia: '🌟',
    };

    const emoji = emojisRefeicao[refeicao.nome] || '🍴';

    htmlRefeicoes += `
      <div class="refeicao-card">
        <div class="refeicao-header">
          <div class="refeicao-info">
            <h3>${emoji} ${refeicao.nome}</h3>
            <span>${refeicao.horario_sugerido}</span>
          </div>
          <div class="refeicao-meta">
            <span class="itens">${quantidadeItens} item${quantidadeItens !== 1 ? 'ns' : ''}</span>
            <span class="kcal">${Math.round(caloriasCalorias)} kcal</span>
          </div>
        </div>
        <table class="alimentos-table">
          <thead>
            <tr>
              <th>Alimento</th>
              <th>QTDE</th>
              <th>KCAL</th>
              <th>PROT</th>
              <th>CARBO</th>
              <th>GORD</th>
            </tr>
          </thead>
          <tbody>
            ${linhasAlimentos}
            <tr class="subtotal-row">
              <td colspan="2">SUBTOTAL</td>
              <td>${Math.round(caloriasCalorias)}</td>
              <td>${proteinasRefeicao.toFixed(1)}</td>
              <td>${carboidratosRefeicao.toFixed(1)}</td>
              <td>${gordurasRefeicao.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  });

  const caloriasMeta = parseFloat(plano.calorias_objetivo);
  const proteinasMeta = parseFloat(plano.proteinas_objetivo_pct);
  const carboidratosMeta = parseFloat(plano.carboidratos_objetivo_pct);
  const gordurasMeta = parseFloat(plano.gorduras_objetivo_pct);

  const proteinasMetaGramas = (caloriasMeta * proteinasMeta) / 100 / 4;
  const carboidratosMetaGramas = (caloriasMeta * carboidratosMeta) / 100 / 4;
  const gordurasMetaGramas = (caloriasMeta * gordurasMeta) / 100 / 9;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Plano Alimentar - Nutno</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --verde-escuro: #14532d;
                --verde-primario: #16a34a;
                --verde-claro: #dcfce7;
                --verde-medio: #bbf7d0;
                --branco: #ffffff;
                --cinza-texto: #374151;
                --cinza-claro: #f9fafb;
                --cinza-borda: #e5e7eb;
            }

            * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
            }

            body {
                font-family: 'Inter', sans-serif;
                font-size: 12px;
                color: var(--cinza-texto);
                background-color: #fff;
                margin: 0;
                padding: 0;
            }

            .page {
                width: 210mm;
                min-height: 297mm;
                padding: 24px;
                margin: auto;
                background: white;
            }

            @page {
                size: A4;
                margin: 20mm;
            }

            @media print {
                body { background: none; }
                .page { width: 100%; margin: 0; padding: 0; box-shadow: none; }
                .no-print { display: none; }
                .card { box-shadow: none !important; border: 1px solid var(--cinza-borda); }
                .refeicao-card { page-break-inside: avoid; }
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 3px solid var(--verde-escuro);
                padding-bottom: 20px;
                margin-bottom: 24px;
            }

            .logo-area h1 {
                color: var(--verde-escuro);
                font-size: 20px;
                margin: 0;
                font-weight: 700;
            }

            .logo-area span {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #6b7280;
            }

            .info-area {
                text-align: right;
            }

            .info-area .paciente-nome {
                font-size: 16px;
                font-weight: 700;
                display: block;
                margin-bottom: 4px;
            }

            .info-area .meta-info {
                font-size: 11px;
                color: #6b7280;
                display: block;
            }

            .resumo-plano {
                background-color: var(--verde-escuro);
                color: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .resumo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .resumo-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .badge-ativo {
                background-color: var(--verde-claro);
                color: var(--verde-escuro);
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
            }

            .resumo-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .resumo-card {
                background-color: rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                padding: 12px;
            }

            .resumo-card label {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                display: block;
                margin-bottom: 4px;
                opacity: 0.8;
            }

            .resumo-card .valor {
                font-size: 18px;
                font-weight: 700;
            }

            .resumo-card .valor-small {
                font-size: 11px;
                font-weight: 500;
            }

            .section-title {
                font-size: 13px;
                font-weight: 700;
                color: var(--verde-escuro);
                border-left: 3px solid var(--verde-primario);
                padding-left: 8px;
                margin: 24px 0 12px 0;
                text-transform: uppercase;
            }

            .macros-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 24px;
            }

            .macro-card {
                background-color: var(--cinza-claro);
                border-radius: 8px;
                padding: 12px;
                border: 1px solid var(--cinza-borda);
            }

            .macro-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }

            .macro-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 10px;
                margin-right: 8px;
            }

            .icon-p { background-color: var(--verde-primario); }
            .icon-c { background-color: #3b82f6; }
            .icon-g { background-color: #f59e0b; }

            .macro-label {
                font-size: 10px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
            }

            .macro-valor {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 4px;
            }

            .macro-sub {
                font-size: 11px;
                color: #6b7280;
                margin-bottom: 8px;
            }

            .progress-bar {
                height: 4px;
                width: 100%;
                background-color: #e5e7eb;
                border-radius: 999px;
                overflow: hidden;
            }

            .progress-fill { height: 100%; border-radius: 999px; }
            .fill-p { background-color: var(--verde-primario); width: 100%; }
            .fill-c { background-color: #3b82f6; width: 100%; }
            .fill-g { background-color: #f59e0b; width: 100%; }

            .refeicao-card {
                background-color: white;
                border-left: 4px solid var(--verde-primario);
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                margin-bottom: 16px;
                overflow: hidden;
                page-break-inside: avoid;
            }

            .refeicao-header {
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .refeicao-info h3 {
                margin: 0;
                font-size: 13px;
                font-weight: 700;
            }

            .refeicao-info span {
                font-size: 11px;
                color: #6b7280;
            }

            .refeicao-meta {
                text-align: right;
            }

            .refeicao-meta .itens {
                font-size: 11px;
                color: #6b7280;
                display: block;
            }

            .refeicao-meta .kcal {
                font-size: 13px;
                font-weight: 700;
                color: var(--verde-primario);
            }

            .alimentos-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }

            .alimentos-table th {
                background-color: #f3f4f6;
                text-align: left;
                padding: 6px 8px;
                font-size: 10px;
                text-transform: uppercase;
                color: var(--cinza-texto);
            }

            .alimentos-table td {
                padding: 7px 8px;
                border-bottom: 1px solid #f3f4f6;
            }

            .alimentos-table tr:nth-child(even) {
                background-color: #f9fafb;
            }

            .alimentos-table .subtotal-row {
                background-color: var(--verde-claro) !important;
                font-weight: 700;
                color: var(--verde-escuro);
            }
                border-left: 4px solid var(--verde-primario);
                background-color: #f0fdf4;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
                page-break-inside: avoid;
            }

            .mensagem-header {
                display: flex;
                align-items: center;
                font-weight: 700;
                font-size: 13px;
                color: var(--verde-escuro);
                margin-bottom: 8px;
            }

            .mensagem-content {
                font-size: 12px;
                line-height: 1.8;
                color: var(--cinza-texto);
                min-height: 80px;
            }

            .footer {
                margin-top: 32px;
                border-top: 1px solid var(--cinza-borda);
                padding: 12px 0;
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <header class="header">
                <div class="logo-area">
                    <h1>🌱 Nutno</h1>
                    <span>Plano Alimentar Personalizado</span>
                </div>
                <div class="info-area">
                    <span class="paciente-nome">${paciente?.nome || 'Paciente'}</span>
                    <span class="meta-info">Gerado em ${dataGeracao}</span>
                    <span class="meta-info">Nutricionista: ${nutricionista?.nome || 'Nutricionista'}</span>
                </div>
            </header>

            <div class="resumo-plano">
                <div class="resumo-header">
                    <h2>${plano.nome}</h2>
                    <span class="badge-ativo">${plano.status.toUpperCase()}</span>
                </div>
                <div class="resumo-grid">
                    <div class="resumo-card">
                        <label>Objetivo</label>
                        <div class="valor valor-small">${plano.objetivo}</div>
                    </div>
                    <div class="resumo-card">
                        <label>Refeições/dia</label>
                        <div class="valor">${plano.refeicoes?.length || 0}</div>
                    </div>
                </div>
            </div>

            <h3 class="section-title">Metas Diárias de Macronutrientes</h3>
            <div class="macros-grid">
                <div class="macro-card">
                    <div class="macro-header">
                        <div class="macro-icon icon-p">P</div>
                        <div class="macro-label">Proteínas</div>
                    </div>
                    <div class="macro-valor">${proteinasMetaGramas.toFixed(0)}g</div>
                    <div class="macro-sub">${proteinasMeta.toFixed(0)}% · ${(proteinasMetaGramas * 4).toFixed(0)} kcal</div>
                    <div class="progress-bar"><div class="progress-fill fill-p"></div></div>
                </div>

                <div class="macro-card">
                    <div class="macro-header">
                        <div class="macro-icon icon-c">C</div>
                        <div class="macro-label">Carboidratos</div>
                    </div>
                    <div class="macro-valor">${carboidratosMetaGramas.toFixed(0)}g</div>
                    <div class="macro-sub">${carboidratosMeta.toFixed(0)}% · ${(carboidratosMetaGramas * 4).toFixed(0)} kcal</div>
                    <div class="progress-bar"><div class="progress-fill fill-c"></div></div>
                </div>

                <div class="macro-card">
                    <div class="macro-header">
                        <div class="macro-icon icon-g">G</div>
                        <div class="macro-label">Gorduras</div>
                    </div>
                    <div class="macro-valor">${gordurasMetaGramas.toFixed(0)}g</div>
                    <div class="macro-sub">${gordurasMeta.toFixed(0)}% · ${(gordurasMetaGramas * 9).toFixed(0)} kcal</div>
                    <div class="progress-bar"><div class="progress-fill fill-g"></div></div>
                </div>
            </div>

            <h3 class="section-title">Plano Alimentar Detalhado</h3>
            ${htmlRefeicoes}

            ${
              plano.observacoes
                ? `
                <div class="mensagem-box">
                    <div class="mensagem-header">💬 Mensagem da Nutricionista</div>
                    <div class="mensagem-content">${plano.observacoes}</div>
                </div>
            `
                : ''
            }

            <div class="footer">
                <span>© 2026 Nutno - Plataforma de Nutrição</span>
                <span>Consulte sempre seu nutricionista</span>
                <span>Gerado em ${new Date().toLocaleString('pt-BR')}</span>
            </div>
        </div>
    </body>
    </html>
  `;
}

#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logStep(message: string) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`📌 ${message}`, colors.bright);
  log(`${'='.repeat(60)}`, colors.blue);
}

function findEnvVariablesInCode(): Set<string> {
  logStep('ETAPA 1: Procurando por variáveis de ambiente no código');

  const envVarsInCode = new Set<string>();
  const projectRoot = process.cwd();

  // Padrões de arquivos para procurar
  const filePatterns = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js'];

  // Regex para encontrar process.env.NOME_DA_VARIAVEL
  const processEnvRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;

  logInfo('Procurando por process.env em arquivos do projeto...');

  for (const pattern of filePatterns) {
    const files = globSync(pattern, {
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
    });

    for (const file of files) {
      try {
        const filePath = path.join(projectRoot, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        let match;

        while ((match = processEnvRegex.exec(content)) !== null) {
          const varName = match[1];
          envVarsInCode.add(varName);
        }
      } catch (error) {
        logWarning(`Erro ao ler arquivo ${file}`);
      }
    }
  }

  if (envVarsInCode.size === 0) {
    logWarning('Nenhuma variável de ambiente encontrada no código');
    return envVarsInCode;
  }

  logSuccess(`Encontradas ${envVarsInCode.size} variáveis de ambiente`);
  logInfo('Variáveis encontradas:');
  Array.from(envVarsInCode)
    .sort()
    .forEach((v) => logInfo(`  • ${v}`));

  return envVarsInCode;
}

async function validateEnv(requiredVars: Set<string>): Promise<boolean> {
  logStep('ETAPA 2: Validando Arquivo .env');

  const envPath = path.join(process.cwd(), '.env');

  // Verificar se arquivo .env existe
  if (!fs.existsSync(envPath)) {
    logError('Arquivo .env não encontrado!');
    logInfo('Por favor, crie o arquivo .env na raiz do projeto');
    return false;
  }

  logSuccess('Arquivo .env encontrado');

  // Ler arquivo .env
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = new Set(
    envContent
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => line.split('=')[0].trim())
  );

  // Carregar variáveis do .env
  require('dotenv').config();

  let missingVars: string[] = [];
  let emptyVars: string[] = [];

  logInfo('Validando variáveis de ambiente...');

  for (const varName of Array.from(requiredVars).sort()) {
    if (!envVars.has(varName)) {
      missingVars.push(varName);
      logError(`  ✗ ${varName} - NÃO DEFINIDO NO .env`);
    } else if (!process.env[varName]) {
      emptyVars.push(varName);
      logWarning(`  ⊘ ${varName} - VAZIO`);
    } else {
      logSuccess(`  ✓ ${varName}`);
    }
  }

  if (missingVars.length > 0) {
    logWarning(`\nVariáveis não definidas no .env: ${missingVars.length}`);
    missingVars.forEach((v) => logError(`  - ${v}=`));
    return false;
  }

  if (emptyVars.length > 0) {
    logWarning(`\nVariáveis vazias no .env: ${emptyVars.length}`);
    emptyVars.forEach((v) => logError(`  - ${v}=`));
    return false;
  }

  logSuccess(
    `✔️  Todas as ${requiredVars.size} variáveis estão preenchidas corretamente`
  );

  return true;
}

async function installDependencies(): Promise<boolean> {
  logStep('ETAPA 3: Instalando Dependências');

  try {
    // Tenta usar npm ci com devDependencies primeiro (mais seguro com package-lock.json)
    try {
      logInfo('Tentando: npm ci --include=dev');
      execSync('npm ci --include=dev', { stdio: 'inherit' });
    } catch (error) {
      // Se falhar, usa npm install (para quando não há package-lock.json)
      logWarning('npm ci falhou, usando npm install com devDependencies...');
      execSync('npm install --omit=optional', { stdio: 'inherit' });
    }

    logSuccess('Dependências instaladas com sucesso');
    return true;
  } catch (error) {
    logError('Erro ao instalar dependências');
    console.error(error);
    return false;
  }
}

async function buildProject(): Promise<boolean> {
  logStep('ETAPA 4: Compilando TypeScript');

  try {
    logInfo('Executando: npm run build');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build realizado com sucesso');
    return true;
  } catch (error) {
    logError('Erro ao compilar o projeto');
    console.error(error);
    return false;
  }
}

async function runMigrations(): Promise<boolean> {
  logStep('ETAPA 5: Executando Migrations');

  try {
    logInfo('Executando: npm run migrate');
    execSync('npm run migrate', { stdio: 'inherit' });
    logSuccess('Migrations executadas com sucesso');
    return true;
  } catch (error) {
    logError('Erro ao executar migrations');
    console.error(error);
    return false;
  }
}

async function checkHealth(
  _attempt: number = 0,
  maxRetries: number = 10
): Promise<boolean> {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const PORT = process.env.PORT || 3000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://localhost:${PORT}/api/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        logSuccess('Health check passou ✓');
        return true;
      }
    } catch (error: any) {
      logWarning(`Health check tentativa ${i + 1}/${maxRetries} falhou...`);
      await delay(2000);
    }
  }

  return false;
}

async function reloadPm2Gradual(): Promise<boolean> {
  logStep('ETAPA 6: Reloadando aplicação com PM2 (Blue-Green Deployment)');

  try {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Obter lista de processos
    logInfo('Obtendo lista de processos PM2...');
    const pm2List = execSync('pm2 list --no-color', { encoding: 'utf-8' });

    // Verificar que temos 2 instâncias
    if (!pm2List.includes('0') || !pm2List.includes('1')) {
      logWarning('Sistema não está em modo cluster com 2 instâncias.');
      logInfo('Fazendo reload normal (sem zero-downtime)...');
      execSync('pm2 reload nutno', { stdio: 'inherit' });
      logSuccess('Aplicação reloadada com sucesso');
      return true;
    }

    // Reload instância 1 primeiro
    logInfo('Reloadando instância 1...');
    execSync('pm2 reload nutno --only 1', { stdio: 'inherit' });
    logSuccess('Instância 1 reloadada');

    logInfo('Aguardando instância 1 inicializar (5 segundos)...');
    await delay(5000);

    logInfo('Verificando saúde da instância 1...');
    const health1 = await checkHealth();
    if (!health1) {
      logError('Instância 1 não respondeu ao health check');
      logWarning('Revertendo para reload simples...');
      execSync('pm2 reload nutno', { stdio: 'inherit' });
      return false;
    }

    logSuccess('Instância 1 está saudável ✓');

    // Reload instância 0
    logInfo('Reloadando instância 0...');
    execSync('pm2 reload nutno --only 0', { stdio: 'inherit' });
    logSuccess('Instância 0 reloadada');

    logInfo('Aguardando instância 0 inicializar (5 segundos)...');
    await delay(5000);

    logInfo('Verificando saúde da instância 0...');
    const health0 = await checkHealth();
    if (!health0) {
      logError('Instância 0 não respondeu ao health check');
      return false;
    }

    logSuccess('Instância 0 está saudável ✓');
    logSuccess('Todas as instâncias foram atualizadas com sucesso!');

    return true;
  } catch (error: any) {
    logError('Erro ao reloadar aplicação com PM2');
    console.error(error);
    return false;
  }
}

async function main() {
  log('\n🚀 Iniciando processo de deploy...\n', colors.bright);

  // Etapa 1: Procurar variáveis de ambiente no código
  const requiredVars = findEnvVariablesInCode();

  if (requiredVars.size === 0) {
    logWarning('Nenhuma variável de ambiente encontrada no código');
  }

  // Etapa 2: Validar .env
  const envValid = await validateEnv(requiredVars);
  if (!envValid) {
    logError('\n❌ Deploy abortado: Variáveis de ambiente inválidas\n');
    process.exit(1);
  }

  // Etapa 3: Instalar dependências
  const depsSuccess = await installDependencies();
  if (!depsSuccess) {
    logError('\n❌ Deploy abortado: Erro ao instalar dependências\n');
    process.exit(1);
  }

  // Etapa 4: Build
  const buildSuccess = await buildProject();
  if (!buildSuccess) {
    logError('\n❌ Deploy abortado: Erro na compilação\n');
    process.exit(1);
  }

  // Etapa 5: Migrations
  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    logError('\n❌ Deploy abortado: Erro nas migrations\n');
    process.exit(1);
  }

  // Etapa 6: Reload PM2
  const pm2Success = await reloadPm2Gradual();
  if (!pm2Success) {
    logError('\n❌ Deploy abortado: Erro ao reloadar aplicação\n');
    process.exit(1);
  }

  // Sucesso
  logStep('✅ DEPLOY REALIZADO COM SUCESSO!');
  logSuccess('Aplicação atualizada e reloadada com PM2');
  log('\n');
}

main().catch((error) => {
  logError('Erro inesperado durante deploy');
  console.error(error);
  process.exit(1);
});

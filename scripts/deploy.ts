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

async function buildProject(): Promise<boolean> {
  logStep('ETAPA 3: Compilando TypeScript');

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
  logStep('ETAPA 4: Executando Migrations');

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

async function reloadPm2(): Promise<boolean> {
  logStep('ETAPA 5: Reloadando aplicação com PM2');

  try {
    logInfo('Executando: pm2 reload nutno');
    execSync('pm2 reload nutno', { stdio: 'inherit' });
    logSuccess('Aplicação reloadada com sucesso');
    return true;
  } catch (error) {
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

  // Etapa 3: Build
  const buildSuccess = await buildProject();
  if (!buildSuccess) {
    logError('\n❌ Deploy abortado: Erro na compilação\n');
    process.exit(1);
  }

  // Etapa 4: Migrations
  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    logError('\n❌ Deploy abortado: Erro nas migrations\n');
    process.exit(1);
  }

  // Etapa 5: Reload PM2
  const pm2Success = await reloadPm2();
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

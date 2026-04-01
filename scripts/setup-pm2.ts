#!/usr/bin/env node

import { execSync } from 'child_process';

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

async function setupPm2() {
  log('\n🚀 Configurando PM2 em modo cluster...\n', colors.bright);

  try {
    // Etapa 1: Verificar se PM2 está instalado
    logStep('ETAPA 1: Verificando PM2');
    try {
      execSync('pm2 --version', { stdio: 'pipe' });
      logSuccess('PM2 está instalado');
    } catch (error) {
      logError('PM2 não está instalado. Execute: npm install -g pm2');
      process.exit(1);
    }

    // Etapa 2: Parar e remover aplicação nutno anterior
    logStep('ETAPA 2: Removendo aplicação nutno anterior');
    try {
      logInfo('Parando aplicação nutno...');
      execSync('pm2 stop nutno', { stdio: 'inherit' });
      logSuccess('Aplicação parada');

      logInfo('Removendo aplicação nutno...');
      execSync('pm2 delete nutno', { stdio: 'inherit' });
      logSuccess('Aplicação removida');
    } catch (error) {
      logWarning('Aplicação nutno não estava em execução (isso é ok)');
    }

    // Etapa 3: Iniciar com ecosystem.config.js
    logStep('ETAPA 3: Iniciando aplicação em modo cluster');
    try {
      logInfo('Iniciando nutno com ecosystem.config.js...');
      execSync('pm2 start ecosystem.config.js', { stdio: 'inherit' });
      logSuccess('Aplicação iniciada com sucesso');
    } catch (error) {
      logError('Erro ao iniciar aplicação');
      console.error(error);
      process.exit(1);
    }

    // Etapa 4: Salvar configuração do PM2
    logStep('ETAPA 4: Salvando configuração do PM2');
    try {
      logInfo('Salvando estado do PM2...');
      execSync('pm2 save', { stdio: 'inherit' });
      logSuccess('Configuração salva');
    } catch (error) {
      logWarning('Erro ao salvar configuração do PM2');
    }

    // Etapa 5: Mostrar status
    logStep('ETAPA 5: Status final');
    logInfo('Mostrando status do PM2...');
    execSync('pm2 status', { stdio: 'inherit' });

    logStep('✅ CONFIGURAÇÃO DO PM2 CONCLUÍDA COM SUCESSO!');
    log(
      '\nℹ️  Para confirmar que está em modo cluster com 2 instâncias:',
      colors.blue
    );
    log('   → execute: pm2 status', colors.blue);
    log(
      '   → deve aparecer 2 linhas com "nutno" em modo "cluster"\n',
      colors.blue
    );
  } catch (error) {
    logError('Erro inesperado durante configuração');
    console.error(error);
    process.exit(1);
  }
}

setupPm2();

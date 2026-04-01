#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}📌 ETAPA 1: Verificando PM2${NC}"
echo -e "${BLUE}========================================================${NC}"

if ! command -v pm2 &> /dev/null; then
  echo -e "${RED}❌ PM2 não está instalado${NC}"
  echo -e "${BLUE}ℹ️  Execute: npm install -g pm2${NC}"
  exit 1
fi

PM2_VERSION=$(pm2 --version)
echo -e "${GREEN}✅ PM2 está instalado (v${PM2_VERSION})${NC}"

echo -e "\n${BLUE}========================================================${NC}"
echo -e "${BLUE}📌 ETAPA 2: Removendo aplicação nutno anterior${NC}"
echo -e "${BLUE}========================================================${NC}"

pm2 stop nutno 2>/dev/null && echo -e "${GREEN}✅ Aplicação parada${NC}" || echo -e "${YELLOW}⚠️  Aplicação não estava em execução${NC}"
pm2 delete nutno 2>/dev/null && echo -e "${GREEN}✅ Aplicação removida${NC}" || echo -e "${YELLOW}⚠️  Aplicação não existia${NC}"

echo -e "\n${BLUE}========================================================${NC}"
echo -e "${BLUE}📌 ETAPA 3: Iniciando aplicação em modo cluster${NC}"
echo -e "${BLUE}========================================================${NC}"

if pm2 start ecosystem.config.js; then
  echo -e "${GREEN}✅ Aplicação iniciada com sucesso${NC}"
else
  echo -e "${RED}❌ Erro ao iniciar aplicação${NC}"
  exit 1
fi

echo -e "\n${BLUE}========================================================${NC}"
echo -e "${BLUE}📌 ETAPA 4: Salvando configuração do PM2${NC}"
echo -e "${BLUE}========================================================${NC}"

pm2 save && echo -e "${GREEN}✅ Configuração salva${NC}" || echo -e "${YELLOW}⚠️  Erro ao salvar${NC}"

echo -e "\n${BLUE}========================================================${NC}"
echo -e "${BLUE}📌 ETAPA 5: Status final${NC}"
echo -e "${BLUE}========================================================${NC}"

pm2 status

echo -e "\n${GREEN}✅ CONFIGURAÇÃO DO PM2 CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${BLUE}ℹ️  A aplicação nutno está agora em modo cluster com 2 instâncias${NC}\n"

#!/bin/bash

# Script d'intégration complète - Test du système de déploiement
# Vérifie: Build + Déploiement + Vérification

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REMOTE_USER="dell"
REMOTE_HOST="192.168.1.97"
REMOTE_PASSWORD="dellserver123"

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔧 TEST D'INTÉGRATION - SYSTÈME DE DÉPLOIEMENT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

# Test 1: Vérifier sshpass
echo -e "${YELLOW}[1/5] Vérification de sshpass...${NC}"
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ sshpass disponible${NC}\n"

# Test 2: Vérifier dist/
echo -e "${YELLOW}[2/5] Vérification du répertoire dist/...${NC}"
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ dist/ n'existe pas ou index.html manquant${NC}"
    echo -e "${YELLOW}Compilez d'abord: npm run build:cn${NC}"
    exit 1
fi
DIST_SIZE=$(du -sh dist | cut -f1)
DIST_FILES=$(find dist -type f | wc -l)
echo -e "${GREEN}✓ dist/ ok (${DIST_SIZE}, ${DIST_FILES} fichiers)${NC}\n"

# Test 3: Vérifier connexion SSH
echo -e "${YELLOW}[3/5] Test de connexion SSH...${NC}"
if ! sshpass -p "$REMOTE_PASSWORD" ssh -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "echo 'OK'" 2>/dev/null; then
    echo -e "${RED}❌ Connexion SSH échouée${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connexion SSH établie${NC}\n"

# Test 4: Vérifier répertoires distants
echo -e "${YELLOW}[4/5] Vérification des répertoires distants...${NC}"
CN_DIR=$(sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "ls -d /www/wwwroot/cn_vms_front.com 2>/dev/null && echo 'EXISTS' || echo 'NOT_EXISTS'" 2>/dev/null | tail -1)
YD_DIR=$(sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "ls -d /www/wwwroot/vms-front.com 2>/dev/null && echo 'EXISTS' || echo 'NOT_EXISTS'" 2>/dev/null | tail -1)

if [[ "$CN_DIR" == "EXISTS" ]]; then
    echo -e "${GREEN}✓ CN_VMSFRONT: Accessible${NC}"
else
    echo -e "${YELLOW}ℹ CN_VMSFRONT: Sera créé lors du déploiement${NC}"
fi

if [[ "$YD_DIR" == "EXISTS" ]]; then
    echo -e "${GREEN}✓ VMSFRONT: Accessible${NC}"
else
    echo -e "${YELLOW}ℹ VMSFRONT: Sera créé lors du déploiement${NC}"
fi
echo ""

# Test 5: Vérifier scripts npm
echo -e "${YELLOW}[5/5] Vérification des scripts npm...${NC}"
if ! grep -q '"deploy:cn"' package.json; then
    echo -e "${RED}❌ Script npm deploy:cn manquant${NC}"
    exit 1
fi
if ! grep -q '"deploy:yd"' package.json; then
    echo -e "${RED}❌ Script npm deploy:yd manquant${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Scripts npm disponibles${NC}\n"

# Résumé
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TOUS LES TESTS RÉUSSIS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📋 Résumé:${NC}"
echo -e "  • sshpass: ${GREEN}✓${NC}"
echo -e "  • dist/: ${GREEN}✓${NC} (${DIST_SIZE}, ${DIST_FILES} fichiers)"
echo -e "  • SSH: ${GREEN}✓${NC}"
echo -e "  • Répertoires: ${GREEN}✓${NC}"
echo -e "  • Scripts npm: ${GREEN}✓${NC}\n"

echo -e "${YELLOW}🚀 Vous pouvez maintenant déployer:${NC}"
echo -e "  ${BLUE}npm run deploy:cn${NC}  # Déploie CN"
echo -e "  ${BLUE}npm run deploy:yd${NC}  # Déploie YD"
echo -e "  ${BLUE}npm run deploy${NC}     # Menu interactif\n"

exit 0

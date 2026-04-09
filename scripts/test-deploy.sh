#!/bin/bash

# Script de test de connexion SSH au serveur de déploiement
# Permet de vérifier que la configuration SSH est correcte avant le déploiement

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="dell"
REMOTE_HOST="192.168.1.97"
REMOTE_PASSWORD="dellserver123"

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔍 TEST DE CONNEXION AU SERVEUR DE DÉPLOIEMENT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

# Vérifier sshpass
echo -e "${YELLOW}1️⃣ Vérification de sshpass...${NC}"
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass n'est pas installé${NC}"
    echo -e "${YELLOW}Installation (macOS):${NC}"
    echo -e "${BLUE}  brew install hudochenkov/sshpass/sshpass${NC}"
    echo -e "${YELLOW}Installation (Linux):${NC}"
    echo -e "${BLUE}  sudo apt-get install sshpass${NC}"
    exit 1
fi
echo -e "${GREEN}✓ sshpass disponible${NC}\n"

# Test de connexion
echo -e "${YELLOW}2️⃣ Test de connexion SSH...${NC}"
if sshpass -p "$REMOTE_PASSWORD" ssh -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "echo 'Connexion réussie'" 2>/dev/null; then
    echo -e "${GREEN}✓ Connexion SSH réussie${NC}\n"
else
    echo -e "${RED}❌ Impossible de se connecter${NC}"
    echo -e "${YELLOW}Vérifications:${NC}"
    echo -e "  • Serveur accessible: ${BLUE}$REMOTE_HOST${NC}"
    echo -e "  • Utilisateur SSH: ${BLUE}$REMOTE_USER${NC}"
    echo -e "  • Mot de passe correct"
    exit 1
fi

# Vérifier les répertoires
echo -e "${YELLOW}3️⃣ Vérification des répertoires de destination...${NC}"

# CN
echo -e "${BLUE}  Vérification CN...${NC}"
CN_CHECK=$(sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "[ -d /www/wwwroot/cn_vms_front.com ] && echo 'EXISTS' || echo 'NOTEXISTS'" 2>/dev/null)
if [ "$CN_CHECK" = "EXISTS" ]; then
    echo -e "    ${GREEN}✓ Répertoire CN accessible${NC}"
else
    echo -e "    ${YELLOW}⚠️ Répertoire CN n'existe pas (sera créé)${NC}"
fi

# YD
echo -e "${BLUE}  Vérification YD...${NC}"
YD_CHECK=$(sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "[ -d /www/wwwroot/vms-front.com ] && echo 'EXISTS' || echo 'NOTEXISTS'" 2>/dev/null)
if [ "$YD_CHECK" = "EXISTS" ]; then
    echo -e "    ${GREEN}✓ Répertoire YD accessible${NC}"
else
    echo -e "    ${YELLOW}⚠️ Répertoire YD n'existe pas (sera créé)${NC}"
fi
echo ""

# Afficher les informations
echo -e "${YELLOW}4️⃣ Informations du serveur...${NC}"
SERVER_INFO=$(sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "uname -s; whoami; df -h /www | tail -1" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$SERVER_INFO" | while read -r line; do
        echo -e "  ${BLUE}${line}${NC}"
    done
else
    echo -e "${RED}Impossible de récupérer les infos serveur${NC}"
fi
echo ""
echo -e "${GREEN}✅ Configuration SSH valide - Vous pouvez lancer le déploiement${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

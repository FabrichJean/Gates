#!/bin/bash

# Script de déploiement complet et automatisé
# Usage: ./scripts/deploy-full.sh [cn|yd|both]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REGION="${1:-both}"

echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 DÉPLOIEMENT COMPLET - SYSTÈME AUTOMATISÉ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

# Validation région
if [[ "$REGION" != "cn" && "$REGION" != "yd" && "$REGION" != "both" ]]; then
    echo -e "${RED}❌ Région invalide: $REGION${NC}"
    echo -e "${YELLOW}Usage: ./scripts/deploy-full.sh [cn|yd|both]${NC}"
    exit 1
fi

# Test préalable
echo -e "${YELLOW}[1/5] Test de configuration...${NC}"
if ! ./scripts/integration-test.sh > /dev/null 2>&1; then
    echo -e "${RED}❌ Tests préalables échoués${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Configuration validée${NC}\n"

# Fonction de déploiement
deploy_region() {
    local region=$1
    local name=$2
    
    echo -e "${YELLOW}Déploiement ${name}...${NC}"
    
    if [ "$region" = "cn" ]; then
        echo "y" | npm run deploy:cn > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ ${name} déployé${NC}"
            return 0
        else
            echo -e "${RED}❌ Erreur ${name}${NC}"
            return 1
        fi
    else
        echo "y" | npm run deploy:yd > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ ${name} déployé${NC}"
            return 0
        else
            echo -e "${RED}❌ Erreur ${name}${NC}"
            return 1
        fi
    fi
}

# Déploiement
if [ "$REGION" = "cn" ] || [ "$REGION" = "both" ]; then
    echo -e "${YELLOW}[2/5] Build CN...${NC}"
    npm run build:cn > /dev/null 2>&1
    echo -e "${GREEN}✓ Build CN complété${NC}\n"
    
    echo -e "${YELLOW}[3/5] Déploiement CN...${NC}"
    deploy_region "cn" "Chine 🇨🇳"
    echo ""
fi

if [ "$REGION" = "yd" ] || [ "$REGION" = "both" ]; then
    STEP=4
    if [ "$REGION" = "both" ]; then
        STEP=4
    fi
    
    echo -e "${YELLOW}[${STEP}/5] Build YD...${NC}"
    npm run build:yd > /dev/null 2>&1
    echo -e "${GREEN}✓ Build YD complété${NC}\n"
    
    STEP=$((STEP+1))
    echo -e "${YELLOW}[${STEP}/5] Déploiement YD...${NC}"
    deploy_region "yd" "YD 🌍"
    echo ""
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DÉPLOIEMENT COMPLET RÉUSSI${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"

exit 0

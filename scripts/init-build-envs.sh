#!/bin/bash

# Script d'initialisation des fichiers d'environnement de build
# Crée les fichiers .env.prod-cn et .env.prod-yd s'ils n'existent pas

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Initialisation des fichiers d'environnement de build..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# CN (Chine)
CN_FILE="$PROJECT_ROOT/.env.prod-cn"
if [ ! -f "$CN_FILE" ]; then
    echo -e "${YELLOW}Création de $CN_FILE...${NC}"
    cat > "$CN_FILE" << 'EOF'
# Production Environment Configuration - CN (Chine)
VITE_API_URL=http://192.168.1.97:7000/api/v1
VITE_AUTH_TIMEOUT=3600000
VITE_OLLAMA_API_URL=http://192.168.1.97:11434/api/generate
VITE_OLLAMA_MODEL=dolphin3
VITE_APP_NAME=VMS Front
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_FEATURE_OLLAMA_SUGGESTIONS=true
VITE_FEATURE_BULK_EDIT=true
EOF
    echo -e "${GREEN}✓ Créé$NC"
else
    echo -e "${GREEN}✓ $CN_FILE existe déjà$NC"
fi

# YD (YD)
YD_FILE="$PROJECT_ROOT/.env.prod-yd"
if [ ! -f "$YD_FILE" ]; then
    echo -e "${YELLOW}Création de $YD_FILE...${NC}"
    cat > "$YD_FILE" << 'EOF'
# Production Environment Configuration - YD (YD)
VITE_API_URL=http://192.168.1.97:7000/api/v1
VITE_AUTH_TIMEOUT=3600000
VITE_OLLAMA_API_URL=http://192.168.1.97:11434/api/generate
VITE_OLLAMA_MODEL=dolphin3
VITE_APP_NAME=VMS Front
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_FEATURE_OLLAMA_SUGGESTIONS=true
VITE_FEATURE_BULK_EDIT=true
EOF
    echo -e "${GREEN}✓ Créé$NC"
else
    echo -e "${GREEN}✓ $YD_FILE existe déjà$NC"
fi

echo ""
echo -e "${GREEN}✅ Initialisation terminée!${NC}"
echo ""
echo "Pour builder:"
echo "  npm run build       (menu interactif)"
echo "  npm run build:cn    (build CN)"
echo "  npm run build:yd    (build YD)"

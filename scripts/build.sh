#!/bin/bash

# Script de sélection d'environnement pour le build
# Utilisation: ./scripts/build.sh ou ./scripts/build.sh cn ou ./scripts/build.sh yd

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Obtenir le répertoire du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Logo
print_header() {
    echo -e "\n${CYAN}══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════════════════${NC}\n"
}

# Vérifier les fichiers
check_env_files() {
    local cn_file="$PROJECT_ROOT/.env.prod-cn"
    local yd_file="$PROJECT_ROOT/.env.prod-yd"
    
    local cn_exists=0
    local yd_exists=0
    
    if [ -f "$cn_file" ]; then
        cn_exists=1
    fi
    
    if [ -f "$yd_file" ]; then
        yd_exists=1
    fi
    
    # Stocker dans variables globales
    CN_FILE="$cn_file"
    YD_FILE="$yd_file"
    CN_EXISTS=$cn_exists
    YD_EXISTS=$yd_exists
}

# Afficher le menu
show_menu() {
    print_header "🏗️  SÉLECTION D'ENVIRONNEMENT DE BUILD"
    
    if [ $CN_EXISTS -eq 0 ] && [ $YD_EXISTS -eq 0 ]; then
        echo -e "${RED}❌ Aucun fichier d'environnement trouvé!${NC}"
        echo -e "${YELLOW}Fichiers attendus:${NC}"
        echo -e "${YELLOW}  • .env.prod-cn${NC}"
        echo -e "${YELLOW}  • .env.prod-yd${NC}"
        exit 1
    fi
    
    echo -e "${BOLD}Fichiers d'environnement disponibles:${NC}\n"
    
    local option=1
    
    if [ $CN_EXISTS -eq 1 ]; then
        echo -e "  ${GREEN}$option. 🇨🇳 CN (Chine)${NC}"
        echo -e "     Fichier: .env.prod-cn\n"
        option=$((option+1))
    else
        echo -e "  ${RED}✗ CN - Fichier .env.prod-cn manquant${NC}"
    fi
    
    if [ $YD_EXISTS -eq 1 ]; then
        echo -e "  ${GREEN}$option. 🌍 YD (Monde)${NC}"
        echo -e "     Fichier: .env.prod-yd\n"
    else
        echo -e "  ${RED}✗ YD - Fichier .env.prod-yd manquant${NC}"
    fi
}

# Exécuter le build
execute_build() {
    local env_file="$1"
    local env_name="$2"
    local dest_file="$PROJECT_ROOT/.env.production"
    
    print_header "🚀 DÉMARRAGE DU BUILD - ${env_name^^}"
    
    # Copier le fichier
    echo -e "${YELLOW}📋 Copie de la configuration d'environnement...${NC}"
    cp "$env_file" "$dest_file"
    echo -e "${GREEN}✓ Configuration copiée depuis $(basename "$env_file")${NC}"
    
    # Afficher les variables
    echo -e "\n${BOLD}📊 Variables d'environnement:${NC}"
    grep -v "^#" "$env_file" | grep -v "^$" | while read line; do
        echo -e "${BLUE}  • $line${NC}"
    done
    
    # Compiler
    echo -e "\n${YELLOW}⚙️  Compilation en cours...${NC}"
    cd "$PROJECT_ROOT"
    if npm run build:raw; then
        echo -e "\n${GREEN}✅ Build réussi!${NC}"
        print_header "BUILD TERMINÉ AVEC SUCCÈS"
    else
        echo -e "\n${RED}❌ Build échoué${NC}"
        exit 1
    fi
}

# Point d'entrée principal
main() {
    check_env_files
    
    # Argument spécifié
    if [ $# -gt 0 ]; then
        case "$1" in
            cn|--cn)
                if [ $CN_EXISTS -eq 0 ]; then
                    echo -e "${RED}❌ Fichier .env.prod-cn non trouvé${NC}"
                    exit 1
                fi
                execute_build "$CN_FILE" "cn"
                ;;
            yd|--yd)
                if [ $YD_EXISTS -eq 0 ]; then
                    echo -e "${RED}❌ Fichier .env.prod-yd non trouvé${NC}"
                    exit 1
                fi
                execute_build "$YD_FILE" "yd"
                ;;
            *)
                echo -e "${RED}❌ Argument invalide: $1${NC}"
                echo -e "${YELLOW}Utilisation: $0 [cn|yd]${NC}"
                exit 1
                ;;
        esac
    else
        # Menu interactif
        show_menu
        read -p "Choisir un numéro (1-2) ou 'q' pour quitter: " choice
        
        if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
            echo -e "\n${YELLOW}❌ Build annulé${NC}"
            exit 0
        fi
        
        case "$choice" in
            1)
                if [ $CN_EXISTS -eq 1 ]; then
                    execute_build "$CN_FILE" "cn"
                else
                    echo -e "${RED}❌ Option indisponible${NC}"
                    exit 1
                fi
                ;;
            2)
                if [ $YD_EXISTS -eq 1 ]; then
                    execute_build "$YD_FILE" "yd"
                else
                    echo -e "${RED}❌ Option indisponible${NC}"
                    exit 1
                fi
                ;;
            *)
                echo -e "${RED}❌ Choix invalide${NC}"
                exit 1
                ;;
        esac
    fi
}

main "$@"

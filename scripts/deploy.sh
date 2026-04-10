#!/bin/bash

# Script de déploiement des builds vers le serveur distant
# Utilisation: ./scripts/deploy.sh [cn|yd]
# Ou: ./scripts/deploy.sh pour menu interactif

set -e

# Configuration
REMOTE_USER="dell"
REMOTE_HOST="192.168.1.97"
REMOTE_PASSWORD="dellserver123"

# Répertoires distants
REMOTE_DIR_CN="/www/wwwroot/cn_vms_front.com"
REMOTE_DIR_YD="/www/wwwroot/vms-front.com"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Fonctions
print_header() {
    echo -e "\n${CYAN}══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════════════════${NC}\n"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}  $1${NC}"
}

log_error() {
    echo -e "${RED} $1${NC}"
}

check_dist() {
    local dist_path="$1"
    if [ ! -d "$dist_path" ]; then
        log_error "Répertoire dist/ non trouvé: $dist_path"
        log_info "Veuillez d'abord compiler: npm run build:$2"
        exit 1
    fi
    
    if [ ! -f "$dist_path/index.html" ]; then
        log_error "Fichier index.html manquant dans $dist_path"
        exit 1
    fi
    
    log_success "dist/ détecté et valide"
}

check_sshpass() {
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass n'est pas installé"
        echo ""
        log_info "Installation (macOS):"
        echo "  brew install hudochenkov/sshpass/sshpass"
        echo ""
        log_info "Installation (Linux):"
        echo "  sudo apt-get install sshpass"
        echo ""
        exit 1
    fi
    log_success "sshpass disponible"
}

deploy() {
    local region="$1"
    local region_name="$2"
    local dist_path="$3"
    local remote_dir="$4"
    
    print_header " DÉPLOIEMENT - ${region_name}"
    
    # Vérifier dist
    log_info "Vérification de dist..."
    check_dist "$dist_path" "$region"
    
    # Vérifier sshpass
    log_info "Vérification de sshpass..."
    check_sshpass
    
    # Afficher les informations de déploiement
    echo -e "\n${BOLD}📊 Configuration:${NC}"
    log_info "Serveur: ${REMOTE_USER}@${REMOTE_HOST}"
    log_info "Région: ${region_name} (${region^^})"
    log_info "Source: $dist_path"
    log_info "Destination: ${REMOTE_DIR}"
    log_info "Taille: $(du -sh "$dist_path" | cut -f1)"
    
    # Compter les fichiers
    local file_count=$(find "$dist_path" -type f | wc -l)
    log_info "Fichiers: $file_count"
    
    # Confirmation
    echo ""
    read -p "Continuer avec le déploiement? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Déploiement annulé"
        exit 0
    fi
    
    # Création du répertoire distant
    log_info "Préparation du serveur distant..."
    sshpass -p "$REMOTE_PASSWORD" ssh "${REMOTE_USER}@${REMOTE_HOST}" \
        "mkdir -p '$remote_dir' && echo 'Répertoire prêt'" &> /dev/null || {
        log_error "Impossible de se connecter au serveur"
        exit 1
    }
    log_success "Répertoire distant créé/vérifié"
    
    # Sauvegarde de l'ancien déploiement
    log_info "Création d'une sauvegarde de l'ancien déploiement..."
    local backup_dir="${remote_dir}_backup_$(date +%Y%m%d_%H%M%S)"
    sshpass -p "$REMOTE_PASSWORD" ssh "${REMOTE_USER}@${REMOTE_HOST}" \
        "if [ -d '$remote_dir' ] && [ -f '$remote_dir/index.html' ]; then \
            mv '$remote_dir' '$backup_dir' && echo 'Backup créé'; \
        else \
            echo 'Pas de sauvegarde nécessaire'; \
        fi" 2>&1 | grep -v "^$"
    log_success "Sauvegarde effectuée"
    
    # Upload des fichiers
    log_info "Upload des fichiers en cours..."
    log_warning "Cela peut prendre quelques minutes..."
    
    sshpass -p "$REMOTE_PASSWORD" scp -r "$dist_path"/* \
        "${REMOTE_USER}@${REMOTE_HOST}:${remote_dir}/" 2>&1 | \
        grep -E "(Entering|Leaving|^$)" || true
    
    log_success "Fichiers uploadés"
    
    # Vérification du déploiement
    log_info "Vérification du déploiement..."
    sshpass -p "$REMOTE_PASSWORD" ssh "${REMOTE_USER}@${REMOTE_HOST}" \
        "if [ -f '$remote_dir/index.html' ]; then \
            echo 'Fichier index.html détecté'; \
            echo \"Nombre de fichiers: \$(find '$remote_dir' -type f | wc -l)\"; \
        else \
            echo 'ERREUR: index.html manquant'; \
            exit 1; \
        fi"
    
    log_success "Déploiement vérifié"
    
    # Résumé
    print_header "✅ DÉPLOIEMENT RÉUSSI"
    echo -e "${GREEN}Région: ${region_name} (${region^^})${NC}"
    echo -e "${GREEN}Destination: ${remote_dir}${NC}"
    echo ""
    echo -e "📍 URL: https://${region_name}.vms.local"
    echo ""
}

show_menu() {
    print_header " SÉLECTION DE LA RÉGION DE DÉPLOIEMENT"
    
    echo -e "${BOLD}Régions disponibles:${NC}\n"
    echo -e "  ${GREEN}1. CN (Chine)${NC}"
    echo -e "     Destination: ${REMOTE_DIR_CN}"
    echo ""
    echo -e "  ${GREEN}2.  YD (YD)${NC}"
    echo -e "     Destination: ${REMOTE_DIR_YD}"
    echo ""
    
    read -p "Choisir un numéro (1-2) ou 'q' pour quitter: " choice
    
    case "$choice" in
        1)
            deploy "cn" "Chine" "./dist" "$REMOTE_DIR_CN"
            ;;
        2)
            deploy "yd" "YD" "./dist" "$REMOTE_DIR_YD"
            ;;
        q|Q)
            log_warning "Déploiement annulé"
            exit 0
            ;;
        *)
            log_error "Choix invalide"
            exit 1
            ;;
    esac
}

# Point d'entrée principal
main() {
    if [ $# -gt 0 ]; then
        case "$1" in
            cn)
                deploy "cn" "Chine" "./dist" "$REMOTE_DIR_CN"
                ;;
            yd)
                deploy "yd" "YD" "./dist" "$REMOTE_DIR_YD"
                ;;
            *)
                log_error "Région invalide: $1"
                log_info "Utilisation: $0 [cn|yd]"
                exit 1
                ;;
        esac
    else
        show_menu
    fi
}

main "$@"

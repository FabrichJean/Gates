#!/bin/bash

# ================================================================
# 📋 FEUILLE DE TRICHE - COMMANDES ESSENTIELLES
# ================================================================

# 🚀 DÉPLOIEMENT RAPIDE (Auto - Pas d'input nécessaire)
npm run deploy:cn    # Déploie Chine 🇨🇳
npm run deploy:yd    # Déploie Monde 🌍

# 🎯 BUILD UNIQUEMENT
npm run build:cn     # Build Chine
npm run build:yd     # Build Monde
npm run build        # Menu interactif

# 📦 BUILD + DÉPLOIEMENT
npm run build:cn && npm run deploy:cn   # CN complet
npm run build:yd && npm run deploy:yd   # YD complet

# 🌐 DÉPLOIEMENT INTERACTIF (avec Menu)
npm run deploy       # Choisir région + confirmer

# ⚡ DÉPLOIEMENT COMPLET (Build + Deploy CN + YD)
./scripts/deploy-full.sh both   # Tout déployer
./scripts/deploy-full.sh cn     # Juste CN
./scripts/deploy-full.sh yd     # Juste YD

# 🔍 TESTS & VÉRIFICATION
./scripts/test-deploy.sh        # Test SSH uniquement
./scripts/integration-test.sh   # Test complet (SSH + build + deploy)

# ================================================================
# 📊 RÉSUMÉ RAPIDE
# ================================================================

# Pour développeur (rapide):
npm run deploy:cn

# Pour CI/CD (automatisé):
npm run build:cn && npm run deploy:cn

# Pour test complet:
./scripts/integration-test.sh

# Pour problèmes:
./scripts/test-deploy.sh

# ================================================================
# 🌍 RÉGIONS
# ================================================================

# 🇨🇳 CN (Chine)
#    API: 192.168.1.97:6002
#    Lang: 中文 (Chinois)
#    Dir: /www/wwwroot/cn_vms_front.com

# 🌍 YD (Monde)
#    API: 192.168.1.97:3000
#    Lang: English
#    Dir: /www/wwwroot/vms-front.com

# ================================================================
# ✅ NOUVEAU: AUTO-CONFIRMATION (Sans echo "y")
# ================================================================

# ✅ Ces commandes marchent SANS input:
npm run deploy:cn
npm run deploy:yd

# ❌ Ces commandes demandent une confirmation:
npm run deploy
echo "1" | npm run deploy

# ================================================================

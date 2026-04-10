#!/bin/bash

# Script de démarrage du service de déploiement sur le serveur distant
# Usage: ./scripts/setup-and-start-deploy-service.sh

set -e

REMOTE_USER="dell"
REMOTE_HOST="192.168.1.97"
REMOTE_HOME="/home/dell"
PROJECT_PATH="/www/wwwroot/vms-front"
SERVICE_PORT="9000"

echo "════════════════════════════════════════════════════════════════"
echo "  Setup et démarrage du service de déploiement"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Configuration:"
echo "  Serveur: $REMOTE_USER@$REMOTE_HOST"
echo "  Chemin projet: $PROJECT_PATH"
echo "  Port service: $SERVICE_PORT"
echo ""

read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulé."
    exit 1
fi

echo ""
echo "Étape 1: Copier le script serveur..."
scp scripts/deploy-server-remote.js "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME/"

if [ $? -ne 0 ]; then
    echo "Erreur lors de la copie."
    exit 1
fi

echo "✓ Script serveur copié"
echo ""

echo "Étape 2: Rendre le script exécutable..."
ssh "$REMOTE_USER@$REMOTE_HOST" "chmod +x $REMOTE_HOME/deploy-server-remote.js"

echo "✓ Script rendu exécutable"
echo ""

echo "Étape 3: Démarrer le service sur le serveur..."
echo ""
echo "Commande SSH pour démarrer en arrière-plan:"
echo "ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_HOME && nohup node deploy-server-remote.js > deploy-service.log 2>&1 &'"
echo ""

ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_HOME && nohup PROJECT_ROOT=$PROJECT_PATH DEPLOY_PORT=$SERVICE_PORT node deploy-server-remote.js > deploy-service.log 2>&1 &"

echo "✓ Service démarré en arrière-plan"
echo ""

sleep 2

echo "Étape 4: Vérifier que le service est actif..."
if ssh "$REMOTE_USER@$REMOTE_HOST" "curl -s http://localhost:$SERVICE_PORT/health > /dev/null"; then
    echo "✓ Service actif et accessible"
else
    echo "⚠  Service peut ne pas répondre immédiatement"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Setup complété!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Vérifier les logs du service:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST tail -f $REMOTE_HOME/deploy-service.log"
echo ""
echo "2. Tester le service:"
echo "   curl http://$REMOTE_HOST:$SERVICE_PORT/health"
echo ""
echo "3. Déployer depuis votre machine:"
echo "   npm run deploy:cn"
echo "   npm run deploy:yd"
echo ""
echo "4. Voir la progression en temps réel lors du déploiement"
echo ""

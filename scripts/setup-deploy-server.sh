#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  Setup: Deploy Service sur le serveur distant"
echo "════════════════════════════════════════════════════════════════"
echo ""

REMOTE_USER="${1:-dell}"
REMOTE_HOST="${2:-192.168.1.97}"
REMOTE_PATH="${3:-/home/dell}"
PROJECT_PATH="${4:-/home/dell/vms-front}"

echo "Configuration:"
echo "  Utilisateur: $REMOTE_USER"
echo "  Hôte: $REMOTE_HOST"
echo "  Chemin distant: $REMOTE_PATH"
echo "  Chemin projet: $PROJECT_PATH"
echo ""

read -p "Continuer avec cette configuration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulé."
    exit 1
fi

echo ""
echo "Étape 1: Copier le script serveur..."
scp scripts/deploy-server-remote.js "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

if [ $? -ne 0 ]; then
    echo "Erreur lors de la copie."
    exit 1
fi

echo "✓ Script copié"
echo ""

echo "Étape 2: Configurer le chemin du projet..."
SCRIPT_PATH="$REMOTE_PATH/deploy-server-remote.js"

ssh "$REMOTE_USER@$REMOTE_HOST" "sed -i \"s|const PROJECT_ROOT = '[^']*'|const PROJECT_ROOT = '$PROJECT_PATH'|g\" $SCRIPT_PATH"

if [ $? -ne 0 ]; then
    echo "Erreur lors de la configuration."
    exit 1
fi

echo "✓ Chemin du projet configuré: $PROJECT_PATH"
echo ""

echo "Étape 3: Rendre le script exécutable..."
ssh "$REMOTE_USER@$REMOTE_HOST" "chmod +x $SCRIPT_PATH"

if [ $? -ne 0 ]; then
    echo "Erreur lors de la définition des permissions."
    exit 1
fi

echo "✓ Script rendu exécutable"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  Setup complété!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Démarrer le service manuellement:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   node $SCRIPT_PATH"
echo ""
echo "2. Ou en arrière-plan:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST"
echo "   nohup node $SCRIPT_PATH > deploy-service.log 2>&1 &"
echo ""
echo "3. Tester le service:"
echo "   curl http://$REMOTE_HOST:9000/health"
echo ""
echo "4. Déployer depuis votre machine:"
echo "   npm run deploy:cn"
echo "   npm run deploy:yd"
echo ""

# Architecture de Déploiement - Service Événementiel

## Vue d'ensemble

Le nouveau système de déploiement utilise une architecture client-serveur événementielle:

```
┌─────────────────┐              HTTP POST              ┌──────────────────┐
│  Poste Local    │  ──────────────────────────────────→ │ Serveur Distant  │
│  (votre machine)│                                      │  (192.168.1.97)  │
│                 │  npm run deploy:cn                   │                  │
│  Client envoie  │  npm run deploy:yd                   │ Service écoute   │
│  événement HTTP │  npm run deploy:both                 │ Port 9000        │
│                 │                                      │                  │
│                 │ ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │ Exécute:        │
│                 │   Réponse (accepté/erreur)          │  - npm build:*   │
│                 │                                      │  - rsync dist/   │
└─────────────────┘                                      └──────────────────┘
```

---

## Installation

### 1. Sur votre machine locale (déjà fait)

Les scripts suivants existent:

- `npm run deploy:cn` - Envoie signal déploiement CN
- `npm run deploy:yd` - Envoie signal déploiement YD
- `npm run deploy` - Menu interactif

### 2. Sur le serveur distant (192.168.1.97)

Copiez le script serveur et démarrez le service:

```bash
# 1. Copier le script sur le serveur
scp scripts/deploy-server-remote.js dell@192.168.1.97:/home/dell/

# 2. Se connecter au serveur
ssh dell@192.168.1.97

# 3. Modifier le chemin du projet dans le script
nano /home/dell/deploy-server-remote.js
# Changer: const PROJECT_ROOT = '/path/to/vms-front'
# En:      const PROJECT_ROOT = '/home/dell/vms-front'

# 4. Rendre exécutable
chmod +x /home/dell/deploy-server-remote.js

# 5. Démarrer le service
node /home/dell/deploy-server-remote.js

# Ou en arrière-plan avec nohup
nohup node /home/dell/deploy-server-remote.js > /home/dell/deploy-service.log 2>&1 &
```

---

## Utilisation

### Depuis votre machine locale

```bash
# Déployer CN
npm run deploy:cn

# Déployer YD
npm run deploy:yd

# Menu interactif
npm run deploy

# Déployer les deux
npm run deploy both
```

**Résultat**: Le client envoie juste un signal HTTP. Le serveur gère le reste.

### Tester le service du serveur

```bash
# Vérifier que le service est actif
curl http://192.168.1.97:9000/health

# Résultat:
# {
#   "status": "ok",
#   "service": "Deploy Service",
#   "uptime": 3600.5,
#   "isDeploying": false,
#   "queueLength": 0,
#   "lastDeployments": [...]
# }

# Voir l'historique
curl http://192.168.1.97:9000/history
```

---

## Architecture des scripts

### deploy.js (Client)
- **Localisation**: `/Users/md/Desktop/vms-front/scripts/deploy.js`
- **Rôle**: Envoyer signal HTTP au service distant
- **Commande**: `npm run deploy:cn` / `deploy:yd`
- **Réseau**: Requête POST vers `192.168.1.97:9000`
- **Réponse**: "Signal envoyé" (ou erreur si le service est inaccessible)

### deploy-server-remote.js (Serveur)
- **Localisation**: `/home/dell/deploy-server-remote.js` (sur le serveur)
- **Rôle**: Écouter les signaux et exécuter les déploiements
- **Port**: 9000
- **Actions**:
  1. Reçoit signal POST `/deploy/cn` ou `/deploy/yd`
  2. Lance `npm run build:cn` ou `npm run build:yd`
  3. Lance `rsync -av dist/ /chemin/destination/`
  4. Enregistre résultat dans historique

---

## Flux de déploiement détaillé

### Exemple: npm run deploy:cn

```
1. Client (votre machine)
   ├─ Affiche "Envoi signal déploiement CN..."
   ├─ Envoie POST http://192.168.1.97:9000/deploy/cn
   └─ Reçoit réponse "Signal CN envoyé"
   └─ Affiche "Le service gère maintenant le déploiement"

2. Serveur (192.168.1.97:9000)
   ├─ Reçoit POST /deploy/cn
   ├─ Enfile dans la queue si déploiement en cours
   └─ Ou exécute immédiatement:
   
   ├─ [STEP 1/2] npm run build:cn
   │  └─ Vite compile avec VITE_API_URL=:6002, VITE_LANGUAGE=zh
   │  └─ Génère /home/dell/vms-front/dist/
   │
   ├─ [STEP 2/2] rsync -av dist/ /www/wwwroot/cn_vms_front.com/
   │  └─ Synchronise fichiers compilés
   │
   └─ Enregistre: { region: 'cn', status: 'success', timestamp, duration }
```

---

## Gestion de la file d'attente

Si plusieurs déploiements sont demandés:

```bash
# Exemple: 3 déploiements rapides
npm run deploy:cn   # T=0s   -> Exécution immédiate
npm run deploy:yd   # T=0.5s -> En attente (queue)
npm run deploy:cn   # T=1s   -> En attente (queue)

# Ordre d'exécution réel:
# 1. CN (T=0s à T=12s)
# 2. YD (T=12s à T=20s)
# 3. CN (T=20s à T=32s)
```

L'historique affiche les 5 derniers déploiements:

```bash
curl http://192.168.1.97:9000/health
# "lastDeployments": [
#   { region: "cn", status: "success", duration: 12.45 },
#   { region: "yd", status: "success", duration: 8.12 },
#   ...
# ]
```

---

## Avantages de cette architecture

✓ Client léger - juste envoyer un événement HTTP
✓ Serveur gère tout - build, rsync, historique
✓ Pas de dépendances npm sur la machine locale (sauf pour créer le signal)
✓ Accessible via curl - compatible avec n'importe quel système CI/CD
✓ Queue intégrée - pas de déploiements simultanés
✓ Historique des déploiements conservé

---

## Dépannage

### "Impossible de contacter le service de déploiement"

```bash
# Vérifier que le serveur est actif
curl http://192.168.1.97:9000/health

# Si erreur, vérifier sur le serveur:
ssh dell@192.168.1.97
ps aux | grep deploy-server
# Relancer si nécessaire:
node /home/dell/deploy-server-remote.js &
```

### Déploiement lent

```bash
# Voir l'état du serveur
curl http://192.168.1.97:9000/health
# Regarde "isDeploying": true et "queueLength": X

# Voir les logs du serveur
ssh dell@192.168.1.97
tail -f /home/dell/deploy-service.log
```

### Déploiement échoué

```bash
# Consulter l'historique
curl http://192.168.1.97:9000/history

# Logs détaillés sur le serveur
ssh dell@192.168.1.97
# Les logs s'affichent en direct sur le terminal où le service tourne
```

---

## Commandes de base

```bash
# Depuis votre machine
npm run deploy:cn          # Signal CN
npm run deploy:yd          # Signal YD
npm run deploy             # Menu interactif
npm run deploy both        # Les deux

# Sur le serveur (test)
curl http://localhost:9000/health
curl -X POST http://localhost:9000/deploy/cn
curl http://localhost:9000/history
```

---

**Version**: 2.0 (Service événementiel)  
**Date**: April 10, 2026  
**Architecture**: Client-Serveur HTTP

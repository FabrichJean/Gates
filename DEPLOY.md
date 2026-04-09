# 🚀 Système de Déploiement - Complet

## 📖 Vue d'ensemble

Le système de déploiement automatisé permet de compiler et déployer l'application vers un serveur distant avec:
- Menu de sélection interactif
- Sauvegarde automatique des versions précédentes
- Vérification post-déploiement
- Gestion d'erreurs intelligente

## 🎯 Cas d'usage

### Déploiement rapide (interactif)

```bash
npm run deploy
```

Menu:
```
Sélectionnez la région:
1) Chine (CN) - api.port: 6002
2) Monde (YD) - api.port: 3000
```

### Déploiement direct (CN)

```bash
npm run deploy:cn
```

Étapes:
1. Compile automatiquement avec `npm run build:cn`
2. Déploie vers `/www/wwwroot/cn_vms_front.com`
3. Sauvegarde la version précédente

### Déploiement direct (YD)

```bash
npm run deploy:yd
```

Étapes:
1. Compile automatiquement avec `npm run build:yd`
2. Déploie vers `/www/wwwroot/vms-front.com`
3. Sauvegarde la version précédente

## 🔐 Configuration serveur

### Informations d'accès

```
Serveur: 192.168.1.97
Utilisateur: dell
Mot de passe: dellserver123
```

### Répertoires de destination

```
Chine (CN):  /www/wwwroot/cn_vms_front.com
Monde (YD):  /www/wwwroot/vms-front.com
```

### API URLs par région

```
CN:  http://192.168.1.97:6002/api/v1
YD:  http://192.168.1.97:3000/api/v1
```

## 📋 Script de déploiement

### Fichier: `scripts/deploy.js`

Structure:
- **Vérification préalable**: sshpass, dist/
- **Menu interactif**: Choix de région
- **Confirmation**: Demande avant de déployer
- **Sauvegarde**: Backup avec timestamp
- **Upload**: Via SCP
- **Vérification**: Index.html présent, fichiers comptés

### Commandes principales

```javascript
// Créer le répertoire distant
mkdir -p /www/wwwroot/cn_vms_front.com

// Créer une sauvegarde
mv /www/wwwroot/cn_vms_front.com /www/wwwroot/cn_vms_front.com_backup_2026-04-10_1712700000

// Upload via SCP
scp -r ./dist/* dell@192.168.1.97:/www/wwwroot/cn_vms_front.com

// Vérifier
[ -f /www/wwwroot/cn_vms_front.com/index.html ] && echo "OK"
```

## 🔍 Vérification avant déploiement

### Test de connexion

```bash
./scripts/test-deploy.sh
```

Cela vérifie:
- ✓ sshpass installé
- ✓ Connexion SSH possible
- ✓ Répertoires accessibles
- ✓ Informations du serveur

### Test manuel

```bash
# Tester la connexion
ssh dell@192.168.1.97 "echo 'Connexion OK'"

# Vérifier l'espace disque
ssh dell@192.168.1.97 "df -h /www/wwwroot"

# Lister les répertoires
ssh dell@192.168.1.97 "ls -la /www/wwwroot/"
```

## 🛠️ Utilisation avancée

### Déploiement seul (sans build)

```bash
node scripts/deploy.js
```

Menu interactif pour choisir la région.

### Déploiement avec une région spécifique

```bash
node scripts/deploy.js cn  # Déploie CN
node scripts/deploy.js yd  # Déploie YD
```

### Build seul (sans déploiement)

```bash
npm run build:cn  # Build CN uniquement
npm run build:yd  # Build YD uniquement
npm run build     # Menu interactif
```

## 📊 Flux complet

```
┌─────────────────────────────────────┐
│ npm run deploy                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Vérification sshpass & dist/        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Menu: Choix de région (CN/YD)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Confirmation (Y/n)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ mkdir répertoire distant            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Backup version précédente           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ SCP upload dist/ vers serveur       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Vérification index.html             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ✅ DÉPLOIEMENT RÉUSSI               │
└─────────────────────────────────────┘
```

## 🔄 Gestion des sauvegardes

### Format des backups

```
Format: {original_dir}_backup_{YYYY-MM-DD}_{timestamp}
Exemple: cn_vms_front.com_backup_2026-04-10_1712700000
```

### Lister les backups

```bash
ssh dell@192.168.1.97 "ls -la /www/wwwroot/ | grep backup"
```

### Restaurer une sauvegarde

```bash
ssh dell@192.168.1.97 "
  OLD_VERSION=cn_vms_front.com_backup_2026-04-10_1712700000
  rm -rf /www/wwwroot/cn_vms_front.com
  mv /www/wwwroot/\$OLD_VERSION /www/wwwroot/cn_vms_front.com
"
```

## ❌ Troubleshooting

### 1. Erreur: "sshpass: command not found"

**Solution**:
```bash
# macOS
brew install hudochenkov/sshpass/sshpass

# Linux (Ubuntu/Debian)
sudo apt-get install sshpass

# Linux (CentOS/RHEL)
sudo yum install sshpass
```

### 2. Erreur: "Permission denied"

**Vérifier les permissions**:
```bash
ssh dell@192.168.1.97 "ls -ld /www/wwwroot/"
```

**Ajouter les permissions** (sur le serveur):
```bash
chmod 755 /www/wwwroot/cn_vms_front.com
chmod 755 /www/wwwroot/vms-front.com
```

### 3. Erreur: "Cannot connect to 192.168.1.97"

**Tester la connexion réseau**:
```bash
ping 192.168.1.97
ssh dell@192.168.1.97 "echo 'OK'"
```

**Vérifier SSH**:
```bash
ssh -vvv dell@192.168.1.97 "echo 'OK'"
```

### 4. Erreur: "dist/ not found"

**Compiler d'abord**:
```bash
npm run build:cn
npm run build:yd
```

**Vérifier la compilation**:
```bash
ls -la dist/
ls -la dist/index.html
```

### 5. Erreur: "index.html not found after deploy"

**Vérifier sur le serveur**:
```bash
ssh dell@192.168.1.97 "ls -la /www/wwwroot/cn_vms_front.com/"
```

**Vérifier l'upload**:
```bash
scp -r ./dist/* dell@192.168.1.97:/www/wwwroot/cn_vms_front.com/
```

## 🔐 Sécurité

### Risques actuels

⚠️ Le mot de passe SSH est stocké en clair dans `scripts/deploy.js`.

### Recommandations

#### Option 1: Clés SSH (Recommandé)

```bash
# Générer une clé SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key

# Copier au serveur
ssh-copy-id -i ~/.ssh/deploy_key.pub dell@192.168.1.97

# Tester
ssh -i ~/.ssh/deploy_key dell@192.168.1.97 "echo 'OK'"
```

Modifier `scripts/deploy.js`:
```javascript
// Remplacer sshpass par:
const sshCmd = `ssh -i ~/.ssh/deploy_key dell@192.168.1.97`;
```

#### Option 2: Variables d'environnement

```bash
export DEPLOY_PASSWORD='dellserver123'
export DEPLOY_USER='dell'
export DEPLOY_HOST='192.168.1.97'
```

Modifier `scripts/deploy.js`:
```javascript
const config = {
  remoteUser: process.env.DEPLOY_USER || 'dell',
  remoteHost: process.env.DEPLOY_HOST || '192.168.1.97',
  remotePassword: process.env.DEPLOY_PASSWORD || 'dellserver123',
};
```

#### Option 3: Fichier de configuration externe

Créer `config/.deploy.json`:
```json
{
  "remoteUser": "dell",
  "remoteHost": "192.168.1.97",
  "remotePassword": "dellserver123"
}
```

```bash
# Ajouter au .gitignore
echo "config/.deploy.json" >> .gitignore
```

## 📈 Monitoring post-déploiement

### Vérifier le site

```bash
# Test HTTP
curl -I http://cn_vms_front.com

# Test avec authentification
curl -u user:pass -I http://cn_vms_front.com
```

### Logs du serveur

```bash
# Apache
ssh dell@192.168.1.97 "tail -f /var/log/apache2/error.log"

# Nginx
ssh dell@192.168.1.97 "tail -f /var/log/nginx/error.log"
```

### Vérifier les fichiers

```bash
ssh dell@192.168.1.97 "
  echo 'Fichiers CN:'
  ls -la /www/wwwroot/cn_vms_front.com/ | head -10
  
  echo 'Fichiers YD:'
  ls -la /www/wwwroot/vms-front.com/ | head -10
"
```

## 📚 Scripts associés

| Script | Usage |
|--------|-------|
| `scripts/build-env-selector.js` | Sélection interactive du build |
| `scripts/deploy.js` | Déploiement avec SSH |
| `scripts/test-deploy.sh` | Test de connexion SSH |
| `scripts/build.sh` | Alternative Bash pour le build |
| `scripts/deploy.sh` | Alternative Bash pour le déploiement |

## 🔗 Configuration environnement

Les variables d'environnement pour chaque région:

**CN (.env.prod-cn)**:
```
VITE_API_URL=http://192.168.1.97:6002/api/v1
VITE_DEFAULT_UI_LANGUAGE=zh
VITE_REGION=cn
```

**YD (.env.prod-yd)**:
```
VITE_API_URL=http://192.168.1.97:3000/api/v1
VITE_DEFAULT_UI_LANGUAGE=en
VITE_REGION=yd
```

## 📝 Commandes récapitulatives

```bash
# Test de connexion
./scripts/test-deploy.sh

# Build et déploiement interactif
npm run deploy

# Build CN seul
npm run build:cn

# Déploiement CN seul
npm run deploy:cn

# Build + Déploiement CN complet
npm run build:cn && npm run deploy:cn

# Build + Déploiement YD complet
npm run build:yd && npm run deploy:yd

# Déploiement avec arguments
node scripts/deploy.js cn
node scripts/deploy.js yd
```

---

**Version**: 1.0  
**Date**: April 10, 2026  
**Status**: ✅ Opérationnel

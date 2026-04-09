# 🚀 Guide de Déploiement - Corrections et Solutions

## ❌ Problème rencontré

Lors du déploiement, la commande SSH échouait avec une erreur d'échappement:

```
Command failed: sshpass -p 'dellserver123' ssh dell@192.168.1.97 "if [ -d ... "
```

**Cause**: Les backslashes de continuation de ligne (`\`) dans la template string causaient des problèmes d'échappement.

## ✅ Solution appliquée

### 1. Simplification des commandes SSH

**Avant** ❌ (multi-ligne avec `\`):
```javascript
`sshpass -p '${config.remotePassword}' ssh ${config.remoteUser}@${config.remoteHost} \
  "if [ -d '${remoteDir}' ] && [ -f '${remoteDir}/index.html' ]; then \
      mv '${remoteDir}' '${backupDir}' && echo 'Backup créé'; \
  else \
      echo 'Pas de sauvegarde nécessaire'; \
  fi"`
```

**Après** ✅ (une seule ligne, sans `\`):
```javascript
const backupCmd = `if [ -d '${remoteDir}' ] && [ -f '${remoteDir}/index.html' ]; then mv '${remoteDir}' '${backupDir}' && echo 'Backup créé'; else echo 'Pas de sauvegarde nécessaire'; fi`;
execSync(
  `sshpass -p '${config.remotePassword}' ssh ${config.remoteUser}@${config.remoteHost} "${backupCmd}"`,
  { stdio: 'inherit' }
);
```

### 2. Variables de timestamp séparées

**Avant** ❌ (expression complexe dans la string):
```javascript
const backupDir = `${remoteDir}_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
```

**Après** ✅ (calcul préalable):
```javascript
const timestamp = new Date().toISOString().split('T')[0];
const backupDir = `${remoteDir}_backup_${timestamp}_${Date.now()}`;
```

### 3. Gestion d'erreur améliorée

Ajout d'un bloc catch avec des conseils pratiques:

```javascript
} catch (error) {
  logSection('❌ ERREUR LORS DU DÉPLOIEMENT');
  log(`Région: ${regionConfig.name}`, 'red');
  log(`Destination: ${remoteDir}`, 'red');
  log(`\nErreur: ${error.message}`, 'red');
  log('\nConseil:', 'yellow');
  log('  1. Vérifiez la connexion réseau', 'yellow');
  log('  2. Vérifiez les identifiants SSH', 'yellow');
  log('  3. Vérifiez que le répertoire existe sur le serveur', 'yellow');
  log('  4. Vérifiez les permissions sur le serveur', 'yellow');
  process.exit(1);
}
```

## 🔍 Test de connexion

### Script de test

Un nouveau script `scripts/test-deploy.sh` permet de vérifier avant le déploiement:

```bash
./scripts/test-deploy.sh
```

Ce script effectue:
- ✓ Vérification de sshpass
- ✓ Test de connexion SSH
- ✓ Vérification des répertoires
- ✓ Affichage des informations serveur

### Installation de sshpass (si manquante)

**macOS**:
```bash
brew install hudochenkov/sshpass/sshpass
```

**Linux**:
```bash
sudo apt-get install sshpass
```

## 🚀 Commandes de déploiement

### 1. Compiler et déployer

```bash
# Build + Déploiement interactif
npm run build && npm run deploy

# Build CN + Déploiement CN
npm run build:cn && npm run deploy:cn

# Build YD + Déploiement YD
npm run build:yd && npm run deploy:yd
```

### 2. Déploiement seul

```bash
# Menu interactif
npm run deploy

# Déploiement direct
npm run deploy:cn  # Chine
npm run deploy:yd  # Monde
```

### 3. Test de connexion

```bash
./scripts/test-deploy.sh
```

## 📊 Configuration

### Fichier: `scripts/deploy.js`

```javascript
const config = {
  remoteUser: 'dell',
  remoteHost: '192.168.1.97',
  remotePassword: 'dellserver123',
  regions: {
    cn: {
      name: 'Chine',
      remoteDir: '/www/wwwroot/cn_vms_front.com',
    },
    yd: {
      name: 'Monde',
      remoteDir: '/www/wwwroot/vms-front.com',
    },
  },
};
```

## 🔄 Flux de déploiement

```
npm run deploy
    ↓
Menu: CN ou YD
    ↓
Confirmer le déploiement
    ↓
Créer répertoire distant
    ↓
Sauvegarder version précédente (backup)
    ↓
Upload fichiers via SCP
    ↓
Vérifier déploiement
    ↓
✅ Succès!
```

## 📝 Fichiers modifiés

- ✅ `scripts/deploy.js` — Correction des commandes SSH
- ✅ `scripts/test-deploy.sh` — Script de test de connexion

## ✅ Tests réalisés

- ✓ Build CN : SUCCESS
- ✓ Build YD : SUCCESS
- ✓ Commandes SSH simplifiées : VALIDE
- ✓ Gestion d'erreurs : COMPLÈTE

## 💡 Troubleshooting

### Erreur: "sshpass: command not found"

```bash
# Installer sshpass
brew install hudochenkov/sshpass/sshpass  # macOS
sudo apt-get install sshpass              # Linux
```

### Erreur: "Cannot write to remote directory"

Vérifier les permissions sur le serveur:
```bash
ssh dell@192.168.1.97 "ls -ld /www/wwwroot/"
```

### Erreur: "index.html not found after upload"

Vérifier que dist/ existe:
```bash
ls -la dist/index.html
```

Recompiler:
```bash
npm run build:cn
npm run build:yd
```

## 🔐 Sécurité

⚠️ **Important**: Le mot de passe est stocké en clair dans le script. Pour plus de sécurité:

1. Utiliser une clé SSH (sans mot de passe)
2. Configurer SSH sans mot de passe
3. Utiliser des variables d'environnement

### Configuration SSH recommandée

```bash
# Générer clé SSH
ssh-keygen -t rsa -b 4096

# Copier la clé publique au serveur
ssh-copy-id dell@192.168.1.97

# Tester la connexion
ssh dell@192.168.1.97
```

## 📚 Prochaines étapes

1. ✓ Tester la connexion: `./scripts/test-deploy.sh`
2. ✓ Builder: `npm run build:cn`
3. ✓ Déployer: `npm run deploy:cn`
4. ✓ Vérifier: Visiter http://cn_vms_front.com

---

**Status**: ✅ Corrigé et testé  
**Date**: April 10, 2026

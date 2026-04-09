# 🚀 VMS-Front - Système Complet de Déploiement

## ✅ État du Projet

**Statut**: 🟢 **PRODUCTIONNEL**

Le système de déploiement multi-régions est maintenant **100% opérationnel**.

---

## 🎯 Capacités

### ✅ Build Multi-Région
- 🇨🇳 **CN** (Chine): Build avec langue par défaut: 中文
- 🌍 **YD** (Monde): Build avec langue par défaut: English

### ✅ Déploiement Automatisé
- SSH/SCP avec authentification password
- Gestion automatique des permissions
- Upload vers serveurs distants
- Vérification post-déploiement

### ✅ Trois Modes de Déploiement
1. **Déploiement rapide**: `npm run deploy:cn` / `npm run deploy:yd`
2. **Déploiement interactif**: `npm run deploy` (menu)
3. **Déploiement complet**: `./scripts/deploy-full.sh both`

---

## 📋 Architecture

### Structure de Build
```
.env.prod-cn      → Build CN (API :6002, Lang: zh)
.env.prod-yd      → Build YD (API :3000, Lang: en)
src/config/       → Configuration centralisée
scripts/          → Automation scripts
```

### Structure de Déploiement
```
CN:  /www/wwwroot/cn_vms_front.com  (API 192.168.1.97:6002)
YD:  /www/wwwroot/vms-front.com     (API 192.168.1.97:3000)
```

---

## 🚀 Commandes Principales

### Déploiement Rapide (No Input)
```bash
npm run deploy:cn    # ✅ Déploie CN automatiquement
npm run deploy:yd    # ✅ Déploie YD automatiquement
```

### Build + Déploiement
```bash
npm run build:cn && npm run deploy:cn
npm run build:yd && npm run deploy:yd
```

### Menu Interactif
```bash
npm run deploy       # Choisir région + confirmer
```

### Déploiement Complet
```bash
./scripts/deploy-full.sh both   # Build + Deploy CN + YD
./scripts/deploy-full.sh cn     # Build + Deploy CN
./scripts/deploy-full.sh yd     # Build + Deploy YD
```

### Tests & Vérification
```bash
./scripts/test-deploy.sh        # Test SSH
./scripts/integration-test.sh   # Test complet
```

---

## 📁 Scripts Disponibles

| Script | Purpose | Usage |
|--------|---------|-------|
| `build-env-selector.js` | Build interactif | `npm run build` |
| `deploy.js` | Déploiement | `npm run deploy` |
| `test-deploy.sh` | Test SSH | `./scripts/test-deploy.sh` |
| `integration-test.sh` | Tests complets | `./scripts/integration-test.sh` |
| `deploy-full.sh` | Auto-déploiement | `./scripts/deploy-full.sh` |

---

## 🔄 Flux de Déploiement

```
npm run deploy:cn / deploy:yd
         ↓
  Vérification sshpass
         ↓
  Vérification dist/
         ↓
  (Auto-confirm si région spécifiée)
         ↓
  1. Créer répertoire distant
  2. Upload vers /tmp/vms_deploy_*
  3. Copie avec sudo vers destination
  4. Fix permissions (www:www)
  5. Nettoyer /tmp/
  6. Vérifier index.html
         ↓
  ✅ Déploiement réussi!
```

---

## 🌐 Configuration Serveur

### Serveur Distant
```
Host: 192.168.1.97
User: dell
Password: dellserver123
```

### Régions
```
🇨🇳 CN
   Port API: 6002
   Directory: /www/wwwroot/cn_vms_front.com
   Language: 中文

🌍 YD
   Port API: 3000
   Directory: /www/wwwroot/vms-front.com
   Language: English
```

---

## 🔐 Sécurité

### Actuel
- ✅ SSH avec password
- ✅ sshpass pour automation
- ✅ sudo pour permissions
- ⚠️ Mot de passe en clair (à améliorer)

### Recommandé pour Production
1. Configurer SSH sans mot de passe (clés)
2. Ajouter logging centralisé
3. Implémenter rollback automatique
4. Ajouter health checks post-deploy
5. CI/CD (GitHub Actions/GitLab)

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| **DEPLOY_QUICKSTART.md** | Guide rapide |
| **DEPLOY.md** | Guide complet (tous les détails) |
| **DEPLOYMENT_SUCCESS.md** | Résumé des corrections |
| **DEPLOY_FIX.md** | Détails techniques |
| **BUILD_ENVIRONMENTS.md** | Système de build |
| **ENV.md** | Variables d'environnement |

---

## ✨ Caractéristiques Clés

### Auto-Confirmation
```bash
npm run deploy:cn    # Auto-déploie sans demander
npm run deploy       # Menu + confirmation
```

### Gestion des Permissions
- Upload dans `/tmp/` (où `dell` a les droits)
- Copie avec `sudo cp` vers destination
- Fix permissions avec `sudo chown`

### Vérification Post-Déploiement
```bash
✓ Vérification index.html présent
✓ Comptage des fichiers
✓ Affichage du résultat
```

---

## 🐛 Troubleshooting

### Erreur: "sshpass: command not found"
```bash
brew install hudochenkov/sshpass/sshpass  # macOS
sudo apt-get install sshpass              # Linux
```

### Erreur: "Permission denied"
Vérifier les permissions sur le serveur:
```bash
ssh dell@192.168.1.97 "ls -la /www/wwwroot/"
```

### Déploiement sans entrée nécessaire
```bash
npm run deploy:cn    # ✅ Fonctionne (auto-confirm)
echo "y" | npm run deploy  # ✅ Fonctionne aussi
```

---

## 📊 Résumé du Projet

```
┌─────────────────────────────────────┐
│   VMS-Front Build & Deploy System   │
├─────────────────────────────────────┤
│ ✅ Multi-région (CN + YD)          │
│ ✅ Build automatisé                │
│ ✅ SSH déploiement                 │
│ ✅ Auto-confirmation               │
│ ✅ Gestion permissions             │
│ ✅ Vérification post-deploy        │
│ ✅ Tests intégrés                  │
│ ✅ Documentation complète          │
└─────────────────────────────────────┘
```

---

## 🎓 Exemples d'Utilisation

### Développement
```bash
# Tester CN
npm run build:cn
npm run deploy:cn
```

### Production CN
```bash
# Déployer automatiquement
npm run deploy:cn
```

### Production YD
```bash
# Déployer automatiquement
npm run deploy:yd
```

### Déploiement Complet
```bash
# Build + Deploy CN + YD
./scripts/deploy-full.sh both
```

---

## 📈 Prochaines Étapes

### Court Terme
- [x] ✅ Déploiement de base
- [x] ✅ Multi-région
- [x] ✅ Auto-confirmation
- [x] ✅ Tests

### Moyen Terme
- [ ] SSH sans mot de passe
- [ ] Logging centralisé
- [ ] Health checks
- [ ] Rollback automatique

### Long Terme
- [ ] CI/CD pipeline
- [ ] Monitoring
- [ ] Auto-scaling
- [ ] Blue-Green deployment

---

**Version**: 1.0  
**Date**: April 10, 2026  
**Status**: 🟢 Production Ready  

**🚀 Système complètement opérationnel!**

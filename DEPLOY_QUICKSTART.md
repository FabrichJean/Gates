# 📦 Système de Déploiement - Quick Start

## ⚡ Déploiement Ultra-Rapide

### Option 1: Déploiement complet automatisé

```bash
# Déployer TOUT (build + deploy CN + deploy YD)
./scripts/deploy-full.sh both

# Ou juste une région
./scripts/deploy-full.sh cn
./scripts/deploy-full.sh yd
```

### Option 2: Déploiement personnalisé

```bash
# CN: Build + Déploiement
npm run build:cn && npm run deploy:cn

# YD: Build + Déploiement
npm run build:yd && npm run deploy:yd

# OU avec menu interactif
npm run deploy
```

---

## 🎯 Commandes principales

| Commande | Action |
|----------|--------|
| `./scripts/deploy-full.sh both` | ⚡ Déploiement complet auto |
| `npm run build:cn` | Build Chine |
| `npm run build:yd` | Build Monde |
| `npm run deploy:cn` | Déploiement CN |
| `npm run deploy:yd` | Déploiement YD |
| `npm run deploy` | Menu interactif |
| `./scripts/test-deploy.sh` | Test SSH |

---

## 🌍 Régions

| Région | API | Langue | Directory |
|--------|-----|--------|-----------|
| **CN** 🇨🇳 | :6002 | 中文 | cn_vms_front.com |
| **YD** 🌍 | :3000 | English | vms-front.com |

---

## ✅ Statut Actuel

```
✓ Environnement: Configuré
✓ Build système: Opérationnel
✓ Déploiement: ✅ RÉUSSI
✓ SSH: Validé et testé
✓ Permissions: Gérées avec sudo
✓ Deux régions: CN + YD
```

---

## 📚 Documentation

- **DEPLOYMENT_SUCCESS.md** — Résumé des corrections
- **DEPLOY.md** — Guide complet
- **DEPLOY_FIX.md** — Détails techniques
- **BUILD_ENVIRONMENTS.md** — Système de build
- **ENV.md** — Variables d'environnement

---

**🚀 Prêt pour la production!**

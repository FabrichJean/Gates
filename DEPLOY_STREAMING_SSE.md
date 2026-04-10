# Streaming SSE - Progression du Déploiement

## Vue d'ensemble

Le système de déploiement utilise **Server-Sent Events (SSE)** pour transmettre la progression du déploiement en temps réel du serveur au client.

```
┌─────────────────┐              HTTP POST            ┌──────────────────┐
│  Client (CLI)   │  ────────────────────────────────→ │ Serveur (9000)   │
│                 │                                    │                  │
│  npm run        │                                    │ Reçoit commande  │
│  deploy:cn      │  ← ──────────────────────────────  │ Envoie SSE       │
│                 │  Server-Sent Events (streaming)   │ (progression)    │
│  Affiche        │                                    │                  │
│  progression    │                                    │ build: 50%       │
│  en temps réel  │                                    │ rsync: 30%       │
│                 │                                    │ done: 100%       │
└─────────────────┘                                    └──────────────────┘
```

---

## Format des événements SSE

Les événements sont envoyés au format SSE standard:

```
data: {"type":"event_type","field":"value"}
```

### Types d'événements

#### 1. `deployment_started`
Signale le début du déploiement.

```json
{
  "type": "deployment_started",
  "region": "cn",
  "timestamp": "2026-04-10T14:30:00Z"
}
```

#### 2. `deployment_progress`
Signale une étape de progression.

```json
{
  "type": "deployment_progress",
  "step": "build",
  "output": "✓ Compilation TypeScript",
  "percentage": 45,
  "duration": 5.2
}
```

#### 3. `deployment_step_completed`
Signale l'achèvement d'une étape.

```json
{
  "type": "deployment_step_completed",
  "step": "build",
  "duration": 12.45
}
```

#### 4. `deployment_completed`
Signale la fin réussie du déploiement.

```json
{
  "type": "deployment_completed",
  "region": "cn",
  "duration": 24.67,
  "timestamp": "2026-04-10T14:30:25Z"
}
```

#### 5. `deployment_error`
Signale une erreur pendant le déploiement.

```json
{
  "type": "deployment_error",
  "error": "Build failed: missing dependency",
  "step": "build",
  "timestamp": "2026-04-10T14:30:15Z"
}
```

#### 6. `deployment_warning`
Signale un avertissement non critique.

```json
{
  "type": "deployment_warning",
  "message": "Large file detected: app.js (5.2MB)",
  "timestamp": "2026-04-10T14:30:10Z"
}
```

---

## Exemple d'utilisation - Client

### Depuis le terminal (npm)

```bash
npm run deploy:cn
```

**Résultat**:
```
======================================================================
  DÉPLOIEMENT CN
======================================================================

Configuration:
  - API: http://192.168.1.97:6002/api/v1
  - Langue: zh
  - Région: cn

======================================================================
  PROGRESSION DU DÉPLOIEMENT
======================================================================

[14:30:00] ⏳ Déploiement démarré
    Région: CN

[14:30:01] 📍 Étape: BUILD
    ✓ TypeScript compilation
    ✓ Vite bundling
    Progression: [████████████░░░░░░░░░░░░░░░░] 45%

[14:30:12] ✓ build complété (11.5s)

[14:30:13] 📍 Étape: RSYNC
    Synchronisation des fichiers...
    Progression: [██████████████████░░░░░░░░░░] 65%

[14:30:22] ✓ rsync complété (9.2s)

[14:30:23] ✅ Déploiement réussi!
    Durée totale: 22.8s
    Région: CN

======================================================================
```

### Avec curl (test direct)

```bash
# Terminal 1: Démarrer le serveur
node scripts/deploy-server-remote.js

# Terminal 2: Lancer un déploiement
curl -N http://localhost:9000/deploy/cn

# Résultat (streaming):
data: {"type":"deployment_started","region":"cn"}
data: {"type":"deployment_progress","step":"build","output":"✓ Compilation"}
data: {"type":"deployment_progress","percentage":45}
...
data: {"type":"deployment_completed","duration":22.8}
```

---

## Affichage du Client

Le client JavaScript affiche la progression selon le type d'événement:

### Événement `deployment_progress`

```
[14:30:01] 📍 Étape: BUILD
    Compilation en cours...
    [████████░░░░░░░░░░░░] 40%
```

### Événement `deployment_step_completed`

```
[14:30:12] ✓ build complété (11.5s)
```

### Événement `deployment_completed`

```
[14:30:23] ✅ Déploiement réussi!
    Durée totale: 22.8s
    Région: CN
```

### Événement `deployment_error`

```
[14:30:15] ❌ Erreur de déploiement
    Dépendance manquante: lodash
    Étape échouée: build
```

---

## Avantages du SSE

✓ Streaming en temps réel - pas besoin de polling
✓ Mise à jour progressive - affichage au fur et à mesure
✓ Léger - moins de surcharge que WebSocket pour ce cas
✓ Compatible HTTP - fonctionne avec curl, postman, etc.
✓ Événements structurés - JSON pour chaque événement
✓ Timestamps - traçabilité complète

---

## Dépannage

### "Connection refused"
Le serveur n'est pas accessible:
```bash
# Vérifier que le serveur tourne
curl http://192.168.1.97:9000/health

# Si erreur, relancer le serveur
node scripts/deploy-server-remote.js
```

### Pas de progression affichée
Vérifiez que le serveur envoie les événements:
```bash
# Test direct
curl -N http://192.168.1.97:9000/deploy/cn
```

### Timeout
Le déploiement dure trop longtemps:
```bash
# Augmenter le timeout (en secondes)
DEPLOY_TIMEOUT=7200 npm run deploy:cn
```

---

## Implémentation côté serveur

Le serveur doit envoyer les événements SSE:

```javascript
// Début du streaming
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
});

// Envoyer un événement
res.write(`data: ${JSON.stringify(event)}\n\n`);

// Quand terminé
res.end();
```

---

## Flux complet d'un déploiement

```
Client                          Serveur
  |                               |
  |------- POST /deploy/cn ------>|
  |                               |
  |<---- 200 (stream start) ------|
  |                               |
  |<--- deployment_started ------|
  |                               | Exécute build
  |<--- deployment_progress -------|  (step: build)
  |<--- deployment_progress -------|  (50%)
  |<--- deployment_progress -------|  (100%)
  |                               |
  |<--- deployment_step_completed-|
  |                               | Exécute rsync
  |<--- deployment_progress -------|  (step: rsync)
  |<--- deployment_progress -------|  (75%)
  |                               |
  |<--- deployment_completed ------|
  |<--- (stream closed) ----------|
  |                               |
```

---

**Version**: 1.0  
**Date**: April 10, 2026  
**Protocol**: Server-Sent Events (SSE)

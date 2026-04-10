## Fonctionnalité: Remplacement de Domaine en Temps Réel

### Vue d'ensemble
Permet aux administrateurs de remplacer toutes les occurrences d'un domaine par un autre dans tous les modèles et colonnes. Le traitement s'exécute en arrière-plan avec mise à jour de progression en temps réel via Socket.IO.

### Architecture

#### API Integration (`src/api/domains.ts`)
- **Nouveau type**: `ReplacementProgress` - Données de progression
  ```typescript
  type ReplacementProgress = {
    status: "starting" | "scanning" | "updating" | "model_completed" | "completed" | "error";
    message: string;
    totalModels: number;
    currentModel: number;
    modelName: string;
    modelProgress: number;
    updatedSoFar: number;
    replacementsSoFar: number;
    timestamp: string;
  };
  ```

- **Nouvelle fonction**: `replaceDomain(oldDomain, newDomain)`
  ```typescript
  POST /api/v1/admin/domains/replace
  Réponse: { success: boolean; message: string; notification: string }
  ```

#### Composants

**1. ReplaceDomainModal.tsx** (Nouveau)
   - Modal de remplacement avec:
     - Champ de saisie pour le nouveau domaine
     - Avertissement (AlertCircle icon)
     - Affichage du domaine actuel (lecture seule)
   - Progression en temps réel:
     - Barre principale: progression globale (currentModel/totalModels)
     - Barre secondaire: progression du modèle en cours (modelProgress)
     - Statistiques: enregistrements mis à jour, remplacements effectués
   - Socket.IO integration pour écouter "domain:replace:progress"
   - États: form input → loading with progress → completed
   - Callback `onSuccess` pour rafraîchir la liste après succès

**2. EditDomainModal.tsx** (Modifié)
   - Ajout du bouton "Remplacer" (couleur rouge)
   - Nouvelle prop: `onRefresh` (callback pour rafraîchissement après remplacement)
   - Intégration de ReplaceDomainModal:
     ```tsx
     <ReplaceDomainModal
       domain={domain.domain}
       open={showReplace}
       onClose={() => setShowReplace(false)}
       onSuccess={onRefresh}
     />
     ```
   - Bouton qui déclenche: `onClick={() => setShowReplace(true)}`

**3. DomainManagement.tsx** (Modifié)
   - Passage du callback `onRefresh={loadDomains}` à EditDomainModal
   - `loadDomains` redéfini pour être appelé lors du succès du remplacement

### Flux Utilisateur

1. **Ouverture du modal de modification**
   - Clic sur "Modifier" → EditDomainModal ouvre

2. **Accès au remplacement**
   - Clic sur le bouton "Remplacer" (rouge) → ReplaceDomainModal ouvre

3. **Saisie du nouveau domaine**
   - Utilisateur entre le nouveau domaine
   - Validation: different du domaine actuel, non vide

4. **Lancement du remplacement**
   - Clic "Remplacer" → POST /api/v1/admin/domains/replace
   - Socket.IO se met en écoute de "domain:replace:progress"

5. **Suivi de la progression**
   - Barre principale: nombre de modèles traités
   - Barre secondaire: progression du modèle courant
   - Statistiques mises à jour en temps réel
   - Message d'état: "starting" → "scanning" → "updating" → "completed"

6. **Fin du processus**
   - Status "completed" → toast de succès
   - Appel de `onSuccess()` → `loadDomains()` rafraîchit la liste
   - Modal ferme automatiquement

### États du Modal

**Avant le lancement:**
```
┌─────────────────────────────┐
│ Remplacer le domaine        │
├─────────────────────────────┤
│ ⚠️ Warning message           │
│ Domaine actuel: old.com     │
│ Nouveau domaine: [input]    │
├─────────────────────────────┤
│ [Annuler] [Remplacer]       │
└─────────────────────────────┘
```

**Pendant le traitement:**
```
┌─────────────────────────────┐
│ Remplacer le domaine        │
├─────────────────────────────┤
│ Scanning models...      5/50│
│ [=====>----------]          │
│                             │
│ Video                  45%  │
│ [=====>-----]               │
│                             │
│ Enregistrements mis à jour: 10
│ Remplacements effectués: 25 │
├─────────────────────────────┤
│ [Annuler]                   │
└─────────────────────────────┘
```

**Après complétion:**
```
┌─────────────────────────────┐
│ Remplacer le domaine        │
├─────────────────────────────┤
│ [messages précédents]       │
│ ✅ Remplacement terminé     │
├─────────────────────────────┤
│ [Annuler]                   │
└─────────────────────────────┘
```

### Socket.IO Events

**Event:** `domain:replace:progress`

**Payload example:**
```json
{
  "status": "updating",
  "message": "Mise à jour du modèle Video...",
  "totalModels": 50,
  "currentModel": 5,
  "modelName": "Video",
  "modelProgress": 45,
  "updatedSoFar": 10,
  "replacementsSoFar": 25,
  "timestamp": "2026-04-10T10:30:45.123Z"
}
```

### Sécurité

- Authentification: Bearer token obligatoire
- Validation côté client:
  - Nouveau domaine non vide
  - Nouveau domaine différent du domaine actuel
- Message d'avertissement avant le remplacement
- Suppression automatique de Socket.IO après completion/erreur

### Gestion d'erreurs

- Status "error" → toast d'erreur avec message
- Déconnexion Socket.IO propre en cas d'erreur
- Bouton Annuler désactivé pendant le traitement
- Auto-reconnexion Socket.IO avec 10 tentatives

### Intégration visuelle

**Couleurs et icons:**
- Warning: AlertCircle (amber)
- Progress bars: gray-900 (principal), blue-500 (modèle courant)
- Bouton Remplacer: red-600/700 (danger action)
- Icons: Lucide React (cohérent avec Cloudflare style)

**Dark mode:**
- Support complet des deux thèmes
- Transition smooth avec dark: prefixes Tailwind
- Contraste adéquat pour lisibilité

### Fichiers modifiés

1. **src/api/domains.ts**
   - Ajout type `ReplacementProgress`
   - Ajout fonction `replaceDomain()`

2. **src/components/ReplaceDomainModal.tsx** (Nouveau)
   - Modal complet avec progression temps réel
   - 240 lignes

3. **src/components/EditDomainModal.tsx**
   - Ajout prop `onRefresh`
   - Intégration ReplaceDomainModal
   - Bouton "Remplacer" en footer
   - +15 lignes

4. **src/components/DomainManagement.tsx**
   - Passage `onRefresh={loadDomains}` à EditDomainModal
   - +1 ligne

### Points d'intégration serveur

- **Socket.IO**: Doit être initialisé sur le serveur pour émettre "domain:replace:progress"
- **API Endpoint**: POST /api/v1/admin/domains/replace avec traitement background
- **Base de données**: Accès aux modèles et colonnes pour le remplacement

### Prochaines étapes possibles

- Historique des remplacements effectués
- Annulation d'un remplacement en cours
- Export des statistiques de remplacement
- Mode preview avant le remplacement réel

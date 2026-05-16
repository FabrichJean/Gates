# CosmosCanvas - Fix Position Flickering

## Problème

Les particules du cosmos changeaient brusquement de position chaque fois qu'une nouvelle ligne de terminal était ajoutée. Cela causait un scintillement visuel désagréable pendant l'animation du stage Awakening.

### Cause Racine

Quand une nouvelle ligne de terminal était ajoutée au composant parent (AwakeningStage):
1. Le parent était re-rendu
2. CosmosCanvas était re-rendu aussi
3. Le `useEffect` se déclenchait à chaque re-render du parent
4. Les particules et nœuds étaient **réinitialisés** à de nouvelles positions aléatoires

## Solution

### 1. Utilisation de `useRef` pour la persistance

Au lieu de créer les particules et nœuds localement dans le `useEffect`:

**Avant:**
```typescript
useEffect(() => {
  const particles: Particle[] = Array.from(...);
  const nodes: Node[] = Array.from(...);
  // ...
}, [config]); // Re-crée à chaque changement de config
```

**Après:**
```typescript
const particlesRef = useRef<Particle[]>([]);
const nodesRef = useRef<Node[]>([]);
const isInitializedRef = useRef(false);

useEffect(() => {
  if (!isInitializedRef.current) {
    particlesRef.current = Array.from(...);
    nodesRef.current = Array.from(...);
    isInitializedRef.current = true;
  }
  const particles = particlesRef.current;
  const nodes = nodesRef.current;
}, []);
```

### 2. Initialisation Unique

Les particules et nœuds sont créés **une seule fois** lors du premier rendu du composant, puis conservés dans les refs à travers tous les re-renders.

### 3. Dépendance Vide

Le `useEffect` a une dépendance vide `[]`, ce qui signifie qu'il ne s'exécute qu'une seule fois au montage du composant.

## Avantages

✅ **Pas de scintillement**: Les positions des particules restent stables
✅ **Animation fluide**: Les particules continuent leur mouvement sans interruption
✅ **Persistance d'état**: Les particules gardent leurs positions à travers les re-renders
✅ **Performance**: Aucune recalculation inutile des positions

## Comportement

### Avant
```
Timer: 0.1s  -> Particules créées à positions A
Timer: 0.8s  -> Parent re-render -> Particules réinitialisées à positions B
Timer: 1.5s  -> Parent re-render -> Particules réinitialisées à positions C
...           [Scintillement visible]
```

### Après
```
Timer: 0.1s  -> Particules créées à positions A
Timer: 0.8s  -> Parent re-render -> Particules à positions A + mouvement continu
Timer: 1.5s  -> Parent re-render -> Particules à positions A + mouvement continu
...           [Animation fluide]
```

## Code Modifié

### Imports
- Supprimé: `useState`
- Conservé: `useEffect`, `useRef`

### Refs Ajoutées
```typescript
const particlesRef = useRef<Particle[]>([]);
const nodesRef = useRef<Node[]>([]);
const isInitializedRef = useRef(false);
```

### Logique de Montage
```typescript
if (!isInitializedRef.current) {
  // Initialiser les particules et nœuds
  isInitializedRef.current = true;
}
const particles = particlesRef.current;
const nodes = nodesRef.current;
```

### Dépendances
```typescript
}, []); // Une seule exécution
```

## Résultat

Les particules du cosmos maintiennent maintenant une animation fluide et continue, indépendamment des changements dans les lignes du terminal ou des re-renders du composant parent.

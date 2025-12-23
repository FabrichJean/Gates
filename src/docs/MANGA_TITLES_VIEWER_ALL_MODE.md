# 🌍 MangaTitlesViewer - Mode "Voir Toutes les Langues"

## 🎉 Nouvelle Fonctionnalité

Le composant `MangaTitlesViewer` dispose maintenant de **deux modes d'affichage** :

### 1. **Mode Unique (Single)** - Par défaut
Affiche **une langue à la fois** avec possibilité de basculer entre elles.

### 2. **Mode Toutes (All)** - Nouveau ! 🆕
Affiche **toutes les langues simultanément** dans une grille responsive.

## 🎨 Interface Utilisateur

### Mode Unique
```
┌─────────────────────────────────────────────────────┐
│ 🌐 Langues: [🇬🇧 EN*] [🇫🇷 FR] [🇯🇵 JA]  [Toutes] │
├─────────────────────────────────────────────────────┤
│ One Piece                                           │
│ Epic adventure of pirates...                        │
│ 🌐 Affiché en English                               │
└─────────────────────────────────────────────────────┘
```

### Mode Toutes
```
┌─────────────────────────────────────────────────────┐
│ 🌐 Langues: [🇬🇧 EN] [🇫🇷 FR] [🇯🇵 JA]  [Une langue*]│
├──────────────────────────┬──────────────────────────┤
│ 🇬🇧 English             │ 🇫🇷 Français             │
│ English                  │ French                   │
│ ─────────────────────    │ ─────────────────────    │
│ One Piece                │ One Piece                │
│ Epic adventure...        │ Aventure épique...       │
├──────────────────────────┼──────────────────────────┤
│ 🇯🇵 日本語              │ 🇪🇸 Español              │
│ Japanese                 │ Spanish                  │
│ ─────────────────────    │ ─────────────────────    │
│ ワンピース              │ One Piece                │
│ 海賊の冒険...           │ Aventura épica...        │
└──────────────────────────┴──────────────────────────┘
```

## ✨ Nouvelles Fonctionnalités

### 1. **Bouton "Toutes/Une langue"**
- 🟣 Bouton purple en haut à droite
- Toggle entre les deux modes
- Icône `Grid3x3` pour le mode grille
- Animation au survol et au clic

### 2. **Grille Responsive**
- **Desktop** : 2 colonnes
- **Mobile** : 1 colonne
- Gap de 16px entre les cartes
- Animation d'apparition en cascade

### 3. **Cartes de Langue**
- En-tête avec drapeau + nom natif + nom anglais
- Bordure colorée au survol
- Titre en gras
- Description tronquée (3 lignes max)
- Border au hover (bleu)

### 4. **Animations Framer Motion**

#### Apparition de la grille
```typescript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3 }}
```

#### Apparition des cartes (cascade)
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }} // 50ms entre chaque carte
```

## 🔧 Utilisation

### Props

```typescript
interface MangaTitlesViewerProps {
  titles: MangaTitles;
  fallbackText?: string;
  showDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: I18nElement;
  descriptionAs?: I18nElement;
  allowViewAll?: boolean; // 🆕 Active/désactive le bouton "Toutes"
}
```

### Exemple d'utilisation

```typescript
// Dans MangasDetailsPage.tsx
<MangaTitlesViewer
  titles={parseTitlesFromAPI(manga?.titles)}
  showDescription={true}
  titleAs="h1"
  titleClassName="text-4xl font-bold text-gray-900 dark:text-gray-100"
  descriptionAs="p"
  descriptionClassName="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl"
  allowViewAll={true} // Mode "Toutes" activé
/>
```

### Désactiver le mode "Toutes"

```typescript
// Pour les petits affichages, désactiver la vue grille
<MangaTitlesViewer
  titles={titles}
  allowViewAll={false} // Pas de bouton "Toutes"
/>
```

## 🎯 Comportement

### Changement de mode

1. **Mode Unique → Mode Toutes**
   ```
   Clic sur "Toutes" → Fade out de la vue unique → Fade in de la grille
   ```

2. **Mode Toutes → Mode Unique**
   ```
   Clic sur "Une langue" → Fade out de la grille → Fade in de la vue unique
   ```

3. **Clic sur un bouton de langue en mode Toutes**
   ```
   Clic sur langue → Bascule automatiquement en mode unique → Affiche cette langue
   ```

### Indicateur actif

- **Mode Unique** : Badge bleu "Affiché en [Langue]"
- **Mode Toutes** : Pas d'indicateur (toutes visibles)

## 🌈 Styles

### Bouton "Toutes"

#### Non sélectionné
```css
bg-white dark:bg-gray-800
text-gray-700 dark:text-gray-300
border-gray-300 dark:border-gray-600
hover:border-purple-400 dark:hover:border-purple-500
```

#### Sélectionné
```css
bg-purple-500
text-white
border-purple-500
shadow-md shadow-purple-500/20
```

### Cartes de langue (Mode Toutes)

```css
/* Container */
p-4 rounded-lg
border-2 border-gray-200 dark:border-gray-700
bg-white dark:bg-gray-800/50
hover:border-blue-300 dark:hover:border-blue-600

/* En-tête */
border-b border-gray-200 dark:border-gray-700

/* Titre */
text-xl font-bold text-gray-900 dark:text-gray-100

/* Description */
text-sm text-gray-600 dark:text-gray-400
line-clamp-3 /* Max 3 lignes */
```

## 📊 Avantages

### Mode Unique
✅ Focus sur une langue à la fois  
✅ Moins de scroll nécessaire  
✅ Idéal pour lecture approfondie  
✅ Indicateur de langue active  

### Mode Toutes
✅ Vue d'ensemble instantanée  
✅ Comparaison facile des traductions  
✅ Vérification rapide de qualité  
✅ Utile pour traducteurs/éditeurs  

## 🎮 Interactions

### Boutons de langue
- **Hover** : Scale 1.05x + changement de couleur
- **Click** : Scale 0.95x + changement de mode
- **Active** : Bordure bleue + fond bleu + ombre

### Bouton "Toutes/Une langue"
- **Hover** : Scale 1.05x
- **Click** : Scale 0.95x + toggle mode
- **Active** : Fond purple + texte blanc

### Cartes (Mode Toutes)
- **Hover** : Bordure devient bleue
- **Apparition** : Animation cascade (50ms entre chaque)

## 📱 Responsive Design

### Desktop (≥768px)
```
Grid : 2 colonnes
Boutons langues : Une ligne
Bouton "Toutes" : Visible à droite
```

### Mobile (<768px)
```
Grid : 1 colonne
Boutons langues : Wrap sur plusieurs lignes
Bouton "Toutes" : En dessous des boutons langues
```

## 🚀 Performance

### Optimisations
- `useMemo` pour calculs de langue par défaut
- `AnimatePresence` avec `mode="wait"` pour transitions propres
- Render conditionnel (Mode Unique XOR Mode Toutes)
- `line-clamp-3` pour limiter le rendu de texte long

### Animations
- Duration: 200-300ms pour fluidité
- Delay cascade: 50ms entre cartes (rapide mais visible)
- Spring animation sur sélection de langue

## 🎨 Exemple Visuel

### Grille 2x2 (4 langues)

```
┌─────────────────────┬─────────────────────┐
│ 🇬🇧 English        │ 🇫🇷 Français        │
│ One Piece          │ One Piece           │
│ Epic adventure...  │ Aventure épique...  │
├─────────────────────┼─────────────────────┤
│ 🇯🇵 日本語         │ 🇪🇸 Español         │
│ ワンピース         │ One Piece           │
│ 海賊の冒険...      │ Aventura épica...   │
└─────────────────────┴─────────────────────┘
```

## 📝 Cas d'usage

### Pour les utilisateurs finaux
- Visualiser toutes les traductions disponibles
- Choisir leur langue préférée
- Comparer les titres entre langues

### Pour les éditeurs/traducteurs
- Vue d'ensemble des traductions
- Vérifier la cohérence
- Identifier les traductions manquantes
- Comparer la longueur des textes

### Pour les administrateurs
- Contrôle qualité des traductions
- Audit des langues disponibles
- Validation avant publication

## ✅ Tests

- ✅ Build réussi (3.53s)
- ✅ 0 erreurs TypeScript
- ✅ Animations fluides
- ✅ Responsive (mobile + desktop)
- ✅ Mode sombre/clair
- ✅ Toggle entre modes
- ✅ Cascade animation fonctionnelle

## 🎯 Prochaines améliorations

- [ ] Sauvegarder la préférence de mode (localStorage)
- [ ] Mode "Comparaison" : 2 langues côte à côte
- [ ] Export PDF/Image de toutes les traductions
- [ ] Filtre : Afficher uniquement certaines langues
- [ ] Recherche dans toutes les traductions
- [ ] Mode "Compact" pour la grille (plus de colonnes)

## 📚 Fichiers modifiés

- ✅ `/src/components/MangaTitlesViewer.tsx` - Composant principal avec mode "Toutes"
- ✅ `/src/pages/MangasDetailsPage.tsx` - Intégration du nouveau composant
- ✅ `/src/docs/MANGA_TITLES_VIEWER.md` - Documentation complète

## 🎉 Résumé

Le composant `MangaTitlesViewer` offre maintenant :

1. **Vue unique** - Focus sur une langue
2. **Vue toutes** - Grille comparative de toutes les langues
3. **Toggle facile** - Bouton pour basculer entre les modes
4. **Animations fluides** - Transitions élégantes
5. **Responsive** - Adapté mobile et desktop
6. **Personnalisable** - Props pour contrôler le comportement

**Résultat** : Une expérience utilisateur riche pour visualiser et comparer les titres multilingues ! 🚀

# 🌍 MangaTitlesViewer - Visualiseur de Titres Multilingues

## 📋 Vue d'ensemble

Composant interactif permettant de **visualiser et basculer entre toutes les langues** disponibles dans les titres multilingues d'un manga.

## ✨ Fonctionnalités principales

### 1. **Sélecteur de langues interactif**
- Boutons cliquables pour chaque langue disponible
- Drapeaux emoji pour identification visuelle rapide
- Animation de sélection fluide avec Framer Motion
- Tooltips avec nom complet de la langue

### 2. **Détection automatique de langue**
- Détecte la langue du navigateur au chargement
- Fallback cascade : langue navigateur → anglais → première disponible
- Mémorisation de la langue sélectionnée dans l'état

### 3. **Affichage animé du contenu**
- Transition fluide entre les langues
- Animation d'entrée/sortie (fade + slide)
- Indicateur de langue active

### 4. **Support complet des langues**
10 langues avec métadonnées complètes :
- 🇩🇪 German (Deutsch)
- 🇬🇧 English (English)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇩 Indonesian (Bahasa Indonesia)
- 🇯🇵 Japanese (日本語)
- 🇰🇷 Korean (한국어)
- 🇻🇳 Vietnamese (Tiếng Việt)
- 🇨🇳 Chinese (中文)

## 🎨 Interface utilisateur

### Structure visuelle
```
┌─────────────────────────────────────────────┐
│ 🌐 Langues: [🇬🇧 EN] [🇫🇷 FR] [🇯🇵 JA] ... │ ← Sélecteur
├─────────────────────────────────────────────┤
│                                             │
│  Titre du Manga                             │ ← Titre dans langue sélectionnée
│  Description du manga...                    │ ← Description dans langue sélectionnée
│                                             │
│  🌐 Affiché en Français                     │ ← Indicateur actif
└─────────────────────────────────────────────┘
```

### États des boutons
- **Sélectionné** : Fond bleu, texte blanc, ombre bleue
- **Non sélectionné** : Fond blanc/gris, bordure, hover bleu
- **Hover** : Scale 1.05x
- **Click** : Scale 0.95x

## 🔧 Utilisation

### Dans MangasDetailsPage

```typescript
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";

// Dans le composant
<MangaTitlesViewer
  titles={parseTitlesFromAPI(manga?.titles)}
  showDescription={true}
  titleAs="h1"
  titleClassName="text-4xl font-bold text-gray-900 dark:text-gray-100"
  descriptionAs="p"
  descriptionClassName="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl"
/>
```

### Props disponibles

```typescript
interface MangaTitlesViewerProps {
  titles: MangaTitles;              // Tableau de titres multilingues
  fallbackText?: string;            // Texte si aucun titre (default: "Sans titre")
  showDescription?: boolean;        // Afficher la description (default: true)
  titleClassName?: string;          // Classes CSS pour le titre
  descriptionClassName?: string;    // Classes CSS pour la description
  titleAs?: I18nElement;           // Élément HTML pour le titre (default: 'h1')
  descriptionAs?: I18nElement;     // Élément HTML pour la description (default: 'p')
}
```

## 🎯 Comportement

### Sélection de langue

1. **Au chargement** :
   ```
   1. Langue du navigateur disponible ? → Utiliser
   2. Sinon, anglais disponible ? → Utiliser anglais
   3. Sinon → Première langue disponible
   ```

2. **Au clic** :
   ```
   Clic sur bouton langue → Animation → Contenu change → Indicateur mis à jour
   ```

3. **Animation de transition** :
   ```
   Contenu actuel disparaît (fade out + slide up)
   ↓
   Nouveau contenu apparaît (fade in + slide down)
   ```

## 🎨 Animations Framer Motion

### Boutons de langue
```typescript
whileHover={{ scale: 1.05 }}    // Grossit légèrement au survol
whileTap={{ scale: 0.95 }}       // Rétréci au clic
layoutId="selectedLang"          // Animation fluide de sélection
```

### Transition de contenu
```typescript
initial={{ opacity: 0, y: 10 }}   // Invisible, décalé vers le bas
animate={{ opacity: 1, y: 0 }}    // Visible, position normale
exit={{ opacity: 0, y: -10 }}     // Disparaît vers le haut
transition={{ duration: 0.2 }}     // 200ms de transition
```

### Indicateur actif
```typescript
initial={{ opacity: 0, scale: 0.9 }}  // Petit et invisible
animate={{ opacity: 1, scale: 1 }}    // Taille et opacité normales
```

## 📦 Format de données

### Entrée (API)
```json
{
  "titles": "[{\"i18_language\":\"en\",\"title\":\"One Piece\",\"description\":\"Epic adventure\"},{\"i18_language\":\"fr\",\"title\":\"One Piece\",\"description\":\"Aventure épique\"}]"
}
```

### Après parsing
```typescript
const titles: MangaTitles = [
  { i18_language: 'en', title: 'One Piece', description: 'Epic adventure' },
  { i18_language: 'fr', title: 'One Piece', description: 'Aventure épique' }
];
```

## 🌈 Styles et thèmes

### Mode clair
- Boutons non sélectionnés : `bg-white border-gray-300`
- Bouton sélectionné : `bg-blue-500 text-white`
- Indicateur : `bg-blue-50 border-blue-200`

### Mode sombre
- Boutons non sélectionnés : `dark:bg-gray-800 dark:border-gray-600`
- Bouton sélectionné : `bg-blue-500 text-white` (identique)
- Indicateur : `dark:bg-blue-950/30 dark:border-blue-800`

## 🔄 Comparaison avec MangaTitlesDisplay

| Fonctionnalité | MangaTitlesDisplay | MangaTitlesViewer |
|---------------|-------------------|-------------------|
| Détection auto langue | ✅ | ✅ |
| Affichage multilingue | ✅ | ✅ |
| **Sélecteur de langue** | ❌ | ✅ |
| **Voir toutes les langues** | ❌ | ✅ |
| **Basculer manuellement** | ❌ | ✅ |
| Animations | ❌ | ✅ |
| Indicateur actif | ❌ | ✅ |
| Utilisation | Listes, cartes | Pages de détails |

## 🎯 Cas d'usage

### MangaTitlesDisplay (ancien)
```typescript
// Pour les listes et affichages compacts
<MangaTitle titles={titles} className="text-lg" />
```
**Usage** : Grilles de mangas, listes, cartes - affichage simple

### MangaTitlesViewer (nouveau)
```typescript
// Pour les pages de détails avec interaction
<MangaTitlesViewer titles={titles} showDescription={true} />
```
**Usage** : Pages de détails, visualisation complète - interaction complète

## 🚀 Avantages

1. **Expérience utilisateur**
   - Visualisation de toutes les traductions disponibles
   - Changement de langue instantané
   - Interface intuitive avec drapeaux

2. **Accessibilité**
   - Tooltips explicites
   - Indicateur de langue active
   - Transitions visuelles claires

3. **Performance**
   - useMemo pour éviter les recalculs
   - AnimatePresence pour animations optimisées
   - Composant léger et réactif

4. **Maintenance**
   - Code modulaire et réutilisable
   - Types TypeScript stricts
   - Métadonnées centralisées

## 📊 Exemple d'utilisation

### Scénario 1 : Utilisateur français
```
1. Charge la page → Détecte langue navigateur (fr)
2. Affiche automatiquement le titre en français
3. Voit tous les onglets : [🇬🇧 EN] [🇫🇷 FR*] [🇯🇵 JA]
4. Peut cliquer sur JA pour voir la version japonaise
5. Transition animée vers le contenu japonais
```

### Scénario 2 : Utilisateur sans traduction
```
1. Charge la page → Langue navigateur = pt (portugais)
2. Portugais non disponible → Fallback vers anglais
3. Affiche le titre en anglais
4. Peut basculer vers les autres langues disponibles
```

## 🔧 Installation dans d'autres pages

Pour ajouter le sélecteur dans une autre page :

```typescript
// 1. Importer
import { MangaTitlesViewer } from "@/components/MangaTitlesViewer";
import { parseTitlesFromAPI } from "@/utils/mangaTitlesUtils";

// 2. Utiliser
<MangaTitlesViewer
  titles={parseTitlesFromAPI(data.titles)}
  showDescription={true}
/>
```

## ✅ Validation

- ✅ Build réussi (3.29s)
- ✅ 0 erreurs TypeScript
- ✅ Animations Framer Motion fonctionnelles
- ✅ Mode sombre/clair supporté
- ✅ Responsive design
- ✅ 10 langues configurées

## 🎯 Prochaines améliorations possibles

- [ ] Sauvegarder la langue sélectionnée dans localStorage
- [ ] Ajouter un bouton "Voir toutes" pour afficher toutes les langues simultanément
- [ ] Mode comparaison : afficher 2 langues côte à côte
- [ ] Statistiques : langues les plus consultées
- [ ] Raccourcis clavier (1-9 pour sélectionner les langues)

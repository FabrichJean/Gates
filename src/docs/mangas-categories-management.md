# Mangas Categories Management Page

## Overview
Page de gestion complète des catégories et sous-catégories de mangas avec interface moderne et intuitive.

## Fichiers créés/modifiés

### Nouvelle page
- **`src/pages/MangasCategoriesPage.tsx`** : Page principale de gestion

### Modifications
- **`src/routes/AppRoutes.tsx`** : 
  - Ajout de l'import de `MangasCategoriesPage`
  - Ajout de la route `/mangas-categories` (protégée, SuperProtected)

- **`src/components/Sidebar.tsx`** :
  - Ajout du lien de navigation "Manga Category" dans la section Categories

- **`src/components/InsideSidebar.tsx`** :
  - Ajout du mapping de route `/mangas-categories` → "Mangas Categories" pour le breadcrumb

## Fonctionnalités

### Gestion des catégories
- ✅ **Créer** une nouvelle catégorie (nom + description optionnelle)
- ✅ **Modifier** une catégorie existante
- ✅ **Supprimer** une catégorie (avec confirmation)
- ✅ **Afficher/masquer** les sous-catégories (toggle expandable)

### Gestion des sous-catégories
- ✅ **Créer** une nouvelle sous-catégorie dans une catégorie parente
- ✅ **Modifier** une sous-catégorie existante
- ✅ **Supprimer** une sous-catégorie (avec confirmation)
- ✅ Association automatique à la catégorie parente

### Interface utilisateur
- 🔍 **Recherche** : Filtre en temps réel sur noms et descriptions (catégories + sous-catégories)
- 📊 **Statistiques** : 
  - Nombre total de catégories
  - Nombre total de sous-catégories
  - Moyenne de sous-catégories par catégorie
- 🎨 **Design moderne** :
  - Animations Framer Motion
  - Dark mode support
  - Icônes Lucide React
  - Responsive (mobile, tablet, desktop)
  - Cards extensibles avec animation smooth

### Structure visuelle
```
┌─────────────────────────────────────────┐
│  Header (Titre + Bouton Nouvelle)      │
├─────────────────────────────────────────┤
│  Barre de recherche                     │
├─────────────────────────────────────────┤
│  Statistiques (3 cards)                 │
├─────────────────────────────────────────┤
│  ┌─ Catégorie 1 ──────────────────┐   │
│  │  📁 Action / Shonen              │   │
│  │  [+] [✏️] [🗑️]                   │   │
│  │  ├─ Sous-catégorie 1            │   │
│  │  ├─ Sous-catégorie 2            │   │
│  │  └─ Sous-catégorie 3            │   │
│  └─────────────────────────────────┘   │
│  ┌─ Catégorie 2 ──────────────────┐   │
│  │  📁 Romance                      │   │
│  │  [+] [✏️] [🗑️]                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## API utilisées

### Catégories
- `getMangasCategoriesApi()` - Récupérer toutes les catégories
- `createMangasCategoryApi(data)` - Créer une catégorie
- `updateMangasCategoryApi(id, data)` - Mettre à jour une catégorie
- `deleteMangasCategoryApi(id)` - Supprimer une catégorie

### Sous-catégories
- `getMangasSubCategoriesApi()` - Récupérer toutes les sous-catégories
- `createMangasSubCategoryApi(data)` - Créer une sous-catégorie
- `updateMangasSubCategoryApi(id, data)` - Mettre à jour une sous-catégorie
- `deleteMangasSubCategoryApi(id)` - Supprimer une sous-catégorie

## Types TypeScript

```typescript
interface MangaCategory {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: MangaSubCategory[];
}

interface MangaSubCategory {
  id: number;
  name: string;
  description?: string;
  mangas_category_id: number;
  createdAt?: string;
  updatedAt?: string;
}
```

## Accès à la page

### URL
```
/mangas-categories
```

### Navigation
1. Via la sidebar : **Manga Category** (section Categories)
2. Via URL directe : `/mangas-categories`

### Permissions
- ⚠️ **SuperProtected** : Seuls les super-admins peuvent accéder à cette page

## UX Features

### États visuels
- **Loading** : Spinner centralisé pendant le chargement des données
- **Empty state** : Message "Aucune catégorie" si liste vide
- **Search empty** : Message "Aucun résultat trouvé" si recherche vide
- **Submitting** : Boutons désactivés avec spinner pendant les opérations

### Confirmations
- ❌ Confirmation avant suppression de catégorie
- ❌ Confirmation avant suppression de sous-catégorie

### Toasts (react-hot-toast)
- ✅ Succès : "Catégorie créée avec succès"
- ✅ Succès : "Sous-catégorie mise à jour avec succès"
- ❌ Erreur : "Le nom est requis"
- ❌ Erreur : "Erreur lors du chargement des données"

### Animations
- **Page enter** : Fade + translate from top (staggered)
- **Category expand** : Height animation smooth (0.2s)
- **SubCategory enter** : Fade + translate from left
- **Buttons** : Hover scale + rotate effects
- **Modal** : Scale + opacity animation

## Responsive Design

### Mobile (< 640px)
- Cards full width
- Stats en 1 colonne
- Buttons compacts
- Text sizes réduits

### Tablet (640px - 1024px)
- Stats en 2 colonnes
- Cards avec padding medium

### Desktop (> 1024px)
- Stats en 3 colonnes
- Cards avec padding large
- Max width 7xl (80rem)

## Design System

### Colors
- **Catégories** : Blue (primary)
- **Sous-catégories** : Green
- **Stats moyenne** : Purple
- **Actions delete** : Red
- **Actions edit** : Gray

### Icons (Lucide React)
- 📁 `Folder` / `FolderOpen` - Catégories
- 🏷️ `Tag` - Sous-catégories
- ➕ `Plus` - Créer
- ✏️ `Edit` - Modifier
- 🗑️ `Trash2` - Supprimer
- 🔍 `Search` - Recherche
- 🌳 `FolderTree` - Header icon
- ➡️ `ChevronRight` - Expand indicator
- 💾 `Save` - Enregistrer
- ❌ `X` - Fermer modal

## Build Status
✅ **Build successful** : 3.37s (0 TypeScript errors)
✅ **Bundle size** : 1,184.75 kB (307.80 kB gzipped)

## Future Enhancements
- [ ] Drag & drop pour réorganiser les catégories
- [ ] Import/Export CSV des catégories
- [ ] Bulk operations (suppression multiple)
- [ ] Statistiques avancées (nombre de mangas par catégorie)
- [ ] Images/icônes personnalisées pour les catégories
- [ ] Hiérarchie multi-niveaux (sous-sous-catégories)

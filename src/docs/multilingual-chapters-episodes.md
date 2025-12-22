# Multilingual Titles for Chapters & Episodes

## Overview
Extension du système de titres multilingues aux **chapitres** et **épisodes** de mangas, suivant le même pattern que celui déjà implémenté pour les mangas.

## Modifications apportées

### 1. **MangasChaptersPage.tsx** (Création de chapitre)
- ✅ Import de `MangaTitles`, `prepareTitlesForAPI`, `MangaTitlesField`
- ✅ Ajout du champ `titles: [] as MangaTitles` dans le state
- ✅ Préparation des titres avec `prepareTitlesForAPI()` avant envoi API
- ✅ Ajout du composant `MangaTitlesField` dans le formulaire
- ✅ Reset du champ `titles` après création réussie

### 2. **EditMangasChapterPage.tsx** (Modification de chapitre)
- ✅ Import de `MangaTitles`, `parseTitlesFromAPI`, `prepareTitlesForAPI`, `MangaTitlesField`
- ✅ Ajout du champ `titles: [] as MangaTitles` dans le state
- ✅ Parsing des titres avec `parseTitlesFromAPI()` lors du fetch
- ✅ Préparation des titres avec `prepareTitlesForAPI()` avant update
- ✅ Ajout du composant `MangaTitlesField` dans le formulaire

### 3. **UploadMangasEpisodePage.tsx** (Création d'épisode)
- ✅ Import de `MangaTitles`, `prepareTitlesForAPI`, `MangaTitlesField`
- ✅ Ajout du champ `titles: [] as MangaTitles` dans le state
- ✅ Ajout des titres au FormData avec `prepareTitlesForAPI()`
- ✅ Ajout du composant `MangaTitlesField` dans le formulaire
- ✅ Reset du champ `titles` après création réussie

## Format des données

### Structure JSON
Les titres sont envoyés en tant que JSON string :

```json
{
  "title": "Chapter 1",
  "description": "First chapter",
  "titles": "[{\"i18_language\":\"en\",\"title\":\"Chapter 1\",\"description\":\"First chapter\"},{\"i18_language\":\"ja\",\"title\":\"第1章\",\"description\":\"最初の章\"}]"
}
```

### Exemple de création de chapitre avec titres multilingues

**Requête POST** `/api/mangas-chapters/mangas/{mangaId}`
```json
{
  "title": "One Piece",
  "description": "Epic adventure",
  "chapter_number": 1,
  "titles": "[{\"i18_language\":\"en\",\"title\":\"One Piece\",\"description\":\"Epic pirate adventure\"},{\"i18_language\":\"ja\",\"title\":\"ワンピース\",\"description\":\"壮大な海賊の冒険\"}]"
}
```

### Exemple de mise à jour des titres

**Requête PUT** `/api/mangas-chapters/mangas/chapters/{chapterId}`
```json
{
  "titles": "[{\"i18_language\":\"fr\",\"title\":\"One Piece\",\"description\":\"Aventure épique de pirates\"},{\"i18_language\":\"es\",\"title\":\"One Piece\",\"description\":\"Aventura épica de piratas\"}]"
}
```

### Exemple de création d'épisode avec titres multilingues

**Requête POST** `/api/mangas-episodes/mangas/chapters/{chapterId}`
```json
{
  "name": "Episode 1",
  "number": "1",
  "description": "First episode",
  "titles": "[{\"i18_language\":\"en\",\"title\":\"Episode 1\",\"description\":\"First episode\"},{\"i18_language\":\"ja\",\"title\":\"エピソード1\",\"description\":\"最初のエピソード\"}]",
  "images": [/* Files */]
}
```

## Fonctionnalités du composant MangaTitlesField

### Interface utilisateur
- **Sélecteur de langues** : Ajouter/retirer des langues dynamiquement
- **Onglets par langue** : Un onglet pour chaque langue sélectionnée
- **Champs par langue** :
  - Titre (title)
  - Description (description)
- **Auto-fill** : Bouton pour traduire automatiquement via API
- **Validation** : Optionnel (required=false pour chapitres/épisodes)

### Langues supportées
10 langues disponibles :
- 🇩🇪 Allemand (de)
- 🇬🇧 Anglais (en)
- 🇪🇸 Espagnol (es)
- 🇫🇷 Français (fr)
- 🇮🇳 Hindi (hi)
- 🇮🇩 Indonésien (id)
- 🇯🇵 Japonais (ja)
- 🇰🇷 Coréen (ko)
- 🇻🇳 Vietnamien (vi)
- 🇨🇳 Chinois (zh)

## Flow de données

### Création (Create)
```typescript
// 1. User input dans MangaTitlesField
const titles: MangaTitles = [
  { i18_language: 'en', title: 'Chapter 1', description: 'First' },
  { i18_language: 'ja', title: '第1章', description: '最初' }
];

// 2. Préparation pour API
const titlesJson = prepareTitlesForAPI(titles);
// Result: "[{\"i18_language\":\"en\",\"title\":\"Chapter 1\",\"description\":\"First\"}...]"

// 3. Envoi à l'API
const data = {
  title: "Chapter 1",
  titles: titlesJson
};
await createMangasChapterApi(mangaId, data);
```

### Modification (Update)
```typescript
// 1. Fetch du chapitre
const chapter = await fetchChapter(chapterId);

// 2. Parsing des titres
const titles = parseTitlesFromAPI(chapter.titles);
// Result: MangaTitles array

// 3. Modification par l'user

// 4. Préparation et envoi
const updateData = {
  titles: prepareTitlesForAPI(modifiedTitles)
};
await updateChapter(chapterId, updateData);
```

## Utilitaires utilisés

### `prepareTitlesForAPI(titles: MangaTitles): string`
Convertit un tableau `MangaTitles` en JSON string pour l'API

```typescript
const titles = [
  { i18_language: 'en', title: 'Test', description: 'Desc' }
];
const json = prepareTitlesForAPI(titles);
// "[{\"i18_language\":\"en\",\"title\":\"Test\",\"description\":\"Desc\"}]"
```

### `parseTitlesFromAPI(titlesJson: string): MangaTitles`
Parse un JSON string de l'API en tableau `MangaTitles`

```typescript
const json = "[{\"i18_language\":\"en\",\"title\":\"Test\"}]";
const titles = parseTitlesFromAPI(json);
// [{ i18_language: 'en', title: 'Test', description: '' }]
```

## Compatibilité Backend

### Champs attendus par l'API

**Chapitres** (`/mangas-chapters`):
- `title` (string, required)
- `description` (string, optional)
- `titles` (string JSON, optional) ← **Nouveau**
- `chapter_number` (number, optional)
- `metadata` (object, optional)

**Épisodes** (`/mangas-episodes`):
- `name` (string, required)
- `number` (string, required)
- `description` (string, optional)
- `titles` (string JSON, optional) ← **Nouveau**
- `metadata` (string, optional)
- `images` (files, required)

### Format de retour attendu
```json
{
  "id": 1,
  "title": "Chapter 1",
  "description": "First chapter",
  "titles": "[{\"i18_language\":\"en\",\"title\":\"Chapter 1\"}]",
  "chapter_number": 1
}
```

## Validation

### Champs obligatoires
- **Chapitres** : `title` (required), `titles` (optional)
- **Épisodes** : `name` (required), `number` (required), `titles` (optional)

### Validation des titres
- Le composant `MangaTitlesField` est configuré avec `required={false}`
- Les titres multilingues sont **optionnels**
- Si aucun titre n'est saisi, le tableau reste vide `[]`
- La condition `if (form.titles.length > 0)` empêche l'envoi d'un tableau vide

## États du formulaire

### Initialisation
```typescript
const [form, setForm] = useState({
  title: "",
  description: "",
  titles: [] as MangaTitles, // ← Nouveau
  chapter_number: "",
  metadata: "",
});
```

### Reset après création
```typescript
setForm({ 
  title: "", 
  description: "", 
  titles: [], // ← Reset
  chapter_number: "", 
  metadata: "" 
});
```

## UI/UX

### Position dans le formulaire

**MangasChaptersPage** :
```
1. Titre du chapitre (required)
2. Numéro du chapitre (optional)
3. Description (optional)
4. 📝 Titres multilingues (optional) ← Nouveau
5. Boutons (Annuler / Créer)
```

**EditMangasChapterPage** :
```
1. Titre du chapitre (required)
2. Description (optional)
3. 📝 Titres multilingues (optional) ← Nouveau
4. Numéro du chapitre (optional)
5. Bouton (Enregistrer)
```

**UploadMangasEpisodePage** :
```
1. Nom de l'épisode (required)
2. Numéro de l'épisode (required)
3. Description (optional)
4. 📝 Titres multilingues (optional) ← Nouveau
5. Images de l'épisode (required)
6. Bouton (Créer l'épisode)
```

### Apparence
Le composant `MangaTitlesField` affiche :
- Un label : "Titres multilingues (optionnel)"
- Un sélecteur de langues avec menu dropdown
- Des onglets pour chaque langue sélectionnée
- Un bouton "Auto-fill" pour la traduction automatique
- Des champs titre/description pour chaque langue

## Testing

### Scénarios de test

1. **Création sans titres multilingues** ✅
   - Créer un chapitre avec seulement le titre principal
   - Vérifier que l'API reçoit bien les données de base

2. **Création avec titres multilingues** ✅
   - Ajouter 2-3 langues
   - Remplir les champs
   - Vérifier le format JSON envoyé

3. **Modification avec ajout de titres** ✅
   - Ouvrir un chapitre existant sans titres
   - Ajouter des titres multilingues
   - Sauvegarder et vérifier

4. **Modification avec update de titres** ✅
   - Ouvrir un chapitre avec titres
   - Modifier les titres existants
   - Sauvegarder et vérifier

5. **Auto-fill traduction** ✅
   - Saisir un titre en anglais
   - Cliquer sur "Auto-fill"
   - Vérifier les traductions générées

## Performance

### Optimisations
- ✅ Parsing uniquement si `titles` existe : `ch.titles ? parseTitlesFromAPI(ch.titles) : []`
- ✅ Envoi conditionnel : `if (form.titles.length > 0) { ... }`
- ✅ Pas de re-render inutile du composant MangaTitlesField
- ✅ Memo des calculs de transformation i18n

## Erreurs potentielles

### JSON parsing errors
```typescript
try {
  const titles = parseTitlesFromAPI(chapter.titles);
} catch (error) {
  console.error('Invalid titles JSON:', error);
  // Fallback to empty array
  const titles = [];
}
```

### API errors
- Toast error si échec de création/modification
- Validation côté frontend avant envoi
- Gestion des champs vides

## Migration

### Pour des chapitres/épisodes existants
Les chapitres/épisodes existants **sans** champ `titles` :
- Continuent de fonctionner normalement
- Affichent un champ vide dans MangaTitlesField
- Peuvent être mis à jour avec des titres multilingues

### Backward compatibility
- ✅ Ancien format supporté (sans `titles`)
- ✅ Nouveau format additionnel (avec `titles`)
- ✅ Pas de breaking change

## Build Status
✅ **0 TypeScript errors critiques**
⚠️ Quelques warnings CSS mineurs (conflits `block`/`flex`)

## Documentation liée
- `/src/docs/multilingual-manga-titles.md` - Documentation initiale des titres mangas
- `/src/docs/fix-autofill-not-filling-fields.md` - Résolution bugs auto-fill
- `/src/types/mangaTitles.ts` - Types TypeScript
- `/src/utils/mangaTitlesUtils.ts` - Utilitaires de conversion
- `/src/components/MangaTitlesField.tsx` - Composant réutilisable

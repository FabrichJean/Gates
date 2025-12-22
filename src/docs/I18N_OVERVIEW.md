# 🌍 Système d'Internationalisation (i18n) - Vue d'ensemble

## 📦 Structure du projet

```
src/
├── i18n.ts                          # 🎯 Export centralisé (POINT D'ENTRÉE)
├── types/
│   └── i18n.ts                      # Types TypeScript
├── components/
│   ├── I18nField.tsx                # Champ de saisie multilingue
│   ├── I18nText.tsx                 # Affichage de texte traduit
│   └── I18nComponents.tsx           # Wrappers utilitaires
├── hooks/
│   └── useI18nState.ts              # Hook de gestion d'état
├── utils/
│   └── i18nUtils.ts                 # Fonctions utilitaires
├── examples/
│   └── i18nExamples.tsx             # Exemples d'utilisation
└── docs/
    ├── I18N_README.md               # Documentation complète
    └── QUICK_START.md               # Guide de démarrage rapide
```

---

## ✨ Composants principaux

### 1. **I18nField** - Saisie multilingue
Le composant principal pour entrer du texte dans plusieurs langues.

```tsx
<I18nField
  value={title}
  onChange={setTitle}
  label="Titre"
  required
/>
```

**Features:**
- ✅ Onglets de langues avec drapeaux 🇬🇧 🇫🇷 🇪🇸
- ✅ Indicateur de progression (% traduit)
- ✅ Validation visuelle
- ✅ Animations fluides
- ✅ Support dark mode
- ✅ Input ou Textarea

---

### 2. **I18nText** - Affichage automatique
Détecte la langue du navigateur et affiche la bonne traduction.

```tsx
<I18nText
  content={{ en: "Hello", fr: "Bonjour" }}
  fallbackLang="en"
  as="h1"
/>
```

**Features:**
- ✅ Détection automatique de langue
- ✅ Fallback intelligent
- ✅ Support de tous les éléments HTML
- ✅ Compatible avec string simple

---

### 3. **useI18nState** - Hook de gestion
Hook personnalisé pour manipuler facilement les traductions.

```tsx
const title = useI18nState({ en: "Welcome" });

title.updateLanguage('fr', 'Bienvenue');
title.hasLanguage('fr'); // true
title.getLanguageCount(); // 2
```

---

## 🚀 Utilisation rapide

### Import simple
```tsx
import {
  I18nField,
  I18nText,
  useI18nState,
  prepareI18nForAPI,
  parseI18nFromAPI,
  TranslatedText,
} from '../i18n';
```

### Formulaire de création
```tsx
const [form, setForm] = useState({
  title: {} as TranslatedText,
  description: {} as TranslatedText,
});

<I18nField
  value={form.title}
  onChange={(title) => setForm({ ...form, title })}
  label="Titre"
  required
/>

// À la soumission
const data = {
  title: prepareI18nForAPI(form.title), // JSON string
};
```

### Affichage
```tsx
<I18nText
  content={parseI18nFromAPI(manga.title)}
  fallbackLang="en"
  as="h2"
/>
```

---

## 🌍 Langues supportées (9 langues)

| Code | Langue | Drapeau |
|------|--------|---------|
| `en` | English | 🇬🇧 |
| `fr` | Français | 🇫🇷 |
| `es` | Español | 🇪🇸 |
| `de` | Deutsch | 🇩🇪 |
| `pt` | Português | 🇵🇹 |
| `ar` | العربية | 🇸🇦 |
| `zh` | 中文 | 🇨🇳 |
| `ja` | 日本語 | 🇯🇵 |
| `ko` | 한국어 | 🇰🇷 |

Personnalisable via la prop `supportedLanguages`.

---

## 🛠️ Utilitaires disponibles

```tsx
// Sérialisation
serializeI18n({ en: "Hello" }) // → '{"en":"Hello"}'
deserializeI18n('{"en":"Hello"}') // → { en: "Hello" }

// Récupération
getTranslation(content, 'fr', 'en') // Avec fallback

// Validation
validateRequiredLanguage(content, 'en') // true/false
hasTranslation(content) // Vérifie si non vide
countTranslations(content) // Compte les langues remplies

// Nettoyage
cleanTranslations(content) // Retire les traductions vides

// Migration
convertLegacyToI18n("Old text") // → { en: "Old text" }

// API
prepareI18nForAPI(content) // Prépare pour l'envoi
parseI18nFromAPI(data) // Parse la réponse
```

---

## 📊 Format des données

### Frontend (TypeScript)
```tsx
const title: TranslatedText = {
  en: "One Piece",
  fr: "One Piece",
  es: "One Piece",
};
```

### API (JSON string)
```json
{
  "title": "{\"en\":\"One Piece\",\"fr\":\"One Piece\"}",
  "description": "{\"en\":\"A great manga\",\"fr\":\"Un super manga\"}"
}
```

### Base de données
```sql
-- Colonnes TEXT ou JSON
title TEXT, -- Stocke le JSON string
description TEXT
```

---

## ✅ Avantages

### 🎯 Flexible
- Support de 1 à 9 langues
- Personnalisable (langues, style, validation)
- Compatible avec les anciennes données

### 🚀 Performant
- Pas de re-render inutiles
- Lazy loading des traductions
- Animations optimisées

### 💪 Robuste
- TypeScript strict
- Validation intégrée
- Gestion d'erreurs
- Fallback automatique

### 🎨 UI Moderne
- Design élégant et professionnel
- Dark mode natif
- Animations fluides
- Indicateurs visuels clairs

### 📦 Réutilisable
- Composants indépendants
- Pas de dépendances externes (sauf Framer Motion)
- Facile à intégrer
- Documentation complète

---

## 📚 Documentation

- **Guide rapide:** `src/docs/QUICK_START.md`
- **Documentation complète:** `src/docs/I18N_README.md`
- **Exemples de code:** `src/examples/i18nExamples.tsx`
- **Types:** `src/types/i18n.ts`

---

## 🔄 Workflow complet

```
1. Utilisateur entre du texte
   └─> I18nField (Component)
       └─> useState (State)

2. Sauvegarde dans l'état
   └─> TranslatedText { en: "...", fr: "..." }

3. Envoi à l'API
   └─> prepareI18nForAPI()
       └─> JSON string

4. Stockage en base
   └─> Colonne TEXT/JSON

5. Récupération de l'API
   └─> parseI18nFromAPI()
       └─> TranslatedText

6. Affichage à l'utilisateur
   └─> I18nText (Component)
       └─> Détection langue navigateur
           └─> Affichage traduit
```

---

## 🎓 Cas d'usage

✅ **Mangas** - Titres et descriptions multilingues
✅ **Catégories** - Noms dans plusieurs langues
✅ **Tags** - Labels internationaux
✅ **Posts** - Contenu multilingue
✅ **Notifications** - Messages traduits
✅ **Settings** - Interface multilingue

---

## 🚀 Prochaines étapes

1. **Lire** `QUICK_START.md` pour débuter
2. **Essayer** les exemples dans `i18nExamples.tsx`
3. **Intégrer** dans EditMangasPage et UploadMangas
4. **Tester** avec différentes langues
5. **Adapter** le backend si nécessaire

---

## 💡 Tips

```tsx
// ✅ Bon - Toujours parser les données de l'API
<I18nText content={parseI18nFromAPI(manga.title)} />

// ✅ Bon - Toujours préparer avant l'envoi
formData.append("title", prepareI18nForAPI(form.title));

// ✅ Bon - Support des deux formats
<I18nText content={manga.title} /> // String ou TranslatedText

// ⚠️ Attention - Validation de la langue obligatoire
if (!validateRequiredLanguage(form.title, 'en')) {
  // Gérer l'erreur
}
```

---

## 🎉 Résumé

Vous avez maintenant un **système i18n complet et professionnel** :

- 🎯 **3 composants** principaux (Field, Text, Wrappers)
- 🪝 **1 hook** personnalisé (useI18nState)
- 🛠️ **12 utilitaires** pratiques
- 📚 **Documentation complète**
- 💻 **Exemples de code**
- 🌍 **9 langues** supportées
- ✨ **UI moderne** et élégante

**Prêt à l'emploi !** 🚀

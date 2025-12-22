# Système d'Internationalisation (i18n)

Un système complet, réutilisable et flexible pour gérer les titres et descriptions multilingues dans votre application.

## 📦 Composants

### 1. **I18nField** - Champ de saisie multilingue
Composant principal pour entrer du texte dans plusieurs langues.

```tsx
import I18nField from './components/I18nField';
import { TranslatedText } from './types/i18n';

const [title, setTitle] = useState<TranslatedText>({});

<I18nField
  value={title}
  onChange={setTitle}
  label="Titre"
  fieldType="input"
  required
  supportedLanguages={['en', 'fr', 'es']}
/>
```

**Props:**
- `value`: Objet contenant les traductions `{ en: "...", fr: "..." }`
- `onChange`: Callback quand le contenu change
- `label`: Label du champ
- `fieldType`: `'input'` ou `'textarea'`
- `required`: Si la première langue est obligatoire
- `placeholder`: Texte placeholder personnalisé
- `rows`: Nombre de lignes (pour textarea)
- `supportedLanguages`: Langues à afficher (défaut: `['en', 'fr', 'es', 'de', 'pt']`)

**Features:**
- ✅ Onglets de langues avec drapeaux
- ✅ Indicateur de complétion (% traduit)
- ✅ Badges de statut par langue
- ✅ Animations fluides
- ✅ Support dark mode
- ✅ Validation visuelle

---

### 2. **I18nText** - Affichage de texte traduit
Affiche automatiquement le texte dans la langue du navigateur.

```tsx
import I18nText from './components/I18nText';

<I18nText
  content={{ en: "Hello", fr: "Bonjour", es: "Hola" }}
  fallbackLang="en"
  as="h1"
  className="text-3xl font-bold"
/>
```

**Props:**
- `content`: Objet de traductions ou string simple
- `fallbackLang`: Langue de secours (défaut: `'en'`)
- `defaultLang`: Force une langue spécifique
- `as`: Type d'élément HTML (`'p'`, `'span'`, `'h1'`, etc.)
- `className`: Classes CSS

**Logique de sélection:**
1. Langue spécifiée (`defaultLang`)
2. Langue du navigateur
3. Langue de fallback
4. Première langue disponible

---

### 3. **useI18nState** - Hook de gestion d'état
Hook personnalisé pour manipuler facilement les contenus multilingues.

```tsx
import { useI18nState } from './hooks/useI18nState';

const title = useI18nState({ en: "Welcome" });

// Mettre à jour
title.updateLanguage('fr', 'Bienvenue');

// Vérifier
title.isEmpty // boolean
title.hasLanguage('fr') // boolean
title.getLanguageCount() // number

// Nettoyer
title.clearLanguage('fr');
title.clearAll();

// Sérialisation
const json = title.toJSON();
title.fromJSON(json);
```

---

## 🛠️ Utilitaires

### Fichier: `utils/i18nUtils.ts`

```tsx
import {
  serializeI18n,
  deserializeI18n,
  getTranslation,
  hasTranslation,
  countTranslations,
  cleanTranslations,
  validateRequiredLanguage,
  convertLegacyToI18n,
  prepareI18nForAPI,
  parseI18nFromAPI,
} from './utils/i18nUtils';

// Sérialisation
const json = serializeI18n({ en: "Hello" }); // '{"en":"Hello"}'

// Désérialisation
const obj = deserializeI18n('{"en":"Hello"}'); // { en: "Hello" }

// Obtenir traduction
getTranslation({ en: "Hello", fr: "Bonjour" }, 'fr'); // "Bonjour"

// Validation
validateRequiredLanguage({ en: "Hello" }, 'en'); // true

// Nettoyage
cleanTranslations({ en: "Hello", fr: "" }); // { en: "Hello" }

// Migration
convertLegacyToI18n("Old text"); // { en: "Old text" }

// Préparation API
prepareI18nForAPI({ en: "Hello" }); // JSON string propre
parseI18nFromAPI('{"en":"Hello"}'); // Objet TranslatedText
```

---

## 🎯 Cas d'usage

### **1. Formulaire de création**

```tsx
const MangaCreateForm: React.FC = () => {
  const [form, setForm] = useState({
    ref: '',
    title: {} as TranslatedText,
    description: {} as TranslatedText,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ref: form.ref,
      title: prepareI18nForAPI(form.title), // JSON string
      description: prepareI18nForAPI(form.description),
    };

    await api.createManga(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.ref}
        onChange={(e) => setForm({ ...form, ref: e.target.value })}
      />

      <I18nField
        value={form.title}
        onChange={(title) => setForm({ ...form, title })}
        label="Titre"
        required
      />

      <I18nField
        value={form.description}
        onChange={(description) => setForm({ ...form, description })}
        label="Description"
        fieldType="textarea"
      />

      <button type="submit">Créer</button>
    </form>
  );
};
```

### **2. Affichage de contenu**

```tsx
const MangaCard: React.FC<{ manga: Manga }> = ({ manga }) => {
  // Parser les données de l'API
  const title = parseI18nFromAPI(manga.title);
  const description = parseI18nFromAPI(manga.description);

  return (
    <div>
      <I18nText
        content={title}
        fallbackLang="en"
        as="h2"
        className="font-bold"
      />
      
      <I18nText
        content={description}
        fallbackLang="en"
        as="p"
        className="text-gray-600"
      />
    </div>
  );
};
```

### **3. Formulaire d'édition**

```tsx
const MangaEditForm: React.FC = () => {
  const { mangaId } = useParams();
  const [form, setForm] = useState({
    title: {} as TranslatedText,
    description: {} as TranslatedText,
  });

  useEffect(() => {
    // Charger depuis l'API
    const fetchManga = async () => {
      const manga = await api.getManga(mangaId);
      
      setForm({
        title: parseI18nFromAPI(manga.title),
        description: parseI18nFromAPI(manga.description),
      });
    };
    
    fetchManga();
  }, [mangaId]);

  const handleSubmit = async () => {
    await api.updateManga(mangaId, {
      title: prepareI18nForAPI(form.title),
      description: prepareI18nForAPI(form.description),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <I18nField
        value={form.title}
        onChange={(title) => setForm({ ...form, title })}
        label="Titre"
      />
      <I18nField
        value={form.description}
        onChange={(description) => setForm({ ...form, description })}
        label="Description"
        fieldType="textarea"
      />
      <button type="submit">Sauvegarder</button>
    </form>
  );
};
```

---

## 🌍 Langues supportées

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

---

## 📊 Format des données

### Frontend (TypeScript)
```tsx
interface TranslatedText {
  [key: string]: string;
}

const title: TranslatedText = {
  en: "One Piece",
  fr: "One Piece",
  es: "One Piece",
};
```

### Backend (JSON string)
```json
{
  "title": "{\"en\":\"One Piece\",\"fr\":\"One Piece\",\"es\":\"One Piece\"}",
  "description": "{\"en\":\"A great manga\",\"fr\":\"Un super manga\"}"
}
```

### Base de données
```sql
-- Option 1: Colonne JSON/TEXT
title JSON,
description TEXT,

-- Option 2: Colonnes séparées (migration)
title VARCHAR(255),
title_i18n JSON,
description TEXT,
description_i18n TEXT,
```

---

## 🔄 Migration depuis l'ancien format

Si vous avez déjà des champs `title` et `description` en string simple:

```tsx
// Avant
manga.title = "One Piece"; // string
manga.description = "A great manga"; // string

// Après (migration)
manga.title = { en: "One Piece" }; // TranslatedText
manga.description = { en: "A great manga" };

// Ou utiliser l'utilitaire
manga.title = convertLegacyToI18n("One Piece", 'en');
```

---

## ✅ Validation

```tsx
import { validateRequiredLanguage } from './utils/i18nUtils';

// Dans votre formulaire
const isValid = validateRequiredLanguage(form.title, 'en');

if (!isValid) {
  toast.error("Le titre en anglais est requis");
  return;
}
```

---

## 🎨 Personnalisation

### Changer les langues par défaut
```tsx
<I18nField
  supportedLanguages={['en', 'fr', 'ja']}
  // ...
/>
```

### Styling personnalisé
Le composant supporte toutes les classes Tailwind et le dark mode par défaut.

---

## 🚀 Performances

- ✅ Lazy loading des traductions
- ✅ Memoization des calculs
- ✅ Animations optimisées avec Framer Motion
- ✅ Pas de re-render inutiles

---

## 📝 Notes importantes

1. **Toujours** utiliser `prepareI18nForAPI()` avant d'envoyer à l'API
2. **Toujours** utiliser `parseI18nFromAPI()` lors de la réception de données
3. La première langue de `supportedLanguages` est considérée comme obligatoire
4. Le composant détecte automatiquement la langue du navigateur
5. Les traductions vides sont ignorées lors de la sérialisation

---

## 🐛 Debugging

```tsx
// Afficher l'état actuel
console.log('Titre:', form.title);

// Vérifier si vide
console.log('Est vide:', hasTranslation(form.title));

// Compter les traductions
console.log('Nombre de langues:', countTranslations(form.title));

// Nettoyer et afficher
console.log('Nettoyé:', cleanTranslations(form.title));
```

---

## 📚 Exemples complets

Voir le fichier `examples/i18nExamples.tsx` pour des exemples détaillés.

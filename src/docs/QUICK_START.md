# Guide de Démarrage Rapide - Système i18n

## Installation (déjà fait ✅)

Tous les fichiers sont déjà créés dans votre projet :
- ✅ Components
- ✅ Hooks
- ✅ Types
- ✅ Utilities
- ✅ Examples

## 🚀 Utilisation en 3 étapes

### 1️⃣ Import

```tsx
import { I18nField, I18nText, prepareI18nForAPI, parseI18nFromAPI } from '../i18n';
import type { TranslatedText } from '../i18n';
```

### 2️⃣ État du formulaire

```tsx
const [form, setForm] = useState({
  ref: '',
  title: {} as TranslatedText,
  description: {} as TranslatedText,
});
```

### 3️⃣ Utiliser les composants

```tsx
<I18nField
  value={form.title}
  onChange={(title) => setForm({ ...form, title })}
  label="Titre"
  required
/>
```

---

## 📝 Exemple complet pour EditMangasPage.tsx

```tsx
import { I18nField } from '../i18n';
import type { TranslatedText } from '../i18n';
import { prepareI18nForAPI, parseI18nFromAPI } from '../i18n';

// 1. Ajouter les types au formulaire
const [form, setForm] = useState({
  ref: "",
  title: {} as TranslatedText,      // ← NOUVEAU
  description: {} as TranslatedText, // ← NOUVEAU
  mangas_category_id: "",
  // ... autres champs
});

// 2. Charger les données de l'API
const fetchManga = async () => {
  const manga = await getMangaById(Number(mangaId));
  
  setForm({
    ref: manga.ref || "",
    title: parseI18nFromAPI(manga.title),           // ← Parse JSON
    description: parseI18nFromAPI(manga.description), // ← Parse JSON
    // ... autres champs
  });
};

// 3. Ajouter les champs dans le JSX
<form onSubmit={handleSubmit}>
  <input name="ref" value={form.ref} onChange={handleChange} />
  
  {/* NOUVEAU: Champs multilingues */}
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
  
  {/* ... autres champs */}
</form>

// 4. Préparer pour l'API lors de la soumission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append("ref", form.ref);
  formData.append("title", prepareI18nForAPI(form.title));           // ← Sérialize
  formData.append("description", prepareI18nForAPI(form.description)); // ← Sérialize
  
  await updateManga(mangaId, formData);
};
```

---

## 🎯 Exemple pour Mangas.tsx (Liste/Affichage)

```tsx
import { I18nText, parseI18nFromAPI } from '../i18n';

// Dans l'interface
interface Manga {
  id: number;
  ref: string;
  title: string | TranslatedText; // ← Support des deux formats
  description?: string | TranslatedText;
  // ...
}

// Dans le rendu
<I18nText
  content={parseI18nFromAPI(manga.title)}
  fallbackLang="en"
  className="font-semibold"
/>

<I18nText
  content={parseI18nFromAPI(manga.description)}
  fallbackLang="en"
  className="text-xs text-gray-500"
/>
```

---

## ✨ Wrapper rapide (optionnel)

Pour encore plus de simplicité:

```tsx
import { I18nContentFields } from '../i18n';

<I18nContentFields
  title={form.title}
  description={form.description}
  onTitleChange={(title) => setForm({ ...form, title })}
  onDescriptionChange={(description) => setForm({ ...form, description })}
/>
```

---

## 🔄 Backend (modifications nécessaires)

### Base de données

```sql
-- Option 1: Colonnes JSON
ALTER TABLE mangas ADD COLUMN title_i18n JSON;
ALTER TABLE mangas ADD COLUMN description_i18n TEXT;

-- Option 2: Remplacer les colonnes existantes
ALTER TABLE mangas MODIFY COLUMN title TEXT; -- Stocker JSON
ALTER TABLE mangas MODIFY COLUMN description TEXT;
```

### API (Express/Node.js)

```javascript
// Créer/Mettre à jour
router.post('/mangas', async (req, res) => {
  const { ref, title, description } = req.body;
  
  // title et description sont déjà des strings JSON
  await db.query(
    'INSERT INTO mangas (ref, title, description) VALUES (?, ?, ?)',
    [ref, title, description] // Sauvegarder directement
  );
});

// Récupérer
router.get('/mangas/:id', async (req, res) => {
  const manga = await db.query('SELECT * FROM mangas WHERE id = ?', [req.params.id]);
  
  // Renvoyer tel quel, le frontend parse automatiquement
  res.json(manga);
});
```

---

## 🎨 Personnalisation

### Changer les langues supportées

```tsx
<I18nField
  supportedLanguages={['en', 'fr', 'ja']}
  // ...
/>
```

### Validation personnalisée

```tsx
import { validateRequiredLanguage } from '../i18n';

if (!validateRequiredLanguage(form.title, 'en')) {
  toast.error("Le titre en anglais est requis");
  return;
}
```

---

## 📚 Ressources

- Documentation complète: `src/docs/I18N_README.md`
- Exemples détaillés: `src/examples/i18nExamples.tsx`
- Types: `src/types/i18n.ts`
- Utilitaires: `src/utils/i18nUtils.ts`

---

## ✅ Checklist d'intégration

- [ ] Ajouter `TranslatedText` aux interfaces TypeScript
- [ ] Mettre à jour les états des formulaires
- [ ] Remplacer les champs input/textarea par `<I18nField>`
- [ ] Utiliser `prepareI18nForAPI()` avant l'envoi
- [ ] Utiliser `parseI18nFromAPI()` à la réception
- [ ] Utiliser `<I18nText>` pour l'affichage
- [ ] Mettre à jour la base de données
- [ ] Tester avec plusieurs langues

---

## 🐛 Problèmes courants

**Q: Les données ne s'affichent pas**
```tsx
// ❌ Mauvais
<div>{manga.title}</div>

// ✅ Bon
<I18nText content={parseI18nFromAPI(manga.title)} />
```

**Q: Erreur lors de la sauvegarde**
```tsx
// ❌ Mauvais
formData.append("title", form.title);

// ✅ Bon
formData.append("title", prepareI18nForAPI(form.title));
```

**Q: Comment migrer les données existantes ?**
```tsx
// Convertir les anciennes données
const migratedTitle = convertLegacyToI18n(oldManga.title, 'en');
```

/**
 * Guide d'intégration pour les fichiers existants du projet
 * Montre comment ajouter l'i18n aux pages Mangas existantes
 */

// ============================================================================
// 1. EditMangasPage.tsx - Modifications nécessaires
// ============================================================================

/*
// Imports à ajouter en haut du fichier
import { I18nField } from '../components/I18nField';
import type { TranslatedText } from '../types/i18n';
import { prepareI18nForAPI, parseI18nFromAPI } from '../utils/i18nUtils';

// Modifier l'état du formulaire
const [form, setForm] = useState({
  ref: "",
  title: {} as TranslatedText,           // ← AJOUTER
  description: {} as TranslatedText,      // ← AJOUTER
  mangas_category_id: "",
  mangas_sub_category_id: "",
  mangas_plateform_id: "",
  tagCategories: [] as Array<number | { name: string }>,
  creator: "",
  creator_id: "",
  total_chapters: "",
  need_vip: false,
  plateform_id: "",
  cover: null as File | null,
});

// Dans fetchManga(), ajouter le parsing
const fetchManga = async () => {
  setLoading(true);
  try {
    const res = await getMangaById(Number(mangaId));
    const manga = res.data || res;
    
    let tagIds: number[] = [];
    if (manga.tagCategories && Array.isArray(manga.tagCategories)) {
      tagIds = manga.tagCategories.map((t: any) => t.id);
    }
    
    setForm({
      ref: manga.ref || "",
      title: parseI18nFromAPI(manga.title),           // ← AJOUTER
      description: parseI18nFromAPI(manga.description), // ← AJOUTER
      mangas_category_id: manga.mangas_category_id ? String(manga.mangas_category_id) : "",
      // ... reste du code
    });
  } catch (err: any) {
    toast.error("Erreur lors du chargement du manga");
  } finally {
    setLoading(false);
  }
};

// Dans handleSubmit(), préparer pour l'API
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    
    // Parcourir tous les champs
    for (const [key, value] of Object.entries(form)) {
      if (key === "tagCategories") {
        formData.append("tagCategories", JSON.stringify(value));
      } else if (key === "title") {
        formData.append("title", prepareI18nForAPI(value as TranslatedText)); // ← AJOUTER
      } else if (key === "description") {
        formData.append("description", prepareI18nForAPI(value as TranslatedText)); // ← AJOUTER
      } else if (key === "cover") {
        formData.append("cover", value as File);
      } else {
        formData.append(key, String(value));
      }
    }

    await updateManga(Number(mangaId), formData);
    toast.success("Manga mis à jour avec succès!");
    navigate("/mangas");
  } catch (err: any) {
    toast.error("Erreur lors de la mise à jour du manga");
  } finally {
    setLoading(false);
  }
};

// Dans le JSX, remplacer les champs texte
<form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
  <div>
    <label className="block font-medium mb-1">Référence (ref)</label>
    <input name="ref" value={form.ref} onChange={handleChange} className="input input-bordered w-full" required />
  </div>
  
  {/* REMPLACER LES ANCIENS CHAMPS PAR *//*}
  <I18nField
    value={form.title}
    onChange={(title) => setForm({ ...form, title })}
    label="Titre"
    fieldType="input"
    required
  />
  
  <I18nField
    value={form.description}
    onChange={(description) => setForm({ ...form, description })}
    label="Description"
    fieldType="textarea"
    rows={6}
  />
  
  {/* ... reste du formulaire *//*}
</form>
*/

// ============================================================================
// 2. UploadMangas.tsx - Modifications nécessaires
// ============================================================================

/*
// Même structure que EditMangasPage.tsx

// Imports
import { I18nField } from '../components/I18nField';
import type { TranslatedText } from '../types/i18n';
import { prepareI18nForAPI } from '../utils/i18nUtils';

// État
const [form, setForm] = useState({
  ref: "",
  title: {} as TranslatedText,       // ← AJOUTER
  description: {} as TranslatedText,  // ← AJOUTER
  mangas_category_id: "",
  // ... autres champs
});

// handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (key === "tagCategories") {
        formData.append("tagCategories", JSON.stringify(value));
      } else if (key === "title") {
        formData.append("title", prepareI18nForAPI(value as TranslatedText)); // ← AJOUTER
      } else if (key === "description") {
        formData.append("description", prepareI18nForAPI(value as TranslatedText)); // ← AJOUTER
      } else if (key === "cover" && value) {
        formData.append("cover", value as File);
      } else if (value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    await createMangaApi(formData);
    toast.success("Manga créé avec succès!");
    
    // Reset form
    setForm({
      ref: "",
      title: {} as TranslatedText,       // ← AJOUTER
      description: {} as TranslatedText,  // ← AJOUTER
      mangas_category_id: "",
      // ... autres champs
    });
    setCoverPreview(null);
    
  } catch (err: any) {
    toast.error("Erreur lors de la création du manga");
  } finally {
    setLoading(false);
  }
};

// JSX - remplacer les champs
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
  rows={6}
/>
*/

// ============================================================================
// 3. Mangas.tsx (Liste) - Modifications pour l'affichage
// ============================================================================

/*
// Imports
import { I18nText } from '../components/I18nText';
import { parseI18nFromAPI } from '../utils/i18nUtils';
import type { TranslatedText } from '../types/i18n';

// Interface Manga
interface Manga {
  id: number;
  ref: string;
  title?: string | TranslatedText;     // ← MODIFIER (support des 2 formats)
  description?: string | TranslatedText; // ← MODIFIER
  cover?: string;
  cover_url?: string;
  // ... autres champs
}

// Vue Grille - Remplacer l'affichage du titre
<div className="flex-1">
  <I18nText
    content={parseI18nFromAPI(manga.title || manga.ref)}
    fallbackLang="en"
    as="h3"
    className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
  />
  {manga.description && (
    <I18nText
      content={parseI18nFromAPI(manga.description)}
      fallbackLang="en"
      as="p"
      className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1"
    />
  )}
</div>

// Vue Table - Remplacer l'affichage
<td className="px-6 py-4">
  <div className="flex flex-col gap-1">
    <I18nText
      content={parseI18nFromAPI(manga.title || manga.ref)}
      fallbackLang="en"
      as="div"
      className="font-medium text-gray-900 dark:text-gray-100"
    />
    {manga.description && (
      <I18nText
        content={parseI18nFromAPI(manga.description)}
        fallbackLang="en"
        as="p"
        className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs"
      />
    )}
  </div>
</td>
*/

// ============================================================================
// 4. MangasDetailsPage.tsx - Modifications pour l'affichage détaillé
// ============================================================================

/*
// Imports
import { I18nText } from '../components/I18nText';
import { parseI18nFromAPI } from '../utils/i18nUtils';
import type { TranslatedText } from '../types/i18n';

// Interface
interface Manga {
  id: number;
  ref: string;
  title?: string | TranslatedText;     // ← AJOUTER
  description?: string | TranslatedText; // ← AJOUTER
  // ... autres champs
}

// En-tête - Remplacer le titre
<I18nText
  content={parseI18nFromAPI(manga.title || manga.ref)}
  fallbackLang="en"
  as="h1"
  className="text-4xl font-bold text-gray-900 dark:text-gray-100"
/>

{manga.description && (
  <I18nText
    content={parseI18nFromAPI(manga.description)}
    fallbackLang="en"
    as="p"
    className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl"
  />
)}

// Section Informations - Ajouter les champs
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {manga.title && (
    <div className="space-y-2 md:col-span-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">Titre</p>
      <I18nText
        content={parseI18nFromAPI(manga.title)}
        fallbackLang="en"
        as="p"
        className="font-semibold text-gray-900 dark:text-gray-100 text-lg"
      />
    </div>
  )}

  {manga.description && (
    <div className="space-y-2 md:col-span-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
      <I18nText
        content={parseI18nFromAPI(manga.description)}
        fallbackLang="en"
        as="p"
        className="text-gray-700 dark:text-gray-300 leading-relaxed"
      />
    </div>
  )}
  
  {/* ... autres champs *//*}
</div>
*/

// ============================================================================
// 5. Backend (API) - Modifications nécessaires
// ============================================================================

/*
// Base de données - Migration SQL
ALTER TABLE mangas ADD COLUMN title_i18n TEXT AFTER title;
ALTER TABLE mangas ADD COLUMN description_i18n TEXT AFTER description;

// Ou remplacer les colonnes existantes
ALTER TABLE mangas MODIFY COLUMN title TEXT;
ALTER TABLE mangas MODIFY COLUMN description TEXT;

// Routes API (Express.js exemple)
router.post('/mangas', async (req, res) => {
  const { ref, title, description, ...otherFields } = req.body;
  
  // title et description sont déjà des JSON strings
  const manga = await Manga.create({
    ref,
    title, // Sauvegarder directement (JSON string)
    description, // Sauvegarder directement (JSON string)
    ...otherFields
  });
  
  res.json(manga);
});

router.get('/mangas/:id', async (req, res) => {
  const manga = await Manga.findById(req.params.id);
  
  // Renvoyer tel quel
  // Le frontend parse automatiquement avec parseI18nFromAPI()
  res.json(manga);
});

router.put('/mangas/:id', async (req, res) => {
  const { title, description, ...otherFields } = req.body;
  
  await Manga.update(req.params.id, {
    title, // JSON string
    description, // JSON string
    ...otherFields
  });
  
  res.json({ success: true });
});
*/

// ============================================================================
// 6. Notes importantes
// ============================================================================

/*
TOUJOURS:
- ✅ Utiliser parseI18nFromAPI() quand on reçoit des données
- ✅ Utiliser prepareI18nForAPI() quand on envoie des données
- ✅ Supporter les deux formats (string et TranslatedText) pour la compatibilité
- ✅ Ajouter fallbackLang="en" pour la langue de secours

NE JAMAIS:
- ❌ Envoyer directement l'objet TranslatedText sans sérialisation
- ❌ Afficher manga.title directement (utiliser I18nText)
- ❌ Oublier le parsing lors de la réception

VALIDATION:
- La première langue est obligatoire si required={true}
- Les autres langues sont optionnelles
- Utilisez validateRequiredLanguage() pour vérifier
*/

export {};

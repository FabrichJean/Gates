/**
 * Exemple d'utilisation du système i18n pour les mangas
 * 
 * Ce fichier montre comment intégrer les composants i18n dans vos formulaires
 */

import React, { useState } from 'react';
import I18nField from '../components/I18nField';
import I18nText from '../components/I18nText';
import { useI18nState } from '../hooks/useI18nState';
import type { TranslatedText } from '../types/i18n';
import { prepareI18nForAPI, parseI18nFromAPI } from '../utils/i18nUtils';

/**
 * EXEMPLE 1: Formulaire de création de manga avec i18n
 */
const ExampleMangaForm: React.FC = () => {
  const [formData, setFormData] = useState({
    ref: '',
    title: {} as TranslatedText,
    description: {} as TranslatedText,
    // ... autres champs
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données pour l'API
    const dataToSend = {
      ref: formData.ref,
      title: prepareI18nForAPI(formData.title), // Convertit en JSON string
      description: prepareI18nForAPI(formData.description),
    };

    // Envoyer à l'API
    console.log('Data to send:', dataToSend);
    // await createManga(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ référence classique */}
      <div>
        <label>Référence</label>
        <input
          value={formData.ref}
          onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
          required
        />
      </div>

      {/* Champ titre multilingue */}
      <I18nField
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        label="Titre"
        fieldType="input"
        required
      />

      {/* Champ description multilingue */}
      <I18nField
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        label="Description"
        fieldType="textarea"
        rows={6}
      />

      <button type="submit">Créer le manga</button>
    </form>
  );
};

/**
 * EXEMPLE 2: Affichage d'un manga avec traductions
 */
interface MangaDisplayProps {
  manga: {
    id: number;
    ref: string;
    title: string | TranslatedText; // Peut être les deux formats
    description: string | TranslatedText;
  };
}

const ExampleMangaDisplay: React.FC<MangaDisplayProps> = ({ manga }) => {
  // Parser les données de l'API (string JSON vers objet)
  const title = parseI18nFromAPI(manga.title);
  const description = parseI18nFromAPI(manga.description);

  return (
    <div>
      {/* Affiche automatiquement dans la langue du navigateur */}
      <I18nText
        content={title}
        fallbackLang="en"
        as="h1"
        className="text-3xl font-bold"
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

/**
 * EXEMPLE 3: Utilisation avec le hook useI18nState
 */
const ExampleWithHook: React.FC = () => {
  const title = useI18nState({ en: 'Welcome' });

  return (
    <div>
      <I18nField
        value={title.value}
        onChange={title.setValue}
        label="Titre"
      />

      {/* Informations */}
      <div className="mt-4">
        <p>Nombre de langues: {title.getLanguageCount()}</p>
        <p>Est vide: {title.isEmpty ? 'Oui' : 'Non'}</p>
        <p>A français: {title.hasLanguage('fr') ? 'Oui' : 'Non'}</p>
      </div>

      {/* Actions */}
      <button onClick={() => title.updateLanguage('fr', 'Bienvenue')}>
        Ajouter français
      </button>
      <button onClick={() => title.clearLanguage('fr')}>
        Supprimer français
      </button>
      <button onClick={title.clearAll}>
        Tout effacer
      </button>
    </div>
  );
};

/**
 * EXEMPLE 4: Migration depuis l'ancien format
 */
const ExampleMigration: React.FC = () => {
  // Ancien format (string simple)
  const oldManga = {
    title: 'One Piece',
    description: 'A great manga',
  };

  // Nouveau format avec migration
  const [title, setTitle] = useState<TranslatedText>({
    en: oldManga.title, // Convertir l'ancien titre en anglais
  });

  const [description, setDescription] = useState<TranslatedText>({
    en: oldManga.description,
  });

  return (
    <div>
      <I18nField value={title} onChange={setTitle} label="Titre" />
      <I18nField value={description} onChange={setDescription} label="Description" fieldType="textarea" />
    </div>
  );
};

export {
  ExampleMangaForm,
  ExampleMangaDisplay,
  ExampleWithHook,
  ExampleMigration,
};

import React from 'react';
import I18nField from './I18nField';
import I18nText from './I18nText';
import type { TranslatedText } from '../types/i18n';

/**
 * Composant wrapper qui combine titre et description i18n
 * Pour une utilisation rapide dans les formulaires
 */
interface I18nContentFieldsProps {
  title: TranslatedText;
  description: TranslatedText;
  onTitleChange: (value: TranslatedText) => void;
  onDescriptionChange: (value: TranslatedText) => void;
  titleRequired?: boolean;
  descriptionRequired?: boolean;
  supportedLanguages?: string[];
}

export const I18nContentFields: React.FC<I18nContentFieldsProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  titleRequired = true,
  descriptionRequired = false,
  supportedLanguages,
}) => {
  return (
    <div className="space-y-6">
      <I18nField
        value={title}
        onChange={onTitleChange}
        label="Titre"
        fieldType="input"
        required={titleRequired}
        supportedLanguages={supportedLanguages as any}
      />

      <I18nField
        value={description}
        onChange={onDescriptionChange}
        label="Description"
        fieldType="textarea"
        required={descriptionRequired}
        rows={6}
        supportedLanguages={supportedLanguages as any}
      />
    </div>
  );
};

/**
 * Composant pour afficher titre et description traduits
 */
interface I18nContentDisplayProps {
  title: TranslatedText | string;
  description?: TranslatedText | string;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const I18nContentDisplay: React.FC<I18nContentDisplayProps> = ({
  title,
  description,
  titleClassName = 'text-2xl font-bold',
  descriptionClassName = 'text-gray-600 dark:text-gray-400',
  titleAs = 'h2',
}) => {
  return (
    <div className="space-y-2">
      <I18nText
        content={title}
        as={titleAs}
        className={titleClassName}
        fallbackLang="en"
      />
      
      {description && (
        <I18nText
          content={description}
          as="p"
          className={descriptionClassName}
          fallbackLang="en"
        />
      )}
    </div>
  );
};

export { I18nField, I18nText };

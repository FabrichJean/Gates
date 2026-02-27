import React from 'react';
import { useI18n } from '../context/I18nProvider';
import { DEFAULT_LANGUAGES, LANGUAGE_NAMES } from '../types/i18n';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n();

  return (
    <div className={className}>
      <label className="sr-only">Language</label>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="px-2 py-1 rounded border"
      >
        {DEFAULT_LANGUAGES.map(l => (
          <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;

import React from "react";
import { FileText, Globe, Languages } from "lucide-react";
// TODO: Replace with the correct type import if available
// import type { PostForAppTitle } from "../../hooks/usePostForApp";
type PostForAppTitle = {
  id: string;
  post_for_app_id: string;
  i18_language: string;
  title: string;
  description?: string;
};

interface Props {
  postTitles?: PostForAppTitle[];
}

const LanguageBadge: React.FC<{ languageCode: string }> = ({ languageCode }) => {
  const getLanguageInfo = (code: string) => {
    const languages: Record<string, { name: string; flag: string }> = {
      'en': { name: 'English', flag: '🇺🇸' },
      'fr': { name: 'Français', flag: '🇫🇷' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'de': { name: 'Deutsch', flag: '🇩🇪' },
      'it': { name: 'Italiano', flag: '🇮🇹' },
      'pt': { name: 'Português', flag: '🇵🇹' },
      'ru': { name: 'Русский', flag: '🇷🇺' },
      'ja': { name: '日本語', flag: '🇯🇵' },
      'ko': { name: '한국어', flag: '🇰🇷' },
      'zh': { name: '中文', flag: '🇨🇳' },
      'ar': { name: 'العربية', flag: '🇸🇦' },
      'hi': { name: 'हिन्दी', flag: '🇮🇳' },
    };

    return languages[code] || { name: code.toUpperCase(), flag: '🌍' };
  };

  const { name, flag } = getLanguageInfo(languageCode);

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
      <span>{flag}</span>
      {name}
    </span>
  );
};


import { useState } from "react";

export default function GetPostForAppTitles({ postTitles }: Props) {
  if (!postTitles || postTitles.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          标题
        </h3>
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">无可用标题</p>
        </div>
      </div>
    );
  }

  // Grouper les titres par langue
  const titlesByLanguage = postTitles.reduce((acc, title) => {
    if (!acc[title.i18_language]) {
      acc[title.i18_language] = [];
    }
    acc[title.i18_language].push(title);
    return acc;
  }, {} as Record<string, PostForAppTitle[]>);

  const languageCodes = Object.keys(titlesByLanguage);
  const [selectedLang, setSelectedLang] = useState(languageCodes[0]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        多语言标题 ({postTitles.length})
      </h3>

      {/* Switcher de langue ergonomique */}
      <div className="flex flex-wrap gap-2 mb-6">
        {languageCodes.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setSelectedLang(lang)}
            className={`flex items-center gap-2 rounded-full text-sm font-medium border transition-colors duration-200
              ${selectedLang === lang
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700'}
            `}
          >
            <LanguageBadge languageCode={lang} />
          </button>
        ))}
      </div>

      {/* Affichage ergonomique d'une seule langue */}
      <div className="grid grid-cols-1">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header de langue */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <LanguageBadge languageCode={selectedLang} />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {titlesByLanguage[selectedLang].length} 标题{titlesByLanguage[selectedLang].length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
            {titlesByLanguage[selectedLang].map((title) => (
              <ErgoTitleCard key={title.id} title={title} />
            ))}
          </div>
        </div>
      </div>

      {/* Résumé global compact */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
          <Globe className="w-4 h-4" />
          <span className="font-medium">语言概览</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(titlesByLanguage).map(([languageCode, titles]) => (
            <div key={languageCode} className="flex items-center gap-2 text-sm">
              <LanguageBadge languageCode={languageCode} />
              <span className="text-blue-700 dark:text-blue-400">
                {titles.length} 标题{titles.length > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Carte ergonomique pour chaque titre
  function ErgoTitleCard({ title }: { title: PostForAppTitle }) {
    const [showDesc, setShowDesc] = React.useState(true);
    return (
      <div className="p-4 group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-white text-base truncate flex-1">{title.title}</span>
        </div>
        {title.description && (
          <div className="mt-1">
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-300 hover:underline focus:outline-none"
              onClick={() => setShowDesc((v) => !v)}
            >
              {showDesc ? '隐藏描述' : '查看描述'}
            </button>
            <div className={`transition-all duration-200 overflow-hidden ${showDesc ? 'max-h-40 mt-2' : 'max-h-0'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {title.description}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>ID: {title.id}</span>
          <span>语言代码: {title.i18_language}</span>
        </div>
      </div>
    );
  }
}
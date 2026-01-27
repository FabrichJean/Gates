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

export default function GetPostForAppTitles({ postTitles }: Props) {
  if (!postTitles || postTitles.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Titres
        </h3>
        <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">Aucun titre disponible</p>
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

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Titres ({postTitles.length})
      </h3>

      <div className="space-y-4">
        {Object.entries(titlesByLanguage).map(([languageCode, titles]) => (
          <div key={languageCode} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header de langue */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <LanguageBadge languageCode={languageCode} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {titles.length} titre{titles.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Liste des titres */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {titles.map((title) => (
                <div key={title.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="space-y-3">
                    {/* Titre principal */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {title.title}
                      </h4>
                    </div>

                    {/* Description */}
                    {title.description && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {title.description}
                        </p>
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>ID: {title.id}</span>
                        <span>Post ID: {title.post_for_app_id}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {title.i18_language}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Résumé global */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
          <Globe className="w-4 h-4" />
          <span className="font-medium">Résumé des langues</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(titlesByLanguage).map(([languageCode, titles]) => (
            <div key={languageCode} className="flex items-center gap-2 text-sm">
              <LanguageBadge languageCode={languageCode} />
              <span className="text-blue-700 dark:text-blue-400">
                {titles.length} titre{titles.length > 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useI18n } from "../../../i18n";

export default function TitlesEditor(props: {
  languages: { id: number; name: string; code: string }[];
  selectedLanguage: { id: number; name: string; code: string } | null;
  setSelectedLanguage: (l: { id: number; name: string; code: string } | null) => void;
  titles: { [key: number]: string };
  descriptions: { [key: number]: string };
  handleTitleChange: (languageId: number, value: string) => void;
  handleDescriptionChange: (languageId: number, value: string) => void;
  setShowAddLanguageModal: (v: boolean) => void;
  handleRemoveLanguage: (languageId: number) => void;
}) {
  const { languages, selectedLanguage, setSelectedLanguage, titles, descriptions, handleTitleChange, handleDescriptionChange, setShowAddLanguageModal, handleRemoveLanguage } = props;
  const { t } = useI18n();
  const addTitleLabel = t("posts.edit.add_title");


  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t("posts.edit.titles_and_descriptions")}</label>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {languages.length > 0 && languages.map((language) => (
          <>
            <div className="relative inline-block">
              <button
                key={language.id}
                type="button"
                onClick={() => setSelectedLanguage(language)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 ${selectedLanguage?.id === language.id
                  ? "bg-transparent border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {language.name}
              </button>

              {/* Bouton X superposé */}
              <button
                type="button"
                onClick={() => handleRemoveLanguage(language.id)}
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2
               bg-red-400 dark:bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>

              </button>
            </div>
          </>
        ))}

        <button type="button" onClick={() => setShowAddLanguageModal(true)} className="px-3 py-2 text-sm font-medium bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400 rounded-md transition-colors duration-200 flex items-center space-x-1" title={t("posts.edit.add_language_tooltip")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>{addTitleLabel}</span>
        </button>
      </div>

      <div className="space-y-4 w-full">
        {languages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">{t("posts.edit.titles_empty").replace("{action}", addTitleLabel)}</p>
          </div>
        ) : (
          <>
            {selectedLanguage && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("posts.edit.title_label").replace("{language}", selectedLanguage.name)}
                </label>
                <input type="text" value={titles[selectedLanguage.id] || ""} onChange={(e) => handleTitleChange(selectedLanguage.id, e.target.value)} placeholder={t("posts.edit.title_placeholder").replace("{language}", selectedLanguage.name)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300" />
              </div>
            )}

            {selectedLanguage && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("posts.edit.description_label").replace("{language}", selectedLanguage.name)}
                </label>
                <textarea value={descriptions[selectedLanguage.id] || ""} onChange={(e) => handleDescriptionChange(selectedLanguage.id, e.target.value)} placeholder={t("posts.edit.description_placeholder").replace("{language}", selectedLanguage.name)} rows={4} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-vertical" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

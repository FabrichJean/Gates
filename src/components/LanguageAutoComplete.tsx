import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import { useI18n } from "../i18n";

type Language = {
  code: string;
  name: string;
};

const LanguageAutoComplete = ({ onSelect, defaultValue }: { onSelect?: (lang: Language) => void, defaultValue?: Language }) => {
  const { t } = useI18n();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [filtered, setFiltered] = useState<Language[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger toutes les langues depuis iso-639-1
  useEffect(() => {
    axios.get<Language[]>(apiURL + "/i18languages", {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(res => {
      const allLanguages = res.data;

      allLanguages.sort((a, b) => a.name.localeCompare(b.name));
      setLanguages(allLanguages);
    });
  }, []);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrage auto-complete
  useEffect(() => {
    // if (!query) {
    //   setFiltered([]);
    //   return;
    // }
    // const f = languages.filter(
    //   (lang) =>
    //     lang.name.toLowerCase().includes(query.toLowerCase()) ||
    //     lang.code.toLowerCase().includes(query.toLowerCase())
    // );
    setFiltered(languages);
  }, [languages]);

  const handleSelect = (lang: Language) => {
    setQuery(lang.name);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(lang);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={t("language.autocomplete.placeholder")}
        className="flex-1  border-b-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none p-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg dark:shadow-gray-900/50 transition-colors duration-300">
          {filtered.map((lang) => (
            <li
              key={lang.code}
              className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer text-gray-900 dark:text-gray-100 transition-colors duration-200"
              onClick={() => handleSelect(lang)}
            >
              {lang.name} ({lang.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageAutoComplete;

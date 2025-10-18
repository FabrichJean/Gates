import { useState, useEffect } from "react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

type Language = {
  code: string;
  name: string;
};

const LanguageAutoComplete = ({ onSelect, defaultValue }: { onSelect?: (lang: Language) => void, defaultValue?: Language }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [filtered, setFiltered] = useState<Language[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger toutes les langues depuis iso-639-1
  useEffect(() => {
    axios.get<Language[]>(apiURL + "/i18languages", {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(res => {
      const allLanguages = res.data;
      console.log(allLanguages);

      allLanguages.sort((a, b) => a.name.localeCompare(b.name));
      setLanguages(allLanguages);
    });
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
    console.log(lang);

    setQuery(lang.name);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(lang);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Enter a language..."
        className="flex-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none p-2 bg-transparent"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filtered.map((lang) => (
            <li
              key={lang.code}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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

import { useState, useEffect } from "react";
import ISO6391 from "iso-639-1";

type Language = {
  code: string;
  name: string;
};

const LanguageAutoComplete = ({ onSelect }: { onSelect?: (lang: Language) => void }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Language[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger toutes les langues depuis iso-639-1
  useEffect(() => {
    const allLanguages = ISO6391.getAllCodes().map((code) => ({
      code,
      name: ISO6391.getName(code),
    }));
    allLanguages.sort((a, b) => a.name.localeCompare(b.name));
    setLanguages(allLanguages);
  }, []);

  // Filtrage auto-complete
  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    const f = languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query.toLowerCase()) ||
        lang.code.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(f);
  }, [query, languages]);

  const handleSelect = (lang: Language) => {
    setQuery(lang.name);
    setShowDropdown(false);
    if (onSelect) {
        onSelect(lang);
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-gray-700 font-medium mb-2">Langue</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Tapez pour chercher une langue..."
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

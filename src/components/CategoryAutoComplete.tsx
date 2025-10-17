import { useState, useEffect } from "react";
import axios from "axios";
import { apiURL, token } from "../constant";

export type Category =
  { id: number, name: string, createdAt: Date, updatedAt: Date }

const CategoryAutoComplete = ({ onSelect, defaultValue }: { onSelect?: (lang: Category) => void, defaultValue?: Category }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger toutes les langues depuis iso-639-1
  useEffect(() => {
    axios.get<Category[]>(apiURL + "/categories", {
      headers: { Authorization: `Bearer ${token()}` },
    }).then(res => {
      const all = res.data;
      console.log(all);
      setCategories(all);
      setFiltered(all);
    });
  }, []);

  // Filtrage auto-complete
  useEffect(() => {
    // if (!query) {
    //   setFiltered([]);
    //   return;
    // }
    // const f = categories.filter(
    //   (lang) =>
    //     lang.name.toLowerCase().includes(query.toLowerCase()) ||
    //     lang.id.toString().includes(query.toLowerCase())
    // );
    setFiltered(categories);
  }, [query, categories]);

  const handleSelect = (lang: Category) => {
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
        placeholder="Enter category..."
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none transition"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filtered.map((flt) => (
            <li
              key={flt.id}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(flt)}
            >
              {flt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryAutoComplete;

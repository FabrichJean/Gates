import { useState, useEffect } from "react";
import axios from "axios";
import { apiURL, token } from "../constant";
import type { SubCategory } from "../hooks/useSubCategory";

const SubCategoryAutoComplete = ({ onSelect, defaultValue, categoryId }: { onSelect?: (lang: SubCategory) => void, defaultValue?: SubCategory, categoryId: number | undefined }) => {
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [filtered, setFiltered] = useState<SubCategory[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger toutes les langues depuis iso-639-1
  useEffect(() => {
    axios.get<{SubCategorys: SubCategory[]}>(apiURL + "/sub-categories", {
      headers: { Authorization: `Bearer ${token()}` },
      params: {
        category_id: categoryId
      }
    }).then(res => {
      const all = res.data.SubCategorys;
      setCategories(all);
      setFiltered(all);
    });
  }, [categoryId]);

  // Filtrage auto-complete
  useEffect(() => {
    setFiltered(categories);
  }, [query, categories]);

  const handleSelect = (lang: SubCategory) => {
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
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

export default SubCategoryAutoComplete;

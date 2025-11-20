import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export type Category = {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: Partial<Category>[]
};

interface Props {
  onSelect?: (category: Category) => void;
  defaultValue?: Category;
}

const CategoryAutoComplete = ({ onSelect, defaultValue }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(defaultValue?.name || "");
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  console.log(filtered);
  

  // Référence pour détecter le clic à l'extérieur
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger toutes les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>(`${apiURL}/categories`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setCategories(res.data || []);
        setFiltered(res.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  // Filtrer la liste selon la saisie
  useEffect(() => {
    const f = (query && categories.length > 0)
      ? categories?.filter((cat) =>
          cat.name.toLowerCase().includes(query.toLowerCase())
        )
      : categories;

    setFiltered(f);
  }, [query, categories]);

  // Fermer le menu lorsqu'on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (category: Category) => {
    setQuery(category.name);
    setShowDropdown(false);
    onSelect?.(category);
  };

  console.log(showDropdown);
  

  return (
    <div ref={dropdownRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Enter category..."
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 focus:ring-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none transition-all duration-300"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg animate-fadeIn transition-colors duration-300">
          {filtered.map((cat) => (
            <li
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors duration-200"
            >
              {cat.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryAutoComplete;

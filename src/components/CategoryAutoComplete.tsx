import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export type Category = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
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

  // Référence pour détecter le clic à l'extérieur
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger toutes les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<Category[]>(`${apiURL}/categories`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setCategories(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  // Filtrer la liste selon la saisie
  useEffect(() => {
    const f = query
      ? categories.filter((cat) =>
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
        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
      />

      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg animate-fadeIn">
          {filtered.map((cat) => (
            <li
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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

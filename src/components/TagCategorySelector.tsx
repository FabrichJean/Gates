import React, { useEffect, useState, useRef } from "react";
import usePostTagCategories from "../hooks/usePostTagCategories";


interface TagCategorySelectorProps {
  selected: (number | string | { id?: number; name: string })[];
  setSelected: (tags: (number | string | { id?: number; name: string })[]) => void;
  allowCustomTag?: boolean;
}


const TagCategorySelector: React.FC<TagCategorySelectorProps> = ({ selected, setSelected, allowCustomTag }) => {
  const { items, loading } = usePostTagCategories();
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper pour savoir si un tag (id) est sélectionné
  const isSelected = (tag: any) => {
    return selected.some(
      (t) =>
        (typeof t === "number" && t === tag.id) ||
        (typeof t === "string" && t === tag.name) ||
        (typeof t === "object" && t.id === tag.id) ||
        (typeof t === "object" && !t.id && t.name === tag.name)
    );
  };

  const handleToggle = (tag: any) => {
    if (isSelected(tag)) {
      setSelected(selected.filter((t) => {
        if (typeof t === "number") return t !== tag.id;
        if (typeof t === "string") return t !== tag.name;
        if (typeof t === "object") {
          if (t.id && tag.id) return t.id !== tag.id;
          if (!t.id && !tag.id) return t.name !== tag.name;
          return true;
        }
        return true;
      }));
    } else {
      setSelected([...selected, tag.id ? { id: tag.id, name: tag.name } : { name: tag.name }]);
    }
    setInput("");
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleAddCustom = () => {
    const val = input.trim();
    if (!val) return;
    // Ne pas ajouter si déjà présent
    if (selected.some(t => (typeof t === "string" && t === val) || (typeof t === "object" && t.name === val))) return;
    setSelected([...selected, { name: val }]);
    setInput("");
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.focus();
  };

  if (loading) return <div className="text-gray-500 text-sm">Chargement des tags...</div>;

  // Filtrage des suggestions (autocomplete)
  const filteredItems = input.trim()
    ? items.filter((tag: any) => tag.name.toLowerCase().includes(input.trim().toLowerCase()) && !isSelected(tag))
    : items.filter((tag: any) => !isSelected(tag));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((t, i) => {
          let key = typeof t === "string" ? t : (typeof t === "object" && t !== null && "id" in t && t.id ? `id-${t.id}` : (typeof t === "object" && t !== null && "name" in t ? `name-${t.name}` : i));
          let label = typeof t === "string" ? t : (typeof t === "object" && t !== null && "name" in t ? t.name : (typeof t === "object" && t !== null && "id" in t && t.id ? t.id : ""));
          return (
            <span
              key={key}
              className="px-3 py-1.5 rounded-full border text-sm font-medium bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700 flex items-center gap-1"
            >
              #{label}
              <button
                type="button"
                className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none"
                onClick={() => handleToggle(typeof t === "object" ? t : { name: t })}
                title="Retirer"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      {allowCustomTag && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
            placeholder="Ajouter ou rechercher un tag..."
            className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            autoComplete="off"
          />
          {/* Dropdown suggestions */}
          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto">
              {filteredItems.map((tag: any) => (
                <button
                  key={tag.id}
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  onMouseDown={() => handleToggle(tag)}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
          {/* Ajout rapide si pas de suggestion et input non vide */}
          {showDropdown && input.trim() && filteredItems.length === 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                onMouseDown={handleAddCustom}
              >
                Ajouter "{input.trim()}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagCategorySelector;

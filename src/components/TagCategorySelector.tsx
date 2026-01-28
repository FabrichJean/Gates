import React, { useEffect, useState } from "react";
import usePostTagCategories from "../hooks/usePostTagCategories";


interface TagCategorySelectorProps {
  selected: (number | string | { id?: number; name: string })[];
  setSelected: (tags: (number | string | { id?: number; name: string })[]) => void;
  allowCustomTag?: boolean;
}


const TagCategorySelector: React.FC<TagCategorySelectorProps> = ({ selected, setSelected, allowCustomTag }) => {
  const { items, loading } = usePostTagCategories();
  const [input, setInput] = useState("");

  // Helper pour savoir si un tag (id) est sélectionné
  const isSelected = (tag: any) => {
    return selected.some(
      (t) =>
        (typeof t === "number" && t === tag.id) ||
        (typeof t === "string" && t === tag.name) ||
        (typeof t === "object" && t.id === tag.id)
    );
  };

  const handleToggle = (tag: any) => {
    if (isSelected(tag)) {
      setSelected(selected.filter((t) => {
        if (typeof t === "number") return t !== tag.id;
        if (typeof t === "string") return t !== tag.name;
        if (typeof t === "object") return t.id !== tag.id;
        return true;
      }));
    } else {
      setSelected([...selected, { id: tag.id, name: tag.name }]);
    }
  };

  const handleAddCustom = () => {
    const val = input.trim();
    if (!val) return;
    // Ne pas ajouter si déjà présent
    if (selected.some(t => (typeof t === "string" && t === val) || (typeof t === "object" && t.name === val))) return;
    setSelected([...selected, { name: val }]);
    setInput("");
  };

  if (loading) return <div className="text-gray-500 text-sm">Chargement des tags...</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((tag: any) => (
          <button
            key={tag.id}
            type="button"
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150
              ${isSelected(tag)
                ? 'bg-blue-600 text-white border-blue-600 shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700'}
            `}
            onClick={() => handleToggle(tag)}
          >
            #{tag.name}
          </button>
        ))}
        {/* Affiche les tags custom (non présents dans items) */}
        {selected
          .filter(
            t =>
              typeof t === "string" ||
              (typeof t === "object" && t !== null && "name" in t && !("id" in t && t.id))
          )
          .map((t, i) => (
            <span
              key={typeof t === "string" ? t : (typeof t === "object" && t !== null && "name" in t ? t.name : "")}
              className="px-3 py-1.5 rounded-full border text-sm font-medium bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
            >
              #{typeof t === "string" ? t : (typeof t === "object" && t !== null && "name" in t ? t.name : "")}
            </span>
          ))}
      </div>
      {allowCustomTag && (
        <form className="flex gap-2" onSubmit={handleAddCustom}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ajouter un tag..."
            className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handleAddCustom} type="button" className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Ajouter</button>
        </form>
      )}
    </div>
  );
};

export default TagCategorySelector;

import React, { useEffect, useState, useRef } from "react";
import usePostTagCategories from "../hooks/usePostTagCategories";

interface Tag {
  id?: number;
  name: string;
}

interface TagCategorySelectorProps {
  selected: Tag[];
  setSelected: (tags: Tag[]) => void;
  allowCustomTag?: boolean;
}

const TagCategorySelector: React.FC<TagCategorySelectorProps> = ({ 
  selected, 
  setSelected, 
  allowCustomTag = true 
}) => {
  const { items, loading } = usePostTagCategories();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les tags en fonction de la recherche
  const filteredTags = items.filter((tag: any) =>
    tag.name.toLowerCase().includes(input.toLowerCase()) &&
    !selected.some(s => s.id === tag.id || s.name === tag.name)
  );

  // Vérifier si le tag saisi existe déjà
  const exactMatch = items.find((tag: any) => 
    tag.name.toLowerCase() === input.trim().toLowerCase()
  );

  // Option pour créer un nouveau tag
  const showCreateOption = allowCustomTag && 
    input.trim() && 
    !exactMatch &&
    !selected.some(s => s.name.toLowerCase() === input.trim().toLowerCase());

  const suggestions = [...filteredTags];
  if (showCreateOption) {
    suggestions.push({ name: input.trim(), isNew: true });
  }

  // Gérer la sélection d'un tag
  const handleSelectTag = (tag: any) => {
    if (tag.isNew) {
      setSelected([...selected, { name: tag.name }]);
    } else {
      setSelected([...selected, { id: tag.id, name: tag.name }]);
    }
    setInput("");
    setIsOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  // Supprimer un tag sélectionné
  const handleRemoveTag = (tagToRemove: Tag) => {
    setSelected(selected.filter(t => 
      !(t.id === tagToRemove.id && t.name === tagToRemove.name)
    ));
  };

  // Navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[highlightedIndex]) {
          handleSelectTag(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setInput("");
        break;
      case "Backspace":
        if (!input && selected.length > 0) {
          handleRemoveTag(selected[selected.length - 1]);
        }
        break;
    }
  };

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll automatique vers l'élément surligné
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector('[data-highlighted="true"]');
      highlighted?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  if (loading) {
    return <div className="text-gray-500 text-sm">Chargement des tags...</div>;
  }

  return (
    <div className="relative">
      {/* Zone de saisie avec tags sélectionnés */}
      <div className="min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition">
        {/* Tags sélectionnés */}
        {selected.map((tag, index) => (
          <span
            key={`${tag.id || tag.name}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
          >
            #{tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition"
              aria-label={`Retirer ${tag.name}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Input de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Rechercher ou ajouter des tags..." : ""}
          className="flex-1 min-w-[150px] outline-none bg-transparent text-sm placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && (input || suggestions.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
        >
          {suggestions.length === 0 && !showCreateOption ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Aucun tag trouvé
            </div>
          ) : (
            <ul>
              {suggestions.map((tag: any, index) => (
                <li key={tag.id || tag.name}>
                  <button
                    type="button"
                    data-highlighted={index === highlightedIndex}
                    onClick={() => handleSelectTag(tag)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      index === highlightedIndex
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tag.isNew ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>
                            Créer <span className="font-medium">#{tag.name}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-medium">#{tag.name}</span>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Aide visuelle */}
      {selected.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
            Backspace
          </kbd>{" "}
          pour supprimer le dernier tag
        </div>
      )}
    </div>
  );
};

export default TagCategorySelector;